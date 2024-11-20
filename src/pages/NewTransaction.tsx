import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../lib/db';
import toast from 'react-hot-toast';
import type { Member, Transaction, TransactionType, PaymentMethod, BankAccount } from '../lib/db';

const NewTransaction = () => {
  const navigate = useNavigate();
  const db = useDatabase();
  const [members, setMembers] = useState<Member[]>([]);
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'created_at'>>({
    date: new Date(),
    type_id: 0,
    amount: 0,
    payment_method_id: 0,
    member_id: 0,
    bank_account_id: 0,
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersData, typesData, methodsData, accountsData] = await Promise.all([
        db.getAllMembers(),
        db.getTransactionTypes(),
        db.getPaymentMethods(),
        db.getAllBankAccounts()
      ]);

      setMembers(membersData);
      setTypes(typesData);
      setPaymentMethods(methodsData);
      setBankAccounts(accountsData);

      // Set default values if data is available
      if (typesData.length > 0) setFormData(prev => ({ ...prev, type_id: typesData[0].id }));
      if (methodsData.length > 0) setFormData(prev => ({ ...prev, payment_method_id: methodsData[0].id }));
      if (accountsData.length > 0) setFormData(prev => ({ ...prev, bank_account_id: accountsData[0].id }));
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.insertTransaction(formData);
      toast.success('Transaction ajoutée avec succès');
      navigate('/transactions');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout de la transaction');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Nouvelle Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={formData.date.toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type_id}
            onChange={(e) => setFormData({ ...formData, type_id: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un type</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Montant (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Moyen de paiement</label>
          <select
            value={formData.payment_method_id}
            onChange={(e) => setFormData({ ...formData, payment_method_id: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un moyen de paiement</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>{method.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Compte bancaire</label>
          <select
            value={formData.bank_account_id}
            onChange={(e) => setFormData({ ...formData, bank_account_id: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un compte</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Adhérent</label>
          <select
            value={formData.member_id}
            onChange={(e) => setFormData({ ...formData, member_id: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un adhérent</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/transactions')}
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

export default NewTransaction;