import { useState, useEffect } from "react";
import { getAppelCotisations, createAppelCotisation, updateAppelCotisation, getContacts } from "../lib/api";
import type { AppelCotisations, Contact } from "../lib/api";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { AppelCotisationForm } from "../components/AppelCotisationForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

export default function Cotisations() {
  const [cotisations, setCotisations] = useState<AppelCotisations[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCotisation, setSelectedCotisation] = useState<AppelCotisations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cotisationsData, contactsData] = await Promise.all([
        getAppelCotisations(),
        getContacts()
      ]);
      setCotisations(cotisationsData);
      setContacts(contactsData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedCotisation) {
        await updateAppelCotisation(selectedCotisation.idliste, data);
        toast({
          title: "Succès",
          description: "Cotisation mise à jour avec succès",
        });
      } else {
        await createAppelCotisation(data);
        toast({
          title: "Succès",
          description: "Cotisation créée avec succès",
        });
      }
      loadData();
      setIsDialogOpen(false);
      setSelectedCotisation(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    }
  };

  const getContactName = (contactId: number) => {
    const contact = contacts.find(c => c.idcontact === contactId);
    return contact ? `${contact.prenom} ${contact.nom}` : 'Contact inconnu';
  };

  const columns: ColumnDef<AppelCotisations>[] = [
    {
      accessorKey: "nrcontact",
      header: "Contact",
      cell: ({ row }) => getContactName(row.original.nrcontact),
    },
    {
      accessorKey: "montantcotisation",
      header: "Montant",
      cell: ({ row }) => (
        <div>{row.original.montantcotisation} €</div>
      ),
    },
    {
      accessorKey: "datereceptioncotisation",
      header: "Date de réception",
      cell: ({ row }) => (
        row.original.datereceptioncotisation 
          ? format(new Date(row.original.datereceptioncotisation), 'dd/MM/yyyy')
          : 'Non reçue'
      ),
    },
    {
      accessorKey: "signatureagent",
      header: "Agent",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedCotisation(row.original);
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
        <h1 className="text-3xl font-bold">Cotisations</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle cotisation
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={cotisations}
        searchColumn="nrcontact"
        searchPlaceholder="Rechercher une cotisation..."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCotisation ? "Modifier la cotisation" : "Nouvelle cotisation"}
            </DialogTitle>
          </DialogHeader>
          <AppelCotisationForm
            onSubmit={handleSubmit}
            initialData={selectedCotisation || undefined}
            contacts={contacts}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}