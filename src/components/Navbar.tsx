import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Users, 
  School, 
  CreditCard, 
  Contact2, 
  Calendar,
  GraduationCap,
  LayoutDashboard
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/adherents', label: 'Adhérents', icon: Users },
  { path: '/contacts', label: 'Contacts', icon: Contact2 },
  { path: '/comptes', label: 'Comptes Bancaires', icon: CreditCard },
  { path: '/operations', label: 'Operations', icon: Calendar },
  { path: '/cotisations', label: 'Cotisations', icon: Calendar },
  { path: '/cotisations-ecole', label: 'Cotisations École', icon: School },
  { path: '/annees-scolaires', label: 'Années Scolaires', icon: GraduationCap },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <ScrollArea className="h-[calc(100vh-5rem)] px-4">
      <nav className="space-y-2">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path}>
            <Button
              variant="ghost"
              className={cn(
                "nav-link w-full justify-start gap-2",
                location.pathname === path && "active"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Button>
          </Link>
        ))}
      </nav>
    </ScrollArea>
  );
}