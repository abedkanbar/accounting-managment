import { useState, useEffect } from "react";
import { getAnnees, createAnnee, updateAnnee } from "../lib/api";
import type { AnneesScolaire } from "../lib/api";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { AnneeScolaireForm } from "../components/AnneeScolaireForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import type { ColumnDef } from "@tanstack/react-table";

export default function AnneesScolaires() {
  const [annees, setAnnees] = useState<AnneesScolaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnee, setSelectedAnnee] = useState<AnneesScolaire | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnnees();
  }, []);

  const loadAnnees = async () => {
    try {
      const data = await getAnnees();
      setAnnees(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les années scolaires",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedAnnee) {
        await updateAnnee(selectedAnnee.annee, data);
        toast({
          title: "Succès",
          description: "Année scolaire mise à jour avec succès",
        });
      } else {
        await createAnnee(data);
        toast({
          title: "Succès",
          description: "Année scolaire créée avec succès",
        });
      }
      loadAnnees();
      setIsDialogOpen(false);
      setSelectedAnnee(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    }
  };

  const columns: ColumnDef<AnneesScolaire>[] = [
    {
      accessorKey: "annee",
      header: "Année",
    },
    {
      accessorKey: "libelle",
      header: "Libellé",
    },
    {
      accessorKey: "montantcotisation",
      header: "Montant cotisation",
      cell: ({ row }) => (
        <div>{row.original.montantcotisation.toLocaleString('fr-FR')} €</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedAnnee(row.original);
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
        <h1 className="text-3xl font-bold">Années Scolaires</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle année
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={annees}
        searchColumn="libelle"
        searchPlaceholder="Rechercher une année..."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAnnee ? "Modifier l'année scolaire" : "Nouvelle année scolaire"}
            </DialogTitle>
          </DialogHeader>
          <AnneeScolaireForm
            onSubmit={handleSubmit}
            initialData={selectedAnnee || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}