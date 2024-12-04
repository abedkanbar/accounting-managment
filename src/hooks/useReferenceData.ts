import { useState, useEffect, useCallback } from 'react';
import { getContacts, getComptesBancaires } from '@/lib/api';
import type { Contact, ComptesBancaires } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useReferenceData() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bankAccounts, setBankAccounts] = useState<ComptesBancaires[]>([]);
  const [agentPerceptor, setAgentPerceptor] = useState<Contact[]>([]);
  const [contactcotisant, setContactcotisant] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadReferenceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [contactsData, accountsData] = await Promise.all([
        getContacts( 1, 1000).catch(() => ({ data: [], pagination: { total: 0 } })),
        getComptesBancaires().catch(() => ({ data: [], pagination: { total: 0 } })),
      ]);

      setContacts(contactsData.data);
      setBankAccounts(accountsData.data);

      // Filtrer les agents percepteurs (agentrecette = 1)
      setAgentPerceptor(
        contactsData.data.filter(c => c.agentrecette == 1)
      );

      // Filtrer les membres cotisants (membrecotisant = 1)
      setContactcotisant(
        contactsData.data.filter(c => c.membrecotisant == 1)
      );

    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Erreur lors du chargement des données de référence');
      console.error(
        'Erreur lors du chargement des données de référence:',
        error
      );
      setError(error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les données de référence',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  const getContactName = useCallback(
    (id?: number) => {
      if (!id) return '-';
      const contact = contacts.find((c) => c.idcontact === id);
      return contact ? `${contact.prenom} ${contact.nom}` : 'Contact inconnu';
    },
    [contacts]
  );

  const getBankAccountName = useCallback(
    (id?: number) => {
      if (!id) return '-';
      const account = bankAccounts.find((a) => a.idcompte === id);
      return account?.libelle || 'Compte inconnu';
    },
    [bankAccounts]
  );

  
const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  return {
    contacts,
    bankAccounts,
    agentPerceptor,
    contactcotisant,
    loading,
    error,
    reload: loadReferenceData,
    getContactName,
    getBankAccountName,
    months
  };
}