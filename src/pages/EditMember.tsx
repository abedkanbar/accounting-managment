import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDatabase } from '../lib/db';
import toast from 'react-hot-toast';
import type { Member, MemberStatus } from '../lib/db';

const EditMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = useDatabase();
  const [statuses, setStatuses] = useState<MemberStatus[]>([]);
  const [formData, setFormData] = useState<Omit<Member, 'id' | 'created_at'>>({
    name: '',
    email: '',
    phone: '',
    status_id: 0
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [memberData, statusList] = await Promise.all([
        db.getAllMembers(),
        db.getMemberStatuses()
      ]);

      setStatuses(statusList);

      if (id) {
        const member = memberData.find(m => m.id === parseInt(id));
        if (member) {
          setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            status_id: member.status_id
          });
        } else {
          toast.error('Membre non trouvé');
          navigate('/members');
        }
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      navigate('/members');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (id) {
        await db.updateMember(parseInt(id), formData);
        toast.success('Membre mis à jour avec succès');
      }
      navigate('/members');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du membre');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Modifier l'adhérent</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom complet</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            pattern="[0-9]{10}"
            placeholder="0612345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Statut</label>
          <select
            value={formData.status_id}
            onChange={(e) => setFormData({ ...formData, status_id: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Mettre à jour
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMember;