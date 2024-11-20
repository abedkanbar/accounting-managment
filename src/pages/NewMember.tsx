import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../lib/db';
import toast from 'react-hot-toast';
import type { Member, MemberStatus } from '../lib/db';

const NewMember = () => {
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
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      const statusList = await db.getMemberStatuses();
      setStatuses(statusList);
      if (statusList.length > 0) {
        // Définir le premier statut comme valeur par défaut
        setFormData(prev => ({ ...prev, status_id: statusList[0].id }));
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des statuts');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await db.insertMember(formData);
      toast.success('Adhérent ajouté avec succès');
      navigate('/members');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'adhérent');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Nouvel Adhérent</h2>
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
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewMember;