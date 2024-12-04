import { useState, useCallback, useEffect } from 'react';
import { getAdherents } from '@/lib/api';
import type { AdherentsEcole } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseAdherentsProps {
  currentPage: number;
  pageSize: number;
  selectedYear: string;
  searchTerm: string;
  sortConfig: {
    column: string;
    direction: 'asc' | 'desc' | '';
  };
}

export function useAdherents({
  currentPage,
  pageSize,
  selectedYear,
  searchTerm,
  sortConfig,
}: UseAdherentsProps) {
  const [adherents, setAdherents] = useState<AdherentsEcole[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const loadAdherents = useCallback(async () => {
    try {
      //setLoading(true);
      const response = await getAdherents(
        currentPage,
        pageSize,
        selectedYear !== 'all' ? parseInt(selectedYear) : undefined,
        searchTerm || undefined
      );

      let sortedData = [...response.data];
      if (sortConfig.column && sortConfig.direction) {
        sortedData.sort((a, b) => {
          const aValue = String(a[sortConfig.column as keyof AdherentsEcole] || '').toLowerCase();
          const bValue = String(b[sortConfig.column as keyof AdherentsEcole] || '').toLowerCase();
          const modifier = sortConfig.direction === 'asc' ? 1 : -1;
          
          return aValue.localeCompare(bValue) * modifier;
        });
      }

      setAdherents(sortedData);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error loading adherents:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les adhérents',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedYear, searchTerm, sortConfig, toast]);

  useEffect(() => {
    loadAdherents();
  }, [loadAdherents]);

  return {
    adherents,
    loading,
    totalItems,
    refresh: loadAdherents,
  };
}