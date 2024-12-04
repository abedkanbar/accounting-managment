// Interfaces
export interface AdherentsEcole {
  idcontact: number;
  prenom: string;
  nom: string;
  anneescolaire: number;
  nbenfants: number;
}

export interface AnneesScolaire {
  annee: number;
  libelle: string;
  montantcotisation: number;
}

export interface AppelCotisations {
  idliste: number;
  nrcontact: number;
  idcontact: number | null;
  montantcotisation: number;
  datereceptioncotisation: Date | null;
  signatureagent: string;
  signaturecotisant: string;
}

export interface AppelCotisationsEcole {
  idliste: number;
  nrcontact: number;
  idcontact: number | null;
  montantcotisation: number;
  datereceptioncotisation: Date | null;
  signatureagent: string;
  commentaire: Uint8Array;
}

export interface ComptesBancaires {
  idcompte: number;
  libelle: string;
  titulaire: string;
  adressetitulaire: string;
  domiciliation: string;
  adressedomiciliation: string;
  codebanque: string;
  codeguichet: string;
  nrcompte: string;
  clerib: string;
  iban: string;
  swift: string;
  bic: string;
}

export interface Contact {
  idcontact: number;
  prenom: string;
  nom: string;
  alias: string;
  photo: Uint8Array;
  adherent: number;
  membrefondateur: number;
  membrecotisant: number;
  donateur: number;
  agentrecette: number;
  dateadhesion: Date;
  fonction: string;
  telfix: string;
  fax: string;
  mobile: string;
  adresse1: string;
  codepostal: string;
  ville: string;
  adresse2: string;
  pays: string;
  email: string;
  montantcotisation: number;
  idagentrecetteref: string;
}

export interface Operation {
  idoperation?: number;
  libelle: string;
  dateoperation: Date;
  idtypeoperation: number;
  refoperation?: string;
  moyenpaiement?: number;
  refcheque?: string;
  credit: number;
  debit: number;
  idcontactpercepteur?: number;
  idcontactcotisant?: number;
  membrecotisant?: number;
  anneecotisation?: number;
  moiscotisation?: number;
  idcomptedestination?: number;
}

// Interface pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface TypeOperation {
  id: number;
  libelle: string;
}

export const OperationsTypes: TypeOperation[] = [
  { id: 1, libelle: 'Cotisation adhérent' },
  { id: 2, libelle: 'Don' },
  { id: 3, libelle: 'Tirelire' },
  { id: 4, libelle: 'Ecole - Autre que Frais de scolarité' },
  { id: 5, libelle: 'Ecole - Frais de scolarité' },
  { id: 6, libelle: 'Ecole - Salaire prof.' },
  { id: 7, libelle: 'Achat' },
  { id: 8, libelle: 'Location salle' },
  { id: 9, libelle: 'Sortie' },
  { id: 10, libelle: 'Solde Initial' },
  { id: 11, libelle: 'Dépôt' },
  { id: 12, libelle: 'Transfert vers compte' },
  { id: 13, libelle: 'Arrêté de compte' },
];

export interface PaymentMethod {
  id: number;
  libelle: string;
}

export const PaymentMethodType: PaymentMethod[] = [
  { id: 1, libelle: 'Liquide' },
  { id: 2, libelle: 'Chèque' },
  { id: 3, libelle: 'Carte bancaire' },
  { id: 4, libelle: 'Virement' },
  { id: 5, libelle: 'Virement bancaire' },
];

export function getTypeOperationLabel(id: number): string {
  return OperationsTypes.find((type) => type.id === id)?.libelle || 'Inconnu';
}

export function getMoyenPaiementLabel(id: number): string {
  return PaymentMethodType.find((type) => type.id === id)?.libelle || 'Inconnu';
}

// Fonction utilitaire pour les requêtes API
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: 'amUgc3VpcyDDoCBsJ2FicmkgZGUgdG91dCBjZSBxdWkgcGFzc2U=',
  };

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}${endpoint}`,
    mergedOptions
  );
  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
  return response.json();
}

// Fonctions pour les entités

// Adherents
async function getAdherents(
  page: number = 1,
  limit: number = 10,
  anneescolaire?: number,
  nomOuPrenom?: string,
  orderBy?: string,
  orderDir?: string
): Promise<PaginatedResponse<AdherentsEcole>> {
  let url = `/adherents?page=${page}&limit=${limit}`;
  if (anneescolaire) {
    url += `&anneescolaire=${anneescolaire}`;
  }
  if (nomOuPrenom) {
    url += `&nomOuPrenom=${nomOuPrenom}`;
  }
  if (orderBy) {
    url += `&orderBy=${orderBy}`;
  }
  if (orderDir) {
    url += `&orderDir=${orderDir}`;
  }
  return fetchAPI(url);
}

async function createAdherent(adherent: Partial<AdherentsEcole>): Promise<AdherentsEcole> {
  return fetchAPI('/adherents', {
    method: 'POST',
    body: JSON.stringify(adherent),
  });
}

async function updateAdherent(
  id: number,
  adherent: Partial<AdherentsEcole>
): Promise<AdherentsEcole> {
  return fetchAPI(`/adherents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(adherent),
  });
}

