import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getOperations,
  createOperation,
  updateOperation,
  getTypeOperationLabel,
  getMoyenPaiementLabel,
  OperationsTypes,
  PaymentMethodType,
} from '../lib/api';
import type { Operation } from '../lib/api';
import type { OperationsParams, SortDirection } from '@/lib/types';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import {
  Plus,
  Pencil,
  RefreshCw,
  Copy,
  Trash2,
  Loader2,
  Filter,
  Download,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useReferenceData } from '@/hooks/useReferenceData';
import { OperationForm } from '@/components/OperationForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import type { ColumnDef } from '@tanstack/react-table';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Container } from '../components/ui/container';
import { Flex } from '../components/ui/flex';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { generateOperationsReport } from '@/utils/pdfGenerator';

interface FilterState {
  typeOperation?: number;
  moyenPaiement?: number;
  moiscotisation?: number;
  anneecotisation?: number;
}

export default function Operations() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [operationToDelete, setOperationToDelete] = useState<Operation | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<FilterState>({});
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: SortDirection;
  }>({
    column: '',
    direction: '',
  });

  const { toast } = useToast();
  const {
    loading: referenceDataLoading,
    error: referenceDataError,
    reload: reloadReferenceData,
    getContactName,
    getBankAccountName,
    agentPerceptor,
    contactcotisant,
    months,
  } = useReferenceData();

  const handleSort = useCallback(
    (column: string, direction: SortDirection | '') => {
      setSortConfig({ column, direction });
      setCurrentPage(1);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const buildParams = useCallback((): OperationsParams => {
    const params: OperationsParams = {
      page: currentPage,
      limit: pageSize,
      idtypeoperation: filters.typeOperation,
      moyenpaiement: filters.moyenPaiement,
      moiscotisation: filters.moiscotisation,
      anneecotisation: filters.anneecotisation,
    };

    if (sortConfig.column && sortConfig.direction) {
      params.orderBy = sortConfig.column;
      params.orderDir = sortConfig.direction;
    }

    return params;
  }, [currentPage, pageSize, filters, sortConfig]);

  const fetchOperations = useCallback(async () => {
    try {
      const params = buildParams();
      const response = await getOperations(
        params.page,
        params.limit,
        params.idtypeoperation,
        params.moyenpaiement,
        params.moiscotisation,
        params.anneecotisation,
        params.orderBy,
        params.orderDir
      );
      setOperations(response.data);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Erreur lors de la récupération des opérations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les opérations.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [buildParams, toast]);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  const handleDelete = async () => {
    if (!operationToDelete?.idoperation) return;

    try {
      setIsActionLoading(true);
      // Ici, ajoutez l'appel API pour supprimer l'opération
      // await deleteOperation(operationToDelete.idoperation);
      toast({
        title: 'Succès',
        description: 'Opération supprimée avec succès.',
      });
      fetchOperations();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'opération.",
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
      setOperationToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDuplicate = (operation: Operation) => {
    const duplicatedOperation = { ...operation };
    delete duplicatedOperation.idoperation;
    setSelectedOperation(duplicatedOperation);
    setIsDialogOpen(true);
  };

  const clearFilters = () => {
    setFilters({});
    setSortConfig({ column: '', direction: '' });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value ? parseInt(value) : undefined,
    }));
    setCurrentPage(1);
  };

  const columns: ColumnDef<Operation>[] = [
    {
      accessorKey: 'idoperation',
      header: 'Id',
      enableSorting: true,
    },
    {
      accessorKey: 'idcontactcotisant',
      header: 'Contact',
      cell: ({ row }) => {
        const cotisant = getContactName(row.original.idcontactcotisant);
        return cotisant ? `${cotisant}` : '-';
      },
      enableSorting: false,
    },
    {
      accessorKey: 'libelle',
      header: 'Libellé',
      enableSorting: true,
    },
    {
      accessorKey: 'dateoperation',
      header: 'Date',
      cell: ({ row }) => (
        <div>{format(new Date(row.original.dateoperation), 'dd/MM/yyyy')}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'idtypeoperation',
      header: "Type d'opération",
      cell: ({ row }) => getTypeOperationLabel(row.original.idtypeoperation),
      enableSorting: true,
    },
    {
      accessorKey: 'refoperation',
      header: 'Référence',
      enableSorting: true,
    },
    {
      accessorKey: 'moyenpaiement',
      header: 'Moyen de paiement',
      cell: ({ row }) =>
        row.original.moyenpaiement !== undefined
          ? getMoyenPaiementLabel(row.original.moyenpaiement)
          : 'Inconnu',
      enableSorting: true,
    },
    {
      accessorKey: 'refcheque',
      header: 'Référence chèque',
      enableSorting: true,
    },
    {
      accessorKey: 'credit',
      header: 'Crédit',
      cell: ({ row }) =>
        row.original.credit
          ? `${parseFloat(row.original.credit).toFixed(2)} €`
          : '0 €',
      enableSorting: true,
    },
    {
      accessorKey: 'debit',
      header: 'Débit',
      cell: ({ row }) =>
        row.original.debit
          ? `${parseFloat(row.original.debit).toFixed(2)} €`
          : '0 €',
      enableSorting: true,
    },
    {
      accessorKey: 'anneecotisation',
      header: 'Année',
      enableSorting: true,
    },
    {
      accessorKey: 'moiscotisation',
      header: 'Mois',
      cell: ({ row }) =>
        months.find((month) => month.value === row.original.moiscotisation)
          ?.label,
      enableSorting: true,
    },
    {
      accessorKey: 'idcomptedestination',
      header: 'Compte',
      cell: ({ row }) => getBankAccountName(row.original.idcomptedestination),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedOperation(row.original);
              setIsDialogOpen(true);
            }}
            title="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDuplicate(row.original)}
            title="Dupliquer"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleSubmit = async (data: any) => {
    try {
      setIsActionLoading(true);
      if (selectedOperation?.idoperation) {
        await updateOperation(selectedOperation.idoperation, data);
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Opération mise à jour avec succès.',
        });
      } else {
        const newOperation = {
          ...data,
          dateoperation: new Date(data.dateoperation),
        };
        await createOperation(newOperation);
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Opération créée avec succès.',
        });
      }

      await fetchOperations();
      setIsDialogOpen(false);
      setSelectedOperation(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'opération:", error);
      toast({
        title: 'Erreur',
        description: "Impossible de sauvegarder l'opération.",
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading || referenceDataLoading) {
    return (
      <Container size="full" className="h-full flex flex-col p-0">
        <Card>
          <CardHeader>
            <Flex justify="between" align="center">
              <CardTitle>Opérations</CardTitle>
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
            <CardTitle>Opérations</CardTitle>
            <Flex gap={2}>
              {referenceDataError && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={reloadReferenceData}
                  title="Recharger les données de référence"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={() => {
                  setSelectedOperation(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle opération
              </Button>
            </Flex>
          </Flex>
        </CardHeader>

        {referenceDataError && (
          <Alert variant="destructive" className="mx-6 mb-6">
            <AlertDescription>
              Certaines données de référence n'ont pas pu être chargées. Cliquez
              sur le bouton de rechargement pour réessayer.
            </AlertDescription>
          </Alert>
        )}

        <div className="px-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <h2 className="text-lg font-semibold">Filtres</h2>
            <Flex justify="between" align="center" className="w-full">
              <Flex gap={2}>
                {(Object.keys(filters).length > 0 || sortConfig.column) && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Réinitialiser
                    </Button>
                  </>
                )}
              </Flex>
              <Button
                variant="outline"
                onClick={async () => {
                  const operationToExport = await getOperations(
                    1,
                    1000,
                    filters.typeOperation,
                    filters.moyenPaiement,
                    filters.moiscotisation,
                    filters.anneecotisation,
                    sortConfig.column,
                    sortConfig.direction
                  );
                  const allOperations = operationToExport.data;
                  const doc = generateOperationsReport({
                    allOperations,
                    getContactName,
                    months,
                  });
                  doc.save('operations.pdf');
                  toast({
                    title: 'Export PDF',
                    description: 'Le rapport a été généré avec succès',
                  });
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter en PDF
              </Button>
            </Flex>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div className="w-full">
              <Select
                value={filters.typeOperation?.toString() || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'typeOperation',
                    value === 'all' ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type d'opération" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {OperationsTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Select
                value={filters.moyenPaiement?.toString() || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'moyenPaiement',
                    value === 'all' ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Moyen de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les moyens</SelectItem>
                  {PaymentMethodType.map((method) => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      {method.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Select
                value={filters.moiscotisation?.toString() || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'moiscotisation',
                    value === 'all' ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mois de cotisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les mois</SelectItem>
                  {months.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Select
                value={filters.anneecotisation?.toString() || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'anneecotisation',
                    value === 'all' ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Année de cotisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {Array.from({ length: 2 }, (_, i) => {
                    const baseYear = Math.max(2024, new Date().getFullYear());
                    const year = baseYear + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-6">
          <DataTable
            columns={columns}
            data={operations}
            onSort={handleSort}
            pagination={{
              pageSize,
              pageCount: Math.ceil(totalItems / pageSize),
              currentPage,
              totalItems,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedOperation?.idoperation
                  ? "Modifier l'opération"
                  : selectedOperation
                  ? "Dupliquer l'opération"
                  : 'Nouvelle opération'}
              </DialogTitle>
            </DialogHeader>
            <OperationForm
              onSubmit={handleSubmit}
              initialData={selectedOperation || undefined}
              isLoading={isActionLoading}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cette opération ? Cette
                action est irréversible.
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
      </Card>
    </Container>
  );
}
