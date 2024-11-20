import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { operationSchema, type OperationFormData } from "../lib/schemas";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import { format } from "date-fns";

interface OperationFormProps {
    onSubmit: (data: OperationFormData) => void;
    initialData?: Partial<OperationFormData>;
}

export function OperationForm({ onSubmit, initialData }: OperationFormProps) {
    const form = useForm<OperationFormData>({
        resolver: zodResolver(operationSchema),
        defaultValues: {
            libelle: initialData?.libelle || "",
            dateoperation: initialData?.dateoperation || new Date(),
            idtypeoperation: initialData?.idtypeoperation || 1,
            refoperation: initialData?.refoperation || "",
            moyenpaiement: initialData?.moyenpaiement || 1,
            refcheque: initialData?.refcheque || "",
            credit: initialData?.credit || 0,
            debit: initialData?.debit || 0,
            idcontactpercepteur: initialData?.idcontactpercepteur || 1,
            idcontactcotisant: initialData?.idcontactcotisant || 1,
            membrecotisant: initialData?.membrecotisant || 0,
            anneecotisation: initialData?.anneecotisation || 0,
            moiscotisation: initialData?.moiscotisation || 0,
            idcomptedestination: initialData?.idcomptedestination || 0,
        },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 h-[calc(100vh-10rem)] overflow-y-auto pr-4">
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
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
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
                        name="debit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Débit</FormLabel>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="moyenpaiement"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Moyen de paiement</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
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
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
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
                        name="idcomptedestination"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Compte de destination</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
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
                        name="refoperation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Numéro d'opération</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="membrecotisant"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Membre cotisant</FormLabel>
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
                        name="anneecotisation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Annee cotisation</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
