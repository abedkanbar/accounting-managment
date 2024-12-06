import { useState, useEffect } from "react";
import { getComptesBancaires, createComptesBancaire, updateComptesBancaire } from "../lib/api";
import type { ComptesBancaires } from "../lib/api";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { CompteBancaireForm } from "../components/CompteBancaireForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import type { ColumnDef } from "@tanstack/react-table";

export default function ComptesBancaires() {
  const [comptes, setComptes] = useState<ComptesBancaires[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompte, setSelectedCompte] = useState<ComptesBancaires | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComptes();
  }, []);

  const loadComptes = async () => {
    try {
      const data = await getComptesBancaires();
      setComptes(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les comptes bancaires",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedCompte) {
        await updateComptesBancaire(selectedCompte.idcompte, data);
        toast({
          title: "Succès",
          description: "Compte bancaire mis à jour avec succès",
        });
      } else {
        await createComptesBancaire(data);
        toast({
          title: "Succès",
          description: "Compte bancaire créé avec succès",
        });
      }
      loadComptes();
      setIsDialogOpen(false);
      setSelectedCompte(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    }
  };

  const columns: ColumnDef<ComptesBancaires>[] = [
    {
      accessorKey: "libelle",
      header: "Libellé",
    },
    {
      accessorKey: "titulaire",
      header: "Titulaire",
    },
    {
      accessorKey: "domiciliation",
      header: "Domiciliation",
    },
    {
      accessorKey: "iban",
      header: "IBAN",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedCompte(row.original);
            setIsDialogOpen(true);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Comptes Bancaires</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau compte
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={comptes}
        searchColumn="libelle"
        searchPlaceholder="Rechercher un compte..."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCompte ? "Modifier le compte bancaire" : "Nouveau compte bancaire"}
            </DialogTitle>
          </DialogHeader>
          <CompteBancaireForm
            onSubmit={handleSubmit}
            initialData={selectedCompte || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}