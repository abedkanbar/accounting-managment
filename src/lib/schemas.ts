import { z } from 'zod';

export const contactSchema = z.object({
  prenom: z.string().min(2, 'Le prénom est requis'),
  nom: z.string().min(2, 'Le nom est requis'),
  alias: z.string().optional(),
  adherent: z.boolean(),
  membrefondateur: z.boolean(),
  membrecotisant: z.boolean(),
  donateur: z.boolean(),
  agentrecette: z.boolean(),
  dateadhesion: z.date(),
  fonction: z.string().optional(),
  telfix: z.string().optional(),
  fax: z.string().optional(),
  mobile: z.string().optional(),
  adresse1: z.string().optional(),
  codepostal: z.string().optional(),
  ville: z.string().optional(),
  adresse2: z.string().optional(),
  pays: z.string().optional(),
  email: z.string().optional(),
  montantcotisation: z.number().min(0),
  idagentrecetteref: z.number().optional(),
});

export const compteBancaireSchema = z.object({
  libelle: z.string().min(2, 'Le libellé est requis'),
  titulaire: z.string().min(2, 'Le titulaire est requis'),
  adressetitulaire: z.string().min(2, "L'adresse du titulaire est requise"),
  domiciliation: z.string().min(2, 'La domiciliation est requise'),
  adressedomiciliation: z
    .string()
    .min(2, "L'adresse de domiciliation est requise"),
  codebanque: z.string().optional(),
  codeguichet: z.string().optional(),
  nrcompte: z.string().optional(),
  clerib: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  bic: z.string().optional(),
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
  libelle: z.string().min(2, 'Le libellé est requis'),
  dateoperation: z.date(),
  idtypeoperation: z.number().min(1, "Le type d'operation est requis"),
  refoperation: z.string().optional(),
  moyenpaiement: z.number().min(1, 'Le moyen de paiement est requis'),
  refcheque: z.string().optional(),
  credit: z.coerce
  .number({ invalid_type_error: 'Le montant doit être un nombre' })
  .min(0, 'Le montant doit être positif'),
  debit: z.coerce
  .number({ invalid_type_error: 'Le montant doit être un nombre' }),
  idcontactpercepteur: z.number().min(1, 'Le contact percepteur est requis'),
  idcontactcotisant: z.number().min(1, 'Le contact cotisant est requis'),
  anneecotisation: z.number().min(0),
  moiscotisation: z.number().min(1),
  idcomptedestination: z.number().min(0),
});

export const adherentSchema = z.object({
  idcontact: z.number().min(1, 'Le contact est requis'),
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
