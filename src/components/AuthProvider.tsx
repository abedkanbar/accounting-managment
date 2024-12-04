import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, User } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const publicRoutes = ['/login', '/forgot-password'];
  useEffect(() => {
    // Vérifier la session actuelle
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session && !publicRoutes.includes(window.location.pathname)) {
        navigate('/login');
      }
    };

    checkSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        navigate('/login');
        toast({
          title: "Déconnexion",
          description: "Vous avez été déconnecté avec succès",
        });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour",
        });
      }
      setLoading(false);
    });

    // Vérifier l'expiration de la session toutes les minutes
    const sessionCheckInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !loading && !publicRoutes.includes(window.location.pathname)) {
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
        });
        navigate('/login');
      }
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [navigate, loading, toast]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signOut
  };

  return (
      <AuthContext.Provider value={value}>
        {loading ? (
          <div>Chargement...</div>
        ) : (
          children
        )}
      </AuthContext.Provider>
  );
};