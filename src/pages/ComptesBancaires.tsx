import { useState, useEffect, useMemo } from "react";
import {
  getComptesBancaires,
  createComptesBancaire,
  updateComptesBancaire,
} from "@/lib/api";
import type { ComptesBancaires } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CompteBancaireForm } from "@/components/CompteBancaireForm";
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

export default function ComptesBancaires() {
  const [comptes, setComptes] = useState<ComptesBancaires[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompte, setSelectedCompte] = useState<ComptesBancaires | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComptes();
  }, []);

  const loadComptes = async () => {
    try {
      const { data } = await getComptesBancaires();
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
          variant: "success",
          title: "Succès",
          description: "Compte bancaire mis à jour avec succès",
        });
      } else {
        await createComptesBancaire(data);
        toast({
          variant: "success",
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

  const columns = useMemo<ColumnDef<ComptesBancaires>[]>(
    () => [
      {
        accessorKey: "libelle",
        header: "Libellé",
        enableSorting: false,
      },
      {
        accessorKey: "titulaire",
        header: "Titulaire",
        enableSorting: false,
      },
      {
        accessorKey: "domiciliation",
        header: "Domiciliation",
        enableSorting: false,
      },
      {
        accessorKey: "iban",
        header: "IBAN",
        enableSorting: false,
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
    ],
    []
  );

  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <CardTitle>Comptes Bancaires</CardTitle>
            <Button
              onClick={() => {
                setSelectedCompte(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau compte
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
              data={comptes}
              searchColumn="libelle"
              searchPlaceholder="Rechercher un compte..."
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCompte
                ? "Modifier le compte bancaire"
                : "Nouveau compte bancaire"}
            </DialogTitle>
          </DialogHeader>
          <CompteBancaireForm
            onSubmit={handleSubmit}
            initialData={selectedCompte || undefined}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
