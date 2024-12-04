import { useState, useEffect } from 'react';
import { getAnnees, createAnnee, updateAnnee } from '@/lib/api';
import type { AnneesScolaire } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnneeScolaireForm } from '@/components/AnneeScolaireForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ColumnDef } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '../components/ui/container';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Flex } from '../components/ui/flex';

export default function AnneesScolaires() {
  const [annees, setAnnees] = useState<AnneesScolaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnee, setSelectedAnnee] = useState<AnneesScolaire | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    loadAnnees();
  }, []);

  const loadAnnees = async () => {
    try {
      const { data } = await getAnnees();
      setAnnees(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les années scolaires',
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
          variant: 'success',
          title: 'Succès',
          description: 'Année scolaire mise à jour avec succès',
        });
      } else {
        await createAnnee(data);
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Année scolaire créée avec succès',
        });
      }
      loadAnnees();
      setIsDialogOpen(false);
      setSelectedAnnee(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    }
  };

  const columns: ColumnDef<AnneesScolaire>[] = [
    {
      accessorKey: 'annee',
      header: 'Année',
      enableSorting: false,
    },
    {
      accessorKey: 'libelle',
      header: 'Libellé',
      enableSorting: false,
    },
    {
      accessorKey: 'montantcotisation',
      header: 'Montant cotisation',
      enableSorting: false,
      cell: ({ row }) => (
        <div>{row.original.montantcotisation.toLocaleString('fr-FR')} €</div>
      ),
    },
    {
      id: 'actions',
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedAnnee(row.original);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = async () => {
    if (!selectedAnnee.annee) return;

    try {
      setIsActionLoading(true);
      // await deleteAnnee(selectedAnnee.annee);
      toast({
        variant: 'success',
        title: 'Succès',
        description: 'Année supprimée avec succès.',
      });
      loadAnnees();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'année.",
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
      setSelectedAnnee(null);
      setIsDeleteDialogOpen(false);
    }
  };

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
              {selectedAnnee
                ? "Modifier l'année scolaire"
                : 'Nouvelle année scolaire'}
            </DialogTitle>
          </DialogHeader>
          <AnneeScolaireForm
            onSubmit={handleSubmit}
            initialData={selectedAnnee || undefined}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette ligne ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isActionLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
