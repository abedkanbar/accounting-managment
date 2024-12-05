import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { operationSchema, type OperationFormData } from '../lib/schemas';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useReferenceData } from '@/hooks/useReferenceData';
import { PaymentMethodType, OperationsTypes } from '@/lib/api';

interface OperationFormProps {
  onSubmit: (data: OperationFormData) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function OperationForm({
  onSubmit,
  initialData,
  isLoading = false,
}: OperationFormProps) {
  const {
    months,
    bankAccounts,
    agentPerceptor,
    contactcotisant,
    getContactName,
  } = useReferenceData();
  const [openPercepteur, setOpenPercepteur] = useState(false);
  const [openCotisant, setOpenCotisant] = useState(false);
  const [searchPercepteur, setSearchPercepteur] = useState('');
  const [searchCotisant, setSearchCotisant] = useState('');

  const form = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      libelle: initialData?.libelle || '',
      dateoperation: initialData?.dateoperation
        ? new Date(initialData.dateoperation)
        : new Date(),
      idtypeoperation: initialData?.idtypeoperation || 1,
      refoperation: initialData?.refoperation || '',
      moyenpaiement: initialData?.moyenpaiement || 1,
      refcheque: initialData?.refcheque || '',
      credit: initialData?.credit || 0,
      debit: initialData?.debit || 0,
      idcontactpercepteur: initialData?.idcontactpercepteur || undefined,
      idcontactcotisant: initialData?.idcontactcotisant || undefined,
      anneecotisation: initialData?.anneecotisation || new Date().getFullYear(),
      moiscotisation: initialData?.moiscotisation || new Date().getMonth() + 1,
      idcomptedestination: initialData?.idcomptedestination || undefined,
    },
  });

  const handleFormSubmit = async (data: OperationFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  // Filtrer les contacts en fonction de la recherche
  const filteredPercepteurs = agentPerceptor.filter((contact) =>
    `${contact.prenom} ${contact.nom}`
      .toLowerCase()
      .includes(searchPercepteur.toLowerCase())
  );

  const filteredCotisants = contactcotisant.filter((contact) =>
    `${contact.prenom} ${contact.nom}`
      .toLowerCase()
      .includes(searchCotisant.toLowerCase())
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 h-[calc(100vh-10rem)] overflow-y-auto pr-4"
      >
        <FormField
          control={form.control}
          name="libelle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Libellé</FormLabel>
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
            name="dateoperation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'opération</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="credit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crédit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="debit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Débit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
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
            name="moyenpaiement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moyen de paiement</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un moyen de paiement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PaymentMethodType.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="refcheque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ref cheque</FormLabel>
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
            name="idcontactpercepteur"
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
                                  'idcontactpercepteur',
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
            name="idcontactcotisant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cotisant</FormLabel>
                <Popover open={openCotisant} onOpenChange={setOpenCotisant}>
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
                          : 'Sélectionner un cotisant'}
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
                        placeholder="Rechercher un cotisant..."
                        value={searchCotisant}
                        onValueChange={setSearchCotisant}
                      />
                      <CommandEmpty>Aucun cotisant trouvé.</CommandEmpty>
                      <ScrollArea className="h-72">
                        <CommandGroup>
                          {filteredCotisants.map((contact) => (
                            <CommandItem
                              key={contact.idcontact}
                              onSelect={() => {
                                form.setValue(
                                  'idcontactcotisant',
                                  contact.idcontact
                                );
                                setOpenCotisant(false);
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="idcomptedestination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compte de destination</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un compte" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem
                        key={account.idcompte}
                        value={account.idcompte.toString()}
                      >
                        {account.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="idtypeoperation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'opération</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {OperationsTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="anneecotisation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année cotisation</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value ? parseInt(value) : '');
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="moiscotisation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mois cotisation</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un mois" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value.toString()}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData?.idoperation ? 'Mise à jour...' : 'Création...'}
              </>
            ) : initialData?.idoperation ? (
              'Mettre à jour'
            ) : (
              'Créer'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
