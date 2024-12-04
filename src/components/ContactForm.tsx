import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { format } from 'date-fns';
import { useReferenceData } from '../hooks/useReferenceData';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  initialData?: Partial<ContactFormData>;
}

export function ContactForm({ onSubmit, initialData }: ContactFormProps) {
  const { agentPerceptor, getContactName } = useReferenceData();
  const [searchPercepteur, setSearchPercepteur] = useState('');
  const [openPercepteur, setOpenPercepteur] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      prenom: initialData?.prenom || '',
      nom: initialData?.nom || '',
      alias: initialData?.alias || '',
      adherent: initialData?.adherent || false,
      membrefondateur: initialData?.membrefondateur || false,
      membrecotisant: initialData?.membrecotisant || false,
      donateur: initialData?.donateur || false,
      agentrecette: initialData?.agentrecette || false,
      dateadhesion: initialData?.dateadhesion || new Date(),
      fonction: initialData?.fonction || '',
      telfix: initialData?.telfix || '',
      fax: initialData?.fax || '',
      mobile: initialData?.mobile || '',
      adresse1: initialData?.adresse1 || '',
      codepostal: initialData?.codepostal || '',
      ville: initialData?.ville || '',
      adresse2: initialData?.adresse2 || '',
      pays: initialData?.pays || 'France',
      email: initialData?.email || '',
      montantcotisation: initialData?.montantcotisation || 0,
      idagentrecetteref: initialData?.idagentrecetteref || '',
    },
  });

  const filteredPercepteurs = agentPerceptor.filter((contact) =>
    `${contact.prenom} ${contact.nom}`
      .toLowerCase()
      .includes(searchPercepteur.toLowerCase())
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 h-[calc(100vh-10rem)] overflow-y-auto pr-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="montantcotisation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant cotisation</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="idagentrecetteref"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Percepteur</FormLabel>
              <Popover open={openPercepteur} onOpenChange={setOpenPercepteur}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? getContactName(field.value)
                        : 'Sélectionner un percepteur'}
                      <Check className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[400px] p-0"
                  side="bottom"
                  align="start"
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Rechercher un percepteur..."
                      value={searchPercepteur}
                      onValueChange={setSearchPercepteur}
                    />
                    <CommandEmpty>Aucun percepteur trouvé.</CommandEmpty>
                    <ScrollArea className="h-72">
                      <CommandGroup>
                        {filteredPercepteurs.map((contact) => (
                          <CommandItem
                            key={contact.idcontact}
                            onSelect={() => {
                              form.setValue(
                                'idagentrecetteref',
                                contact.idcontact
                              );
                              setOpenPercepteur(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                contact.idcontact === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {contact.prenom} {contact.nom}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone mobile</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telfix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone fixe</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fax</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="adresse1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adresse2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse 2</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="codepostal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code postal</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ville"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fonction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fonction</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateadhesion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'adhésion</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={format(field.value, 'yyyy-MM-dd')}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="adherent"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? true : false)
                    }
                  />
                </FormControl>
                <FormLabel>Adhérent</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="membrefondateur"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? true : false)
                    }
                  />
                </FormControl>
                <FormLabel>Membre fondateur</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="membrecotisant"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? true : false)
                    }
                  />
                </FormControl>
                <FormLabel>Membre cotisant</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="donateur"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? true : false)
                    }
                  />
                </FormControl>
                <FormLabel>Donateur</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agentrecette"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? true : false)
                    }
                  />
                </FormControl>
                <FormLabel>Agent de recette</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            {initialData ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
