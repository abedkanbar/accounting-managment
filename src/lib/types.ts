// Types pour les paramètres de l'API
export interface ContactsParams {
  page: number;
  limit: number;
  adherent?: number;
  membrefondateur?: number;
  membrecotisant?: number;
  donateur?: number;
  agentrecette?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  nomOuPrenom?: string;
}

export interface OperationsParams {
  page: number;
  limit: number;
  idtypeoperation?: number;
  moyenpaiement?: number;
  moiscotisation?: number;
  anneecotisation?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export type SortDirection = 'asc' | 'desc' | '';