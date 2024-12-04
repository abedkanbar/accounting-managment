import { useState, useEffect, useCallback, useRef } from 'react';
import { useDatabase } from '../lib/db';
import type { TransactionStats } from '../lib/db';
import toast from 'react-hot-toast';

export const useTransactionStats = (initialGroupBy: string[]) => {
  const db = useDatabase();
  const [stats, setStats] = useState<TransactionStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const groupByRef = useRef(initialGroupBy);

  const loadStats = useCallback(async () => {
    if (!db) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await db.getTransactionStats(groupByRef.current);
      setStats(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des statistiques');
      console.error('Error loading transaction stats:', error);
      setError(error);
      setStats([]);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    groupByRef.current = initialGroupBy;
  }, [initialGroupBy]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, reload: loadStats };
};

export default useTransactionStats;