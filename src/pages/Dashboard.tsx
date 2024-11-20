import { useState, useEffect } from 'react';
import { getContacts, getAppelCotisations, getAppelCotisationsEcole } from '@/lib/api';
import type { Contact, AppelCotisations, AppelCotisationsEcole } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, School, Euro, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalAdherents: 0,
    totalCotisations: 0,
    totalCotisationsEcole: 0,
    montantCotisations: 0,
    montantCotisationsEcole: 0,
    recentCotisations: [] as AppelCotisations[],
    recentCotisationsEcole: [] as AppelCotisationsEcole[],
    contacts: [] as Contact[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contacts, cotisations, cotisationsEcole] = await Promise.all([
        getContacts(),
        getAppelCotisations(),
        getAppelCotisationsEcole(),
      ]);

      const adherents = contacts.filter(c => c.adherent === 1);
      const montantCotisations = cotisations.reduce((sum, c) => sum + c.montantcotisation, 0);
      const montantCotisationsEcole = cotisationsEcole.reduce((sum, c) => sum + c.montantcotisation, 0);

      // Trier les cotisations par date et prendre les 5 plus récentes
      const recentCotisations = [...cotisations]
        .sort((a, b) => new Date(b.datereceptioncotisation || 0).getTime() - new Date(a.datereceptioncotisation || 0).getTime())
        .slice(0, 5);

      const recentCotisationsEcole = [...cotisationsEcole]
        .sort((a, b) => new Date(b.datereceptioncotisation || 0).getTime() - new Date(a.datereceptioncotisation || 0).getTime())
        .slice(0, 5);

      setStats({
        totalContacts: contacts.length,
        totalAdherents: adherents.length,
        totalCotisations: cotisations.length,
        totalCotisationsEcole: cotisationsEcole.length,
        montantCotisations,
        montantCotisationsEcole,
        recentCotisations,
        recentCotisationsEcole,
        contacts,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const getContactName = (contactId: number) => {
    const contact = stats.contacts.find(c => c.idcontact === contactId);
    return contact ? `${contact.prenom} ${contact.nom}` : 'Contact inconnu';
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <h2 className="text-2xl font-bold">{stats.totalContacts}</h2>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adhérents</p>
                <h2 className="text-2xl font-bold">{stats.totalAdherents}</h2>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cotisations</p>
                <h2 className="text-2xl font-bold">{stats.montantCotisations.toLocaleString('fr-FR')} €</h2>
              </div>
              <Euro className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cotisations École</p>
                <h2 className="text-2xl font-bold">{stats.montantCotisationsEcole.toLocaleString('fr-FR')} €</h2>
              </div>
              <School className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dernières cotisations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentCotisations.map((cotisation) => (
                <div key={cotisation.idliste} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{getContactName(cotisation.nrcontact)}</p>
                    <p className="text-sm text-muted-foreground">
                      {cotisation.datereceptioncotisation 
                        ? format(new Date(cotisation.datereceptioncotisation), 'dd MMMM yyyy', { locale: fr })
                        : 'Non reçue'}
                    </p>
                  </div>
                  <p className="font-medium">{cotisation.montantcotisation.toLocaleString('fr-FR')} €</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dernières cotisations école</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentCotisationsEcole.map((cotisation) => (
                <div key={cotisation.idliste} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{getContactName(cotisation.nrcontact)}</p>
                    <p className="text-sm text-muted-foreground">
                      {cotisation.datereceptioncotisation 
                        ? format(new Date(cotisation.datereceptioncotisation), 'dd MMMM yyyy', { locale: fr })
                        : 'Non reçue'}
                    </p>
                  </div>
                  <p className="font-medium">{cotisation.montantcotisation.toLocaleString('fr-FR')} €</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}