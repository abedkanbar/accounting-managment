import { z } from 'zod';

export const contactSchema = z.object({
  prenom: z.string().min(2, 'Le prénom est requis').max(20, 'Le prénom ne doit pas contenir plus de 20 caractères'),
  nom: z.string().min(2, 'Le nom est requis').max(20, 'Le nom ne doit pas contenir plus de 20 caractères'),
  alias: z.string().max(30, 'L\'alias ne doit pas contenir plus de 30 caractères').optional(),
  adherent: z.number(),
  membrefondateur: z.number(),
  membrecotisant: z.number(),
  donateur: z.number(),
  agentrecette: z.number(),
  dateadhesion: z.date(),
  fonction: z.string().max(20, 'La fonction ne doit pas contenir plus de 20 caractères').optional(),
  telfix: z.string().max(20, 'Le tелефone fixe ne doit pas contenir plus de 20 caractères').optional(),
  fax: z.string().max(20, 'Le fax ne doit pas contenir plus de 20 caractères').optional(),
  mobile: z.string().max(20, 'Le mobile ne doit pas contenir plus de 20 caractères').optional(),
  adresse1: z.string().max(30, 'L\'adresse 1 ne doit pas contenir plus de 30 caractères').optional(),
  codepostal: z.string().max(5, 'Le code postal ne doit pas contenir plus de 5 caractères').optional(),
  ville: z.string().max(20, 'La ville ne doit pas contenir plus de 20 caractères').optional(),
  adresse2: z.string().max(10, 'L\'adresse 2 ne doit pas contenir plus de 10 caractères').optional(),
  pays: z.string().max(20, 'Le pays ne doit pas contenir plus de 20 caractères').optional(),
  email: z.string().max(25, 'L\'email ne doit pas contenir plus de 25 caractères').optional(),
  montantcotisation: z.number().min(0),
  idagentrecetteref: z.number().optional(),
});

export const compteBancaireSchema = z.object({
  libelle: z.string().min(2, 'Le libellé est requis').max(50, 'Le libellé ne doit pas contenir plus de 50 caractères'),
  titulaire: z.string().min(2, 'Le titulaire est requis').max(30, 'Le titulaire ne doit pas contenir plus de 30 caractères'),
  adressetitulaire: z.string().min(2, "L'adresse du titulaire doit contenir au moins 2 caractères")
    .max(30, 'L\'adresse du titulaire ne doit pas contenir plus de 30 caractères')
    .optional().or(z.literal('')),
  domiciliation: z.string().min(2, 'La domiciliation est requise')
  .max(30, 'La domiciliation ne doit pas contenir plus de 30 caractères')
  .optional().or(z.literal('')),
  adressedomiciliation: z
    .string()
    .min(2, "L'adresse de domiciliation doit contenir au moins 2 caractères")
    .max(100, 'L\'adresse de domiciliation ne doit pas contenir plus de 100 caractères')
    .optional().or(z.literal('')),
  codebanque: z.string().max(50, 'Le code banque ne doit pas contenir plus de 50 caractères').optional(),
  codeguichet: z.string().max(50, 'Le code guichet ne doit pas contenir plus de 50 caractères').optional(),
  nrcompte: z.string().max(50, 'Le numéro de compte ne doit pas contenir plus de 50 caractères').optional(),
  clerib: z.string().max(2, 'Le clé RIB ne doit pas contenir plus de 2 caractères').optional(),
  iban: z.string().max(50, 'Le IBAN ne doit pas contenir plus de 50 caractères').optional(),
  swift: z.string().max(20, 'Le SWIFT ne doit pas contenir plus de 20 caractères').optional(),
  bic: z.string().max(20, 'Le BIC ne doit pas contenir plus de 50 caractères').optional(),
});

export const anneeScolaireSchema = z.object({
  annee: z.number().min(2000, "L'année doit être supérieure à 2000"),
  libelle: z.string().min(2, 'Le libellé est requis'),
  montantcotisation: z.coerce.number({ invalid_type_error: 'Le montant doit être un nombre' }).min(0, 'Le montant doit être positif'),
});

export const appelCotisationSchema = z.object({
  nrcontact: z.number().min(1, 'Le numéro de contact est requis'),
  montantcotisation: z.number().min(0, 'Le montant doit être positif'),
  datereceptioncotisation: z.date().nullable(),
  signatureagent: z.string().min(2, "La signature de l'agent est requise"),
  signaturecotisant: z.string().min(2, 'La signature du cotisant est requise'),
});

export const appelCotisationEcoleSchema = z.object({
  nrcontact: z.number().min(1, 'Le numéro de contact est requis'),
  montantcotisation: z.number().min(0, 'Le montant doit être positif'),
  datereceptioncotisation: z.date().nullable(),
  signatureagent: z.string().min(2, "La signature de l'agent est requise"),
  commentaire: z.string().optional(),
});

export const operationSchema = z.object({
  libelle: z.string().min(2, 'Le libellé est requis').max(100, 'Le libellé ne doit pas contenir plus de 100 caractères'),
  dateoperation: z.date(),
  idtypeoperation: z.number().min(1, "Le type d'operation est requis"),
  refoperation: z.string().max(30, 'La reference ne doit pas contenir plus de 30 caractères').optional(),
  moyenpaiement: z.number().min(1, 'Le moyen de paiement est requis'),
  refcheque: z.string().max(10, 'La reference ne doit pas contenir plus de 10 caractères').optional(),
  credit: z.coerce.number({ invalid_type_error: 'Le montant doit être un nombre' }).min(0, 'Le montant doit être positif'),
  debit: z.coerce.number({ invalid_type_error: 'Le montant doit être un nombre' }),
  idcontactpercepteur: z.number().min(1, 'Le contact percepteur est requis'),
  idcontactcotisant: z.number().optional(),
  anneecotisation: z.number().min(0),
  moiscotisation: z.number().min(1),
  idcomptedestination: z.number().min(0),
});

export const adherentSchema = z.object({
  idcotisantecole: z.number().min(1, 'Le contact est requis'),
  anneescolaire: z.number().min(2000, "L'année scolaire est requise"),
  nbenfants: z.number().min(0, "Le nombre d'enfants doit être positif"),
});

export type OperationFormData = z.infer<typeof operationSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type CompteBancaireFormData = z.infer<typeof compteBancaireSchema>;
export type AnneeScolaireFormData = z.infer<typeof anneeScolaireSchema>;
export type AppelCotisationFormData = z.infer<typeof appelCotisationSchema>;
export type AppelCotisationEcoleFormData = z.infer<
  typeof appelCotisationEcoleSchema
>;
export type AdherentFormData = z.infer<typeof adherentSchema>;
