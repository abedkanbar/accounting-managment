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
import type { ColumnDef } from '@tanstack/react-table';
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
  adherent?: boolean;
  membrefondateur?: boolean;
  membrecotisant?: boolean;
  donateur?: boolean;
  agentrecette?: boolean;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
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

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
      }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

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

  const loadContacts = useCallback(
    async (params: ContactsParams) => {
      try {
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

  const params = useMemo(() => buildParams(), [buildParams]);

  useEffect(() => {
    loadContacts(params);
  }, [params, loadContacts]);

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
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue',
      });
    }
  };

  const handleFilterChange = (key: keyof FilterState) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[key] === undefined) {
        newFilters[key] = true;
      } else if (newFilters[key] === true) {
        newFilters[key] = false;
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSortConfig({ column: '', direction: '' });
    setCurrentPage(1);
  };

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'nom',
      header: 'Nom',
      cell: ({ row }) => <div>{row.original.nom}</div>,
      enableSorting: true,
    },
    {
      accessorKey: 'prenom',
      header: 'Prénom',
      cell: ({ row }) => <div>{row.original.prenom}</div>,
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
          {row.original.adherent && (
            <Badge variant="secondary">Adhérent</Badge>
          )}
          {row.original.membrefondateur && (
            <Badge variant="secondary">Fondateur</Badge>
          )}
          {row.original.membrecotisant && (
            <Badge variant="secondary">Cotisant</Badge>
          )}
          {row.original.donateur && (
            <Badge variant="secondary">Donateur</Badge>
          )}
          {row.original.agentrecette && (
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
  ];

  if (loading) {
    return (
      <Container size="full" className="h-full flex flex-col p-0">
        <Card>
          <CardHeader>
            <Flex justify="between" align="center">
              <CardTitle>Contacts</CardTitle>
              <Skeleton className="h-10 w-[200px]" />
            </Flex>
          </CardHeader>
          <CardContent>
            <Card className="mb-6">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

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

              <div className="mb-6">
                <Input
                  placeholder="Rechercher par nom ou prénom..."
                  onChange={handleSearchChange}
                  className="max-w-sm"
                />
              </div>

              <div className="grid grid-cols-5 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adherent"
                    checked={filters.adherent === true}
                    onCheckedChange={() => handleFilterChange('adherent')}
                    className={
                      filters.adherent === false ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="adherent">Adhérent</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membrefondateur"
                    checked={filters.membrefondateur === true}
                    onCheckedChange={() =>
                      handleFilterChange('membrefondateur')
                    }
                    className={
                      filters.membrefondateur === false ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="membrefondateur">Membre fondateur</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="membrecotisant"
                    checked={filters.membrecotisant === true}
                    onCheckedChange={() => handleFilterChange('membrecotisant')}
                    className={
                      filters.membrecotisant === false ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="membrecotisant">Membre cotisant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="donateur"
                    checked={filters.donateur === true}
                    onCheckedChange={() => handleFilterChange('donateur')}
                    className={
                      filters.donateur === false ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="donateur">Donateur</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agentrecette"
                    checked={filters.agentrecette === true}
                    onCheckedChange={() => handleFilterChange('agentrecette')}
                    className={
                      filters.agentrecette === false ? 'bg-destructive' : ''
                    }
                  />
                  <Label htmlFor="agentrecette">Agent de recette</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <DataTable
            columns={columns}
            data={contacts}
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
