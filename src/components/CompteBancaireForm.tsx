import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { compteBancaireSchema, type CompteBancaireFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CompteBancaireFormProps {
  onSubmit: (data: CompteBancaireFormData) => void;
  initialData?: Partial<CompteBancaireFormData>;
}

export function CompteBancaireForm({ onSubmit, initialData }: CompteBancaireFormProps) {
  const form = useForm<CompteBancaireFormData>({
    resolver: zodResolver(compteBancaireSchema),
    defaultValues: {
      libelle: initialData?.libelle || "",
      titulaire: initialData?.titulaire || "",
      adressetitulaire: initialData?.adressetitulaire || "",
      domiciliation: initialData?.domiciliation || "",
      adressedomiciliation: initialData?.adressedomiciliation || "",
      codebanque: initialData?.codebanque || "",
      codeguichet: initialData?.codeguichet || "",
      nrcompte: initialData?.nrcompte || "",
      clerib: initialData?.clerib || "",
      iban: initialData?.iban || "",
      swift: initialData?.swift || "",
      bic: initialData?.bic || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="libelle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Libellé du compte</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="titulaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titulaire</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adressetitulaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse du titulaire</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="domiciliation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domiciliation</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adressedomiciliation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse de domiciliation</FormLabel>
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
            name="codebanque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code banque</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codeguichet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code guichet</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nrcompte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de compte</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clerib"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clé RIB</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="iban"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IBAN</FormLabel>
              <FormControl>
                <Input {...field} placeholder="FR76 1234 5678 9012 3456 7890 123" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="swift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SWIFT</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BIC</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            {initialData ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}