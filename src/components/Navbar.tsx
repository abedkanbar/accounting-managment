import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  Users,
  CreditCard,
  Contact2,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useAuth } from '../lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/adherents', label: 'Adhérents', icon: Users },
  { path: '/contacts', label: 'Contacts', icon: Contact2 },
  { path: '/comptes', label: 'Comptes Bancaires', icon: CreditCard },
  { path: '/operations', label: 'Operations', icon: Calendar },
  { path: '/annees-scolaires', label: 'Années Scolaires', icon: GraduationCap },
];

export default function Navbar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-5rem)] px-4">
      <nav className="space-y-2">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path}>
            <Button
              variant="ghost"
              className={cn(
                'nav-link w-full justify-start gap-2',
                location.pathname === path && 'active'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Button>
          </Link>
        ))}

        <Button
          variant="ghost"
          className="nav-link w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-100/50"
          onClick={() => setIsLogoutDialogOpen(true)}
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </nav>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à l'application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 text-white hover:bg-red-700">
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollArea>
  );
}