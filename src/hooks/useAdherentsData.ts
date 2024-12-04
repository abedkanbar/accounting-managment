import { useState, useCallback, useEffect, useRef } from 'react';
import { getAdherents } from '@/lib/api';
import type { AdherentsEcole } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseAdherentsDataProps {
  currentPage: number;
  pageSize: number;
  selectedYear: string;
  searchTerm: string;
  sortConfig: {
    column: string;
    direction: 'asc' | 'desc' | '';
  };
}

export function useAdherentsData({
  currentPage,
  pageSize,
  selectedYear,
  searchTerm,
  sortConfig,
}: UseAdherentsDataProps) {
  const [adherents, setAdherents] = useState<AdherentsEcole[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const isFirstRender = useRef(true);

  const loadAdherents = useCallback(async () => {
    try {
      setLoading(true);
      
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
      if (isFirstRender.current) {
        setInitialLoading(false);
        isFirstRender.current = false;
      }
    }
  }, [currentPage, pageSize, selectedYear, searchTerm, sortConfig, toast]);

  // Initial load
  useEffect(() => {
    if (isFirstRender.current) {
      loadAdherents();
    }
  }, [loadAdherents]);

  // Handle subsequent updates
  useEffect(() => {
    if (!isFirstRender.current) {
      const timer = setTimeout(() => {
        loadAdherents();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentPage, pageSize, selectedYear, searchTerm, sortConfig, loadAdherents]);

  return {
    adherents,
    loading,
    initialLoading,
    totalItems,
    refresh: loadAdherents,
  };
}