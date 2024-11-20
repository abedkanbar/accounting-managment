import { useState, useEffect } from "react";
import { getContacts, createContact, updateContact } from "../lib/api";
import type { Contact } from "../lib/api";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { ContactForm } from "../components/ContactForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les contacts",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedContact) {
        await updateContact(selectedContact.idcontact, data);
        toast({
          title: "Succès",
          description: "Contact mis à jour avec succès",
        });
      } else {
        await createContact(data);
        toast({
          title: "Succès",
          description: "Contact créé avec succès",
        });
      }
      loadContacts();
      setIsDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    }
  };

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "nom",
      header: "Nom",
      cell: ({ row }) => (
        <div>
          {row.original.prenom} {row.original.nom}
        </div>
      ),
    },
    {
      accessorKey: "alias",
      header: "Alias",
    },
    {
      accessorKey: "fonction",
      header: "Fonction",
    },
    {
      accessorKey: "telfix",
      header: "Téléphone",
    },
    {
      accessorKey: "dateadhesion",
      header: "Date d'adhésion",
      cell: ({ row }) => format(new Date(row.original.dateadhesion), "dd/MM/yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedContact(row.original);
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
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau contact
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={contacts}
        searchColumn="nom"
        searchPlaceholder="Rechercher un contact..."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedContact ? "Modifier le contact" : "Nouveau contact"}
            </DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleSubmit}
            initialData={selectedContact || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}