import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appelCotisationEcoleSchema, type AppelCotisationEcoleFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { Contact } from "@/lib/api";

interface AppelCotisationEcoleFormProps {
  onSubmit: (data: AppelCotisationEcoleFormData) => void;
  initialData?: Partial<AppelCotisationEcoleFormData>;
  contacts: Contact[];
}

export function AppelCotisationEcoleForm({ onSubmit, initialData, contacts }: AppelCotisationEcoleFormProps) {
  const form = useForm<AppelCotisationEcoleFormData>({
    resolver: zodResolver(appelCotisationEcoleSchema),
    defaultValues: {
      nrcontact: initialData?.nrcontact || 0,
      montantcotisation: initialData?.montantcotisation || 0,
      datereceptioncotisation: initialData?.datereceptioncotisation || null,
      signatureagent: initialData?.signatureagent || "",
      commentaire: initialData?.commentaire || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nrcontact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormControl>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                >
                  <option value="">Sélectionner un contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.idcontact} value={contact.idcontact}>
                      {contact.prenom} {contact.nom}
                    </option>
                  ))}
                </select>
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
              <FormLabel>Montant de la cotisation</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="datereceptioncotisation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de réception</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="signatureagent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Signature de l'agent</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commentaire"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commentaire</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">
            {initialData ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}