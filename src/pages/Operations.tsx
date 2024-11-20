import { useState, useEffect } from "react";
import { getOperations, createOperation, updateOperation } from "../lib/api";
import type { Operation } from "../lib/api";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { OperationForm } from "../components/OperationForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Container } from "../components/ui/container";
import { Flex } from "../components/ui/flex";

export default function Operations() {
    const [operations, setOperations] = useState<Operation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchOperations();
    }, []);

    const fetchOperations = async () => {
        try {
            const data = await getOperations();
            setOperations(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur lors de la récupération des opérations:", error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les opérations.",
                variant: "destructive",
            });
        }
    };

    const columns: ColumnDef<Operation>[] = [
        { accessorKey: "libelle", header: "Libellé" },
        {
            accessorKey: "dateoperation",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.dateoperation), "dd/MM/yyyy"),
        },
        { accessorKey: "idtypeoperation", header: "Type d'opération" },
        { accessorKey: "refoperation", header: "Référence" },
        { accessorKey: "moyenpaiement", header: "Moyen de paiement" },
        { accessorKey: "refcheque", header: "Référence chèque" },
        { accessorKey: "credit", header: "Crédit" },
        { accessorKey: "debit", header: "Débit" },
        { accessorKey: "idcontactpercepteur", header: "Contact percepteur" },
        { accessorKey: "idcontactcotisant", header: "Contact cotisant" },
        { accessorKey: "membrecotisant", header: "Membre cotisant" },
        { accessorKey: "anneecotisation", header: "Année cotisation" },
        { accessorKey: "moiscotisation", header: "Mois cotisation" },
        { accessorKey: "idcomptedestination", header: "Compte destination" },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setSelectedOperation(row.original);
                        setIsDialogOpen(true);
                    }}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    const handleSubmit = async (data: any) => {
        try {
            if (selectedOperation) {
                await updateOperation(selectedOperation.idoperation!, data);
                toast({
                    title: "Succès",
                    description: "Opération mise à jour avec succès.",
                });
            } else {
                await createOperation(data);
                toast({
                    title: "Succès",
                    description: "Opération créée avec succès.",
                });
            }

            fetchOperations();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'opération:", error);
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder l'opération.",
                variant: "destructive",
            });
        }
    };

    return (
        <Container size="full" className="h-full flex flex-col p-0">
            <Card>
                <CardHeader>
                    <Flex justify="between" align="center">
                        <CardTitle>Opérations</CardTitle>
                        <Button  onClick={() => {
                            setSelectedOperation(null);
                            setIsDialogOpen(true);
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvelle opération
                        </Button>
                    </Flex>
                </CardHeader>

                <DataTable columns={columns} data={operations} />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedOperation ? "Modifier l'opération" : "Nouvelle opération"}
                            </DialogTitle>
                        </DialogHeader>
                        <OperationForm
                            onSubmit={handleSubmit}
                            initialData={selectedOperation || undefined}
                        />
                    </DialogContent>
                </Dialog>

            </Card>
        </Container>
    );
}

