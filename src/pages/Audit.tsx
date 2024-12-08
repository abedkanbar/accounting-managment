import { useState, useEffect, useMemo, useCallback } from "react";
import type { Operation } from "@/lib/api";
import {
  getOperations,
  getTypeOperationLabel,
  getMoyenPaiementLabel,
} from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReferenceData } from "@/hooks/useReferenceData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Flex } from "@/components/ui/flex";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupingZone } from "@/components/audit/GroupingZone";
import { GroupedOperations } from "@/components/audit/GroupedOperations";
import { generateOperationsReport } from "@/utils/pdfGenerator";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

const groupingOptions = [
  { value: "month", label: "Par mois" },
  { value: "contact", label: "Par adhérent" },
  { value: "type", label: "Par type" },
  { value: "bank_account", label: "Par compte" },
];

export default function Audit() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroups, setActiveGroups] = useState<string[]>(["contact"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { toast } = useToast();
  const {
    loading: referenceDataLoading,
    getContactName,
    getBankAccountName,
    months,
  } = useReferenceData();

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const loadOperations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOperations(1, 1000, undefined, undefined, undefined, undefined, debouncedSearchTerm, undefined, undefined);
      setOperations(response.data);
    } catch (error) {
      console.error("Error loading operations:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les opérations",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, debouncedSearchTerm]);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  const columns = useMemo<ColumnDef<Operation>[]>(
    () => [
      {
        accessorKey: "idcontactcotisant",
        header: "Contact",
        cell: ({ row }) => {
          const cotisant = getContactName(row.original.idcontactcotisant);
          return cotisant ? `${cotisant}` : "-";
        },
        enableSorting: false,
      },
      {
        accessorKey: "libelle",
        header: "Libellé",
        enableSorting: true,
      },
      {
        accessorKey: "dateoperation",
        header: "Date",
        cell: ({ row }) => (
          <div>
            {format(new Date(row.original.dateoperation), "dd/MM/yyyy")}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "idtypeoperation",
        header: "Type d'opération",
        cell: ({ row }) => getTypeOperationLabel(row.original.idtypeoperation),
        enableSorting: true,
      },
      {
        accessorKey: "moyenpaiement",
        header: "Moyen de paiement",
        cell: ({ row }) =>
          row.original.moyenpaiement !== undefined
            ? getMoyenPaiementLabel(row.original.moyenpaiement)
            : "Inconnu",
        enableSorting: true,
      },
      {
        accessorKey: "credit",
        header: "Crédit",
        cell: ({ row }) => <div>{parseFloat(row.original.credit)} €</div>,
        enableSorting: true,
      },
      {
        accessorKey: "debit",
        header: "Débit",
        cell: ({ row }) => <div>{parseFloat(row.original.debit)} €</div>,
        enableSorting: true,
      },
      {
        accessorKey: "anneecotisation",
        header: "Année",
        enableSorting: true,
      },
      {
        accessorKey: "moiscotisation",
        header: "Mois",
        cell: ({ row }) =>
          months.find((month) => month.value === row.original.moiscotisation)
            ?.label,
        enableSorting: true,
      },
      {
        accessorKey: "idcomptedestination",
        header: "Compte",
        cell: ({ row }) => getBankAccountName(row.original.idcomptedestination),
        enableSorting: true,
      }
    ],
    [getContactName, getBankAccountName, months]
  );

  const handleExportSelection = (selectedOperations: Operation[]) => {
    const doc = generateOperationsReport({
      allOperations: selectedOperations,
      getContactName,
      months,
    });
    doc.save("operations-selection.pdf");
    toast({
      title: "Export PDF",
      description: "Le rapport a été généré avec succès",
    });
  };

  const totalCredit = operations.reduce((sum, op) => sum + (parseFloat(op.credit) || 0), 0);
  const totalDebit = operations.reduce((sum, op) => sum + (parseFloat(op.debit) || 0), 0);
  const balance = parseFloat(totalCredit + totalDebit).toFixed(2);

  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <CardTitle>Audit des Opérations</CardTitle>
          </Flex>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou prénom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <GroupingZone
            options={groupingOptions}
            activeGroups={activeGroups}
            onGroupsChange={setActiveGroups}
          />

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Crédit</div>
                <div className="text-2xl font-bold text-green-600">
                  {totalCredit.toLocaleString("fr-FR")} €
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Débit</div>
                <div className="text-2xl font-bold text-red-600">
                  {totalDebit.toLocaleString("fr-FR")} €
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Balance</div>
                <div className="text-2xl font-bold">
                  {balance.toLocaleString("fr-FR")} €
                </div>
              </CardContent>
            </Card>
          </div>

          {loading || referenceDataLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : activeGroups.length > 0 ? (
            <GroupedOperations
              operations={operations}
              groupBy={activeGroups}
              getContactName={getContactName}
              getBankAccountName={getBankAccountName}
              getTypeOperationLabel={getTypeOperationLabel}
              onExportSelection={handleExportSelection}
            />
          ) : (
            <div className="space-y-4">
              <h2>Veuillez choisir un groupement</h2>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}