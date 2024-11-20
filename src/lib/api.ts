export interface AdherentsEcole {
    anneescolaire: number;
    idcotisantecole: number;
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

async function fetchAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, options);
    if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
    }
    return response.json();
}

// Adherents
async function getAdherents(): Promise<[AnneesScolaire]> {
    return fetchAPI('/adherents');
}

async function createAdherent(adherent: AdherentsEcole): Promise<any> {
    return fetchAPI('/adherents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(adherent),
    });
}

async function updateAdherent(id: number, adherent: AdherentsEcole): Promise<any> {
    return fetchAPI(`/adherents/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(adherent),
    });
}

// Operations
async function getOperations(): Promise<Operation[]> {
    return fetchAPI('/operations');
}

async function createOperation(operation: Operation): Promise<any> {
    return fetchAPI('/operations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(operation),
    });
}

async function updateOperation(id: number, operation: Operation): Promise<any> {
    return fetchAPI(`/operations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(operation),
    });
}

// Annees
async function getAnnees(): Promise<AnneesScolaire[]> {
    return fetchAPI('/annees');
}

async function createAnnee(annee: AnneesScolaire): Promise<any> {
    return fetchAPI('/annees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(annee),
    });
}

async function updateAnnee(id: number, annee: AnneesScolaire): Promise<any> {
    return fetchAPI(`/annees/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(annee),
    });
}

// AppelCotisations
async function getAppelCotisations(): Promise<AppelCotisations[]> {
    return fetchAPI('/appelcotisations');
}

async function createAppelCotisation(appelCotisation: AppelCotisations): Promise<any> {
    return fetchAPI('/appelcotisations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(appelCotisation),
    });
}

async function updateAppelCotisation(id: number, appelCotisation: AppelCotisations): Promise<any> {
    return fetchAPI(`/appelcotisations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(appelCotisation),
    });
}

// AppelCotisationsEcole
async function getAppelCotisationsEcole(): Promise<AppelCotisationsEcole[]> {
    return fetchAPI('/appelcotisationsecole');
}

async function createAppelCotisationEcole(appelCotisationEcole: AppelCotisationsEcole): Promise<any> {
    return fetchAPI('/appelcotisationsecole', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(appelCotisationEcole),
    });
}

async function updateAppelCotisationEcole(id: number, appelCotisationEcole: AppelCotisationsEcole): Promise<any> {
    return fetchAPI(`/appelcotisationsecole/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(appelCotisationEcole),
    });
}

// ComptesBancaires
async function getComptesBancaires(): Promise<ComptesBancaires[]> {
    return fetchAPI('/comptesbancaires');
}

async function createComptesBancaire(comptesBancaire: ComptesBancaires): Promise<any> {
    return fetchAPI('/comptesbancaires', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(comptesBancaire),
    });
}

async function updateComptesBancaire(id: number, comptesBancaire: ComptesBancaires): Promise<any> {
    return fetchAPI(`/comptesbancaires/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(comptesBancaire),
    });
}

// Contacts
async function getContacts(): Promise<Contact[]> {
    return fetchAPI('/contacts');
}

async function createContact(contact: Contact): Promise<any> {
    return fetchAPI('/contacts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
    });
}

async function updateContact(id: number, contact: Contact): Promise<any> {
    return fetchAPI(`/contacts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
    });
}

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
    updateContact
};
