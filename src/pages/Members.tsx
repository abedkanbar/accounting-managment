import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash } from 'lucide-react';
import { useDatabase } from '../lib/db';
import type { Member } from '../lib/db';
import toast from 'react-hot-toast';
import MemberModal from '../components/MemberModal';
import Pagination from '../components/Pagination';
import DeleteDialog from '@/components/DeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { Flex } from '@/components/ui/flex';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const Members = () => {
  const db = useDatabase();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    member?: Member;
  }>({
    isOpen: false,
    member: undefined,
  });

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadMembers = async () => {
    try {
      const allMembers = await db.getAllMembers();
      setMembers(allMembers);
    } catch (error) {
      toast.error('Erreur lors du chargement des adhérents');
    }
  };

  const handleNewMember = () => {
    setSelectedMember(undefined);
    setShowModal(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleDeleteClick = (member: Member) => {
    setDeleteDialog({ isOpen: true, member });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.member) {
      try {
        await db.deleteMember(deleteDialog.member.id!);
        toast.success('Adhérent supprimé avec succès');
        loadMembers();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
    setDeleteDialog({ isOpen: false, member: undefined });
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredMembers.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + pageSize);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'success';
      case 'Inactif':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <Container size="full" className="h-full flex flex-col p-0">
      <Card>
        <CardHeader>
          <Flex justify="between" align="center">
            <CardTitle>Gestion des adhérents</CardTitle>
            <Button onClick={handleNewMember}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel adhérent
            </Button>
          </Flex>
        </CardHeader>

        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un adhérent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(member.status?.name)}>
                        {member.status?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Flex gap={2}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(member)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </Flex>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      <MemberModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={loadMembers}
        member={selectedMember}
      />

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, member: undefined })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'adhérent"
        description="Êtes-vous sûr de vouloir supprimer cet adhérent ? Cette action est irréversible."
      />
    </Container>
  );
};

export default Members;