import { z } from "zod";

export const contactSchema = z.object({
  prenom: z.string().min(2, "Le prénom est requis"),
  nom: z.string().min(2, "Le nom est requis"),
  alias: z.string().optional(),
  adherent: z.number().min(0).max(1),
  membrefondateur: z.number().min(0).max(1),
  membrecotisant: z.number().min(0).max(1),
  donateur: z.number().min(0).max(1),
  agentrecette: z.number().min(0).max(1),
  dateadhesion: z.date(),
  fonction: z.string().optional(),
  telfix: z.string().optional(),
  fax: z.string().optional(),
});

export const compteBancaireSchema = z.object({
  libelle: z.string().min(2, "Le libellé est requis"),
  titulaire: z.string().min(2, "Le titulaire est requis"),
  adressetitulaire: z.string().min(2, "L'adresse du titulaire est requise"),
  domiciliation: z.string().min(2, "La domiciliation est requise"),
  adressedomiciliation: z.string().min(2, "L'adresse de domiciliation est requise"),
  codebanque: z.string().length(5, "Le code banque doit faire 5 caractères"),
  codeguichet: z.string().length(5, "Le code guichet doit faire 5 caractères"),
  nrcompte: z.string().min(11, "Le numéro de compte est invalide"),
  clerib: z.string().length(2, "La clé RIB doit faire 2 caractères"),
  iban: z.string().min(27, "L'IBAN est invalide"),
  swift: z.string().min(8, "Le code SWIFT est invalide"),
  bic: z.string().min(8, "Le code BIC est invalide"),
});

export const anneeScolaireSchema = z.object({
  annee: z.number().min(2000, "L'année doit être supérieure à 2000"),
  libelle: z.string().min(2, "Le libellé est requis"),
  montantcotisation: z.number().min(0, "Le montant doit être positif"),
});

export const appelCotisationSchema = z.object({
  nrcontact: z.number().min(1, "Le numéro de contact est requis"),
  montantcotisation: z.number().min(0, "Le montant doit être positif"),
  datereceptioncotisation: z.date().nullable(),
  signatureagent: z.string().min(2, "La signature de l'agent est requise"),
  signaturecotisant: z.string().min(2, "La signature du cotisant est requise"),
});

export const appelCotisationEcoleSchema = z.object({
  nrcontact: z.number().min(1, "Le numéro de contact est requis"),
  montantcotisation: z.number().min(0, "Le montant doit être positif"),
  datereceptioncotisation: z.date().nullable(),
  signatureagent: z.string().min(2, "La signature de l'agent est requise"),
  commentaire: z.string().optional(),
});

export const operationSchema = z.object({
  libelle: z.string().min(2, "Le libellé est requis"),
  dateoperation: z.date(),
  idtypeoperation: z.number().min(1, "Le type d'operation est requis"),
  refoperation: z.string().optional(),
  moyenpaiement: z.number().min(1, "Le moyen de paiement est requis"),
  refcheque: z.string().optional(),
  credit: z.number().min(0, "Le montant doit être positif"),
  debit: z.number().min(0, "Le montant doit être positif"),
  idcontactpercepteur: z.number().min(1, "Le contact percepteur est requis"),
  idcontactcotisant: z.number().min(1, "Le contact cotisant est requis"),
  membrecotisant: z.number().min(0).max(1),
  anneecotisation: z.number().min(0),
  moiscotisation: z.number().min(0),
  idcomptedestination: z.number().min(0),
});


export type OperationFormData = z.infer<typeof operationSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type CompteBancaireFormData = z.infer<typeof compteBancaireSchema>;
export type AnneeScolaireFormData = z.infer<typeof anneeScolaireSchema>;
export type AppelCotisationFormData = z.infer<typeof appelCotisationSchema>;
export type AppelCotisationEcoleFormData = z.infer<typeof appelCotisationEcoleSchema>;