import { useState, useEffect, useMemo, useCallback } from 'react';
import { getContacts, createContact, updateContact } from '@/lib/api';
import type { Contact } from '@/lib/api';
import type { ContactsParams, SortDirection } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContactForm } from '@/components/ContactForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Flex } from '@/components/ui/flex';
import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import debounce from 'lodash/debounce';

interface FilterState {
  adherent?: number;
  membrefondateur?: number;
  membrecotisant?: number;
  donateur?: number;
  agentrecette?: number;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<FilterState>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: SortDirection;
  }>({
    column: '',
    direction: '',
  });

  const [sorting, setSorting] = useState<SortingState>([]);

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

  // Handle sorting changes from DataTable
  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    setSorting(updaterOrValue);
  };

  // Map SortingState to sortConfig for API calls
  useEffect(() => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      setSortConfig({
        column: id,
        direction: desc ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({
        column: '',
        direction: '',
      });
    }
  }, [sorting]);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle page size changes
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Build API parameters based on current state
  const buildParams = useCallback((): ContactsParams => {
    const params: ContactsParams = {
      page: currentPage,
      limit: pageSize,
      adherent: filters.adherent,
      membrefondateur: filters.membrefondateur,
      membrecotisant: filters.membrecotisant,
      donateur: filters.donateur,
      agentrecette: filters.agentrecette,
      nomOuPrenom: searchTerm || undefined,
    };

    if (sortConfig.column && sortConfig.direction) {
      params.orderBy = sortConfig.column;
      params.orderDir = sortConfig.direction;
    }

    return params;
  }, [currentPage, pageSize, filters, sortConfig, searchTerm]);

  // Load contacts based on parameters
  const loadContacts = useCallback(
    async (params: ContactsParams) => {
      try {
        setLoading(true);
        const { data, pagination } = await getContacts(
          params.page,
          params.limit,
          params.adherent,
          params.membrefondateur,
          params.membrecotisant,
          params.donateur,
          params.agentrecette,
          params.orderBy,
          params.orderDir,
          params.nomOuPrenom
        );
        setContacts(data);
        setTotalItems(pagination.total);
      } catch (error) {
        console.error('Error loading contacts:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les contacts',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Rebuild parameters whenever dependencies change
  const params = useMemo(() => buildParams(), [buildParams]);

  // Fetch contacts whenever parameters change
  useEffect(() => {
    loadContacts(params);
  }, [params, loadContacts]);

  // Handle form submissions for creating/updating contacts
  const handleSubmit = async (data: any) => {
    try {
      if (selectedContact) {
        await updateContact(selectedContact.idcontact, data);
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Contact mis à jour avec succès',
        });
      } else {
        await createContact(data);
        toast({
          variant: 'success',
          title: 'Succès',
          description: 'Contact créé avec succès',
        });
      }
      loadContacts(params);
      setIsDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[key] === undefined) {
        newFilters[key] = 1;
      } else if (newFilters[key] === 1) {
        newFilters[key] = 0;
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSortConfig({ column: '', direction: '' });
    setCurrentPage(1);
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        accessorKey: 'nom',
        header: 'Nom',
        enableSorting: true,
      },
      {
        accessorKey: 'prenom',
        header: 'Prénom',
        enableSorting: true,
      },
      {
        accessorKey: 'fonction',
        header: 'Fonction',
        enableSorting: false,
      },
      {
        accessorKey: 'mobile',
        header: 'Téléphone mobile',
        enableSorting: false,
      },
      {
        accessorKey: 'dateadhesion',
        header: "Date d'adhésion",
        cell: ({ row }) => (
          <div>{format(new Date(row.original.dateadhesion), 'dd/MM/yyyy')}</div>
        ),
        enableSorting: true,
      },
      {
        id: 'roles',
        header: 'Rôles',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.adherent == 1 && (
              <Badge variant="secondary">Adhérent</Badge>
            )}
            {row.original.membrefondateur == 1 && (
              <Badge variant="secondary">Fondateur</Badge>
            )}
            {row.original.membrecotisant == 1 && (
              <Badge variant="secondary">Cotisant</Badge>
            )}
            {row.original.donateur == 1 && (
              <Badge variant="secondary">Donateur</Badge>
            )}
            {row.original.agentrecette == 1 && (
              <Badge variant="secondary">Agent recette</Badge>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
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
    ],
    []
  );

  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <CardTitle>Contacts</CardTitle>
            <Button
              onClick={() => {
                setSelectedContact(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contact
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
                    {(Object.keys(filters).length > 0 ||
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

              <div className="grid grid-cols-5 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adherent"
                    checked={filters.adherent === 1}
                    onCheckedChange={() => handleFilterChange('adherent')}
                    className={
                      filters.adherent === 0 ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="adherent">Adhérent</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membrefondateur"
                    checked={filters.membrefondateur === 1}
                    onCheckedChange={() =>
                      handleFilterChange('membrefondateur')
                    }
                    className={
                      filters.membrefondateur === 0 ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="membrefondateur">Membre fondateur</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membrecotisant"
                    checked={filters.membrecotisant === 1}
                    onCheckedChange={() => handleFilterChange('membrecotisant')}
                    className={
                      filters.membrecotisant === 0 ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="membrecotisant">Membre cotisant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="donateur"
                    checked={filters.donateur === 1}
                    onCheckedChange={() => handleFilterChange('donateur')}
                    className={
                      filters.donateur === 0 ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="donateur">Donateur</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agentrecette"
                    checked={filters.agentrecette === 1}
                    onCheckedChange={() => handleFilterChange('agentrecette')}
                    className={
                      filters.agentrecette === 0 ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="agentrecette">Agent de recette</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <Input
              placeholder="Rechercher par nom ou prénom..."
              onChange={handleSearchChange}
              value={searchTerm}
              className="max-w-sm"
            />
          </div>

          {loading  ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
          <DataTable
            columns={columns}
            data={contacts}
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
              {selectedContact ? 'Modifier le contact' : 'Nouveau contact'}
            </DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleSubmit}
            initialData={selectedContact || undefined}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
