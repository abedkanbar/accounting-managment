import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

const Logout = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
          variant: 'success',
          title: 'Succès',
          description: 'Déconnexion réussie',
        });
      navigate('/login');
    } catch (error) {
      toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message || 'Erreur lors de la déconnexion',
        });
    }
  };

  return (
    <Container className="h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Déconnexion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <Button
              onClick={handleLogout}
              className="w-full"
              variant="destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Logout;