// Operations
async function getOperations(
  page: number = 1,
  limit: number = 10,
  idtypeoperation?: number,
  moyenpaiement?: number,
  moiscotisation?: number,
  anneecotisation?: number,
  orderBy?: string,
  orderDir?: string
): Promise<PaginatedResponse<Operation>> {
  var queryString = '';
  const conditions = [];
  if (idtypeoperation != undefined) {
    conditions.push(`idtypeoperation=${idtypeoperation}`);
  }
  if (moyenpaiement != undefined) {
    conditions.push(`moyenpaiement=${moyenpaiement}`);
  }

  if (moiscotisation != undefined) {
    conditions.push(`moiscotisation=${moiscotisation}`);
  }

  if (anneecotisation != undefined) {
    conditions.push(`anneecotisation=${anneecotisation}`);
  }

  if (orderBy != undefined) {
    conditions.push(`orderBy=${orderBy}`);
  }

  if (orderDir != undefined) {
    conditions.push(`orderDir=${orderDir}`);
  }

  if (conditions.length > 0) {
    queryString += '&' + conditions.join('&');
  }

  return fetchAPI(`/operations?page=${page}&limit=${limit}${queryString}`);
}

async function createOperation(operation: Operation): Promise<any> {
  return fetchAPI('/operations', {
    method: 'POST',
    body: JSON.stringify(operation),
  });
}

async function updateOperation(id: number, operation: Operation): Promise<any> {
  return fetchAPI(`/operations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(operation),
  });
}

// Annees
async function getAnnees(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<AnneesScolaire>> {
  return fetchAPI(`/annees?page=${page}&limit=${limit}`);
}

async function createAnnee(annee: AnneesScolaire): Promise<any> {
  return fetchAPI('/annees', {
    method: 'POST',
    body: JSON.stringify(annee),
  });
}

async function updateAnnee(id: number, annee: AnneesScolaire): Promise<any> {
  return fetchAPI(`/annees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(annee),
  });
}

// AppelCotisations
async function getAppelCotisations(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<AppelCotisations>> {
  return fetchAPI(`/appelcotisations?page=${page}&limit=${limit}`);
}

async function createAppelCotisation(
  appelCotisation: AppelCotisations
): Promise<any> {
  return fetchAPI('/appelcotisations', {
    method: 'POST',
    body: JSON.stringify(appelCotisation),
  });
}

async function updateAppelCotisation(
  id: number,
  appelCotisation: AppelCotisations
): Promise<any> {
  return fetchAPI(`/appelcotisations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appelCotisation),
  });
}

// AppelCotisationsEcole
async function getAppelCotisationsEcole(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<AppelCotisationsEcole>> {
  return fetchAPI(`/appelcotisationsecole?page=${page}&limit=${limit}`);
}

async function createAppelCotisationEcole(
  appelCotisationEcole: AppelCotisationsEcole
): Promise<any> {
  return fetchAPI('/appelcotisationsecole', {
    method: 'POST',
    body: JSON.stringify(appelCotisationEcole),
  });
}

async function updateAppelCotisationEcole(
  id: number,
  appelCotisationEcole: AppelCotisationsEcole
): Promise<any> {
  return fetchAPI(`/appelcotisationsecole/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appelCotisationEcole),
  });
}

// ComptesBancaires
async function getComptesBancaires(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<ComptesBancaires>> {
  return fetchAPI(`/comptesbancaires?page=${page}&limit=${limit}`);
}

async function createComptesBancaire(
  comptesBancaire: ComptesBancaires
): Promise<any> {
  return fetchAPI('/comptesbancaires', {
    method: 'POST',
    body: JSON.stringify(comptesBancaire),
  });
}

async function updateComptesBancaire(
  id: number,
  comptesBancaire: ComptesBancaires
): Promise<any> {
  return fetchAPI(`/comptesbancaires/${id}`, {
    method: 'PUT',
    body: JSON.stringify(comptesBancaire),
  });
}

// Contacts
async function getContacts(
  page: number = 1,
  limit: number = 10,
  adherent?: boolean,
  membrefondateur?: boolean,
  membrecotisant?: boolean,
  donateur?: boolean,
  agentrecette?: boolean,
  orderBy?: string,
  orderDir?: string,
  nomOuPrenom?: string
): Promise<PaginatedResponse<Contact>> {
  const params = new URLSearchParams();
  
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (adherent !== undefined) params.append('adherent', adherent.toString());
  if (membrefondateur !== undefined) params.append('membrefondateur', membrefondateur.toString());
  if (membrecotisant !== undefined) params.append('membrecotisant', membrecotisant.toString());
  if (donateur !== undefined) params.append('donateur', donateur.toString());
  if (agentrecette !== undefined) params.append('agentrecette', agentrecette.toString());
  if (orderBy) params.append('orderBy', orderBy);
  if (orderDir) params.append('orderDir', orderDir);
  if (nomOuPrenom) params.append('nomOuPrenom', nomOuPrenom);

  return fetchAPI(`/contacts?${params.toString()}`);
}

async function createContact(contact: Contact): Promise<any> {
  return fetchAPI('/contacts', {
    method: 'POST',
    body: JSON.stringify(contact),
  });
}

async function updateContact(id: number, contact: Contact): Promise<any> {
  return fetchAPI(`/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(contact),
  });
}

// Export des fonctions
export {
  getAdherents,
  createAdherent,
  updateAdherent,
  getOperations,
  createOperation,
  updateOperation,
  getAnnees,
  createAnnee,
  updateAnnee,
  getAppelCotisations,
  createAppelCotisation,
  updateAppelCotisation,
  getAppelCotisationsEcole,
  createAppelCotisationEcole,
  updateAppelCotisationEcole,
  getComptesBancaires,
  createComptesBancaire,
  updateComptesBancaire,
  getContacts,
  createContact,
  updateContact,
};
