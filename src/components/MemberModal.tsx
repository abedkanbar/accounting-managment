import React, { useState, useEffect } from 'react';
import { useDatabase } from '../lib/db';
import type { Member, MemberStatus } from '../lib/db';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  member?: Member;
}

const MemberModal = ({ isOpen, onClose, onSave, member }: MemberModalProps) => {
  const db = useDatabase();
  const [statuses, setStatuses] = useState<MemberStatus[]>([]);
  const [formData, setFormData] = useState<Omit<Member, 'id' | 'created_at'>>({
    name: '',
    email: '',
    phone: '',
    status_id: 0
  });

  useEffect(() => {
    loadStatuses();
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        status_id: member.status_id
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status_id: statuses[0]?.id || 0
      });
    }
  }, [member, isOpen]);

  const loadStatuses = async () => {
    try {
      const statusList = await db.getMemberStatuses();
      setStatuses(statusList);
      if (!member && statusList.length > 0) {
        setFormData(prev => ({ ...prev, status_id: statusList[0].id }));
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des statuts');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (member?.id) {
        await db.updateMember(member.id, formData);
        toast.success('Membre mis à jour avec succès');
      } else {
        await db.insertMember(formData);
        toast.success('Membre ajouté avec succès');
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {member ? 'Modifier le membre' : 'Nouveau membre'}
          </DialogTitle>
          <DialogDescription>
            {member 
              ? 'Modifiez les informations du membre ci-dessous.' 
              : 'Ajoutez un nouveau membre en remplissant le formulaire ci-dessous.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              pattern="[0-9]{10}"
              placeholder="0612345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status_id.toString()}
              onValueChange={(value) => setFormData({ ...formData, status_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {member ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberModal;