import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { anneeScolaireSchema, type AnneeScolaireFormData } from "@/lib/schemas";
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

interface AnneeScolaireFormProps {
  onSubmit: (data: AnneeScolaireFormData) => void;
  initialData?: Partial<AnneeScolaireFormData>;
}

export function AnneeScolaireForm({ onSubmit, initialData }: AnneeScolaireFormProps) {
  const form = useForm<AnneeScolaireFormData>({
    resolver: zodResolver(anneeScolaireSchema),
    defaultValues: {
      annee: initialData?.annee || new Date().getFullYear(),
      libelle: initialData?.libelle || "",
      montantcotisation: initialData?.montantcotisation || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="annee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
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

        <div className="flex justify-end">
          <Button type="submit">
            {initialData ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}