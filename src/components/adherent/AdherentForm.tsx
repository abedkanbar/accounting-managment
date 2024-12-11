import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adherentSchema, type AdherentFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandLoading,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect, useRef } from "react";
import { Contact, getContacts } from "@/lib/api";

interface AdherentFormProps {
  onSubmit: (data: AdherentFormData) => void;
  initialData?: Partial<AdherentFormData>;
  contacts: Contact[];
  isEdit?: boolean;
}

export function AdherentForm({ onSubmit, initialData, contacts: initialContacts, isEdit = false }: AdherentFormProps) {
  const [openContact, setOpenContact] = useState(false);
  const [searchContact, setSearchContact] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>(initialContacts);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    initialData?.idcotisantecole
      ? initialContacts.find(c => c.idcontact === initialData.idcotisantecole) || null
      : null
  );

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const form = useForm<AdherentFormData>({
    resolver: zodResolver(adherentSchema),
    defaultValues: {
      idcotisantecole: initialData?.idcotisantecole || 0,
      anneescolaire: initialData?.anneescolaire || new Date().getFullYear(),
      nbenfants: initialData?.nbenfants || 0,
    },
  });

  const searchContacts = useCallback(async (search: string) => {
    if (!search || search.length < 3) {
      setSearchResults(initialContacts);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const searchTerm = search.toLowerCase().trim();
      
      // First, check local contacts
      const localMatches = initialContacts.filter(contact => {
        const fullName = `${contact.prenom} ${contact.nom}`.toLowerCase();
        const reverseName = `${contact.nom} ${contact.prenom}`.toLowerCase();
        return fullName.includes(searchTerm) || reverseName.includes(searchTerm);
      });

      // If no exact local matches, search API
      if (localMatches.length === 0) {
        const response = await getContacts(
          1, 
          10, 
          undefined, 
          undefined, 
          undefined, 
          undefined, 
          undefined, 
          'nom', 
          'asc',
          searchTerm
        );

        // Filter out duplicates
        const apiResults = response.data.filter(
          newContact => !initialContacts.some(
            existingContact => existingContact.idcontact === newContact.idcontact
          )
        );

        setSearchResults([...localMatches, ...apiResults]);
      } else {
        setSearchResults(localMatches);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [initialContacts]);

  const handleSearchChange = (value: string) => {
    setSearchContact(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      searchContacts(value);
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    form.setValue("idcotisantecole", contact.idcontact);
    setOpenContact(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="idcotisantecole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <Popover open={openContact && !isEdit} onOpenChange={setOpenContact}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={isEdit}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {selectedContact 
                        ? `${selectedContact.prenom} ${selectedContact.nom}`
                        : "Sélectionner un contact"}
                      <Check className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Rechercher un contact... (min. 3 caractères)"
                      value={searchContact}
                      onValueChange={handleSearchChange}
                    />
                    {isSearching && (
                      <CommandLoading>
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Recherche en cours...</span>
                        </div>
                      </CommandLoading>
                    )}
                    {!isSearching && searchResults.length === 0 && (
                      <CommandEmpty>Aucun contact trouvé.</CommandEmpty>
                    )}
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {searchResults
                        .sort((a, b) => a.nom.localeCompare(b.nom))
                        .map((contact) => (
                          <CommandItem
                            key={contact.idcontact}
                            onSelect={() => handleSelectContact(contact)}
                            className="flex items-center justify-between"
                          >
                            <span>{contact.prenom} {contact.nom}</span>
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                contact.idcontact === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="anneescolaire"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année scolaire</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={2000}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nbenfants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre d'enfants</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">
            {isEdit ? "Mettre à jour" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
