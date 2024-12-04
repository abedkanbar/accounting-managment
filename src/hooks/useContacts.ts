import { useState, useCallback } from 'react';
import { getContacts } from '@/lib/api';
import type { Contact } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadContacts = useCallback(async (searchTerm?: string) => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log('Loading contacts...');
      
      const response = await getContacts(
        1, 
        10, 
        undefined, 
        undefined, 
        undefined, 
        undefined, 
        undefined, 
        undefined, 
        undefined, 
        searchTerm
      );
      
      setContacts(response.data);
      console.log('Contacts loaded successfully');
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
  }, [loading, toast]);

  return {
    contacts,
    loading,
    loadContacts
  };
}