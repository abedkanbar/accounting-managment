import { useState, useEffect } from "react";
import type { Contact } from "../lib/api";
import { DataTable } from "../components/ui/data-table";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { useToast } from "../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Container } from "../components/ui/container";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { getContacts } from "../lib/api";

export default function Adherents() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      // Filtrer uniquement les adhérents
      const adherents = data.filter(contact => contact.adherent === 1);
      setContacts(adherents);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les adhérents",
      });
    } finally {
      setLoading(false);
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
      accessorKey: "dateadhesion",
      header: "Date d'adhésion",
      cell: ({ row }) => format(new Date(row.original.dateadhesion), "dd/MM/yyyy"),
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
      id: "statut",
      header: "Statut",
      cell: ({ row }) => {
        const statuts = [];
        if (row.original.membrefondateur === 1) statuts.push("Fondateur");
        if (row.original.membrecotisant === 1) statuts.push("Cotisant");
        if (row.original.donateur === 1) statuts.push("Donateur");
        if (row.original.agentrecette === 1) statuts.push("Agent de recette");
        return statuts.join(", ") || "Adhérent";
      },
    },
  ];

  if (loading) {
    return <div>Chargement...</div>;
  }

  const membresActifs = contacts.filter(c => c.membrecotisant === 1).length;
  const membresFondateurs = contacts.filter(c => c.membrefondateur === 1).length;

  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <CardTitle>Adhérents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Adhérents</p>
                    <h2 className="text-2xl font-bold">{contacts.length}</h2>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Membres Actifs</p>
                    <h2 className="text-2xl font-bold">{membresActifs}</h2>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Membres Fondateurs</p>
                    <h2 className="text-2xl font-bold">{membresFondateurs}</h2>
                  </div>
                  <UserPlus className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <DataTable
            columns={columns}
            data={contacts}
            searchColumn="nom"
            searchPlaceholder="Rechercher un adhérent..."
          />
        </CardContent>
      </Card>
    </Container>
  );
}