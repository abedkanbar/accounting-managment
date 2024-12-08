import { useState, useEffect, useMemo, useCallback } from "react";
import { getAdherents, createAdherent, updateAdherent } from "@/lib/api";
import type { AdherentsEcole } from "@/lib/api";
import type { AdherentFormData } from "@/lib/schemas";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdherentForm } from "@/components/adherent/AdherentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Flex } from "@/components/ui/flex";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnDef, OnChangeFn } from "@tanstack/react-table";
import { useReferenceData } from "@/hooks/useReferenceData";
import { Skeleton } from "@/components/ui/skeleton";
import { SortDirection } from "@/lib/types";
import { SortingState } from "@tanstack/react-table";

export default function Adherents() {
  const [adherents, setAdherents] = useState<AdherentsEcole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdherent, setSelectedAdherent] =
    useState<AdherentsEcole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: SortDirection;
  }>({
    column: "",
    direction: "",
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const { toast } = useToast();
  const { contacts, loading: contactsLoading } = useReferenceData();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
  
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page: number) => {
    console.log("Page changed to:", page);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    console.log("Page size changed to:", size);
    setPageSize(size);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      setSortConfig({
        column: id,
        direction: desc ? "desc" : "asc",
      });
    } else {
      setSortConfig({
        column: "",
        direction: "",
      });
    }
  }, [sorting]);

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    setSorting(updaterOrValue);
  };

  useEffect(() => {
    const loadAdherents = async () => {
      
      try {
        setLoading(true);
        const response = await getAdherents(
          currentPage,
          pageSize,
          selectedYear !== "all" ? parseInt(selectedYear) : undefined,
          debouncedSearchTerm  || undefined,
          sortConfig.column || undefined,
          sortConfig.direction || undefined
        );
        setAdherents(response.data);
        setTotalItems(response.pagination.total);
      } catch (error) {
        console.error("Error loading adherents:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les adhérents",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdherents();
  }, [
    currentPage,
    pageSize,
    selectedYear,
    debouncedSearchTerm,
    sortConfig.column,
    sortConfig.direction, // Ensure this is included
    toast,
  ]);

  const handleSubmit = async (data: AdherentFormData) => {
    try {
      if (selectedAdherent) {
        await updateAdherent(selectedAdherent.idcotisantecole, data);
        toast({
          variant: "success",
          title: "Succès",
          description: "Adhérent mis à jour avec succès",
        });
      } else {
        await createAdherent(data);
        toast({
          variant: "success",
          title: "Succès",
          description: "Adhérent ajouté avec succès",
        });
      }
      setIsDialogOpen(false);
      setSelectedAdherent(null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error saving adherent:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
      });
    }
  };

  const columns = useMemo<ColumnDef<AdherentsEcole>[]>(
    () => [
      {
        accessorKey: "nom",
        header: "Nom",
        enableSorting: true,
      },
      {
        accessorKey: "prenom",
        header: "Prénom",
        enableSorting: true,
      },
      {
        accessorKey: "anneescolaire",
        header: "Année scolaire",
        enableSorting: true,
      },
      {
        accessorKey: "nbenfants",
        header: "Nombre d'enfants",
        enableSorting: true,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedAdherent(row.original);
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

  const years = Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  const clearFilters = () => {
    setSelectedYear(new Date().getFullYear().toString());
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSortConfig({ column: "", direction: "" });
    setCurrentPage(1);
  };

  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <CardTitle>Adhérents</CardTitle>
            <Button
              onClick={() => {
                setSelectedAdherent(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel adhérent
            </Button>
          </Flex>
        </CardHeader>

        <CardContent>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4" />
                <h2 className="text-lg font-semibold">Filtres</h2>
                <Flex justify="between" align="center" className="w-full">
                  <Flex gap={2}>
                    {(selectedYear !== new Date().getFullYear().toString() ||
                      searchTerm ||
                      sortConfig.column) && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Réinitialiser
                        </Button>
                      </>
                    )}
                  </Flex>
                </Flex>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    value={searchTerm}
                    placeholder="Rechercher par nom ou prénom..."
                    onChange={handleSearchChange}
                    className="max-w-sm"
                  />
                </div>

                <div>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Année scolaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les années</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}-{parseInt(year) + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          {loading || contactsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={adherents}
              sorting={sorting}
              onSortingChange={handleSortingChange}
              pagination={{
                pageSize,
                pageCount: Math.ceil(totalItems / pageSize),
                currentPage,
                totalItems,
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange,
              }}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAdherent ? "Modifier l'adhérent" : "Nouvel adhérent"}
            </DialogTitle>
          </DialogHeader>
          <AdherentForm
            onSubmit={handleSubmit}
            initialData={selectedAdherent || undefined}
            contacts={contacts}
            isEdit={!!selectedAdherent}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
