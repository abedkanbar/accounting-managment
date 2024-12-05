import { useState, useEffect, useMemo } from "react";
import { getAnnees, createAnnee, updateAnnee } from "@/lib/api";
import type { AnneesScolaire } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnneeScolaireForm } from "@/components/AnneeScolaireForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "../components/ui/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Flex } from "../components/ui/flex";

export default function AnneesScolaires() {
  const [annees, setAnnees] = useState<AnneesScolaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnee, setSelectedAnnee] = useState<AnneesScolaire | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnnees();
  }, []);

  const loadAnnees = async () => {
    try {
      const { data } = await getAnnees();
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
          variant: "success",
          title: "Succès",
          description: "Année scolaire mise à jour avec succès",
        });
      } else {
        await createAnnee(data);
        toast({
          variant: "success",
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

  const columns = useMemo<ColumnDef<AnneesScolaire>[]>(
    () => [
      {
        accessorKey: "annee",
        header: "Année",
        enableSorting: false,
      },
      {
        accessorKey: "libelle",
        header: "Libellé",
        enableSorting: false,
      },
      {
        accessorKey: "montantcotisation",
        header: "Montant cotisation",
        enableSorting: false,
        cell: ({ row }) => (
          <div>{row.original.montantcotisation} €</div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
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
          </div>
        ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <Container size="full" className="h-full flex flex-col p-0">
        <Card>
          <CardHeader>
            <Flex justify="between" align="center">
              <CardTitle>Années Scolaires</CardTitle>
              <Skeleton className="h-10 w-[200px]" />
            </Flex>
          </CardHeader>
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <CardTitle>Années Scolaires</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle année
            </Button>
          </Flex>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={annees}
              searchColumn="libelle"
              searchPlaceholder="Rechercher une année..."
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAnnee
                ? "Modifier l'année scolaire"
                : "Nouvelle année scolaire"}
            </DialogTitle>
          </DialogHeader>
          <AnneeScolaireForm
            onCancel={() => setIsDialogOpen(false)}
            onSubmit={handleSubmit}
            initialData={selectedAnnee || undefined}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
