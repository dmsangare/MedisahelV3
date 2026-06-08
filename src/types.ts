/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) ---

export type Permission =
  | 'PATIENT.CREATE'
  | 'PATIENT.READ'
  | 'PATIENT.UPDATE'
  | 'PATIENT.DELETE'
  | 'DME.READ'
  | 'DME.WRITE'
  | 'CONSULTATION.CREATE'
  | 'CONSULTATION.READ'
  | 'CONSULTATION.UPDATE'
  | 'HOSPITALISATION.MANAGE'
  | 'URGENCES.MANAGE'
  | 'LABORATOIRE.READ'
  | 'LABORATOIRE.WRITE'
  | 'LABORATOIRE.VALIDATE'
  | 'IMAGERIE.READ'
  | 'IMAGERIE.WRITE'
  | 'PHARMACIE.READ'
  | 'PHARMACIE.WRITE'
  | 'TARIFICATION.MANAGE'
  | 'FACTURE.CREATE'
  | 'FACTURE.READ'
  | 'FACTURE.UPDATE'
  | 'FACTURE.DELETE'
  | 'FACTURE.EXPORT'
  | 'CAISSE.MANAGE'
  | 'COMPTABILITE.READ'
  | 'COMPTABILITE.EXPORT'
  | 'ASSURANCE.MANAGE'
  | 'RH.MANAGE'
  | 'ACHATS.MANAGE'
  | 'INVENTAIRE.MANAGE'
  | 'COURRIER.MANAGE'
  | 'DOCUMENT.MANAGE'
  | 'AUDIT.READ'
  | 'SYSTEM.SUPERVISION';

export type UserRole =
  | 'Super Administrateur'
  | 'Administrateur'
  | 'Réceptionniste'
  | 'Médecin'
  | 'Infirmier'
  | 'Laborantin'
  | 'Pharmacien'
  | 'Comptable'
  | 'RH';

export interface User {
  id: string;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  service?: string;
}

// --- SYSTEM SETTINGS ---

export interface ClinicSettings {
  nomClinique: string;
  logoUrl?: string;
  adresse: string;
  telephone: string;
  email: string;
  siteWeb: string;
  cachetText: string;
  fuseauHoraire: string;
  devise: string;
  langue: string;
  themeColor: string;
}

// --- PATIENT ---

export interface Patient {
  id: string; // Automatic Unique ID (e.g., PAT-2026-0001)
  photoUrl?: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  profession: string;
  telephone: string;
  adresse: string;
  
  // Medical profile summary
  groupeSanguin: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Inconnu';
  allergies: string[];
  antecedentsMedicaux: string[];
  maladiesChroniques: string[];
  
  dateCreation: string;
  isActive: boolean;
}

// --- RENDEZ-VOUS ---

export type AppointmentStatus = 'Programmé' | 'Confirmé' | 'En cours' | 'Terminé' | 'Annulé';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  medecinId: string;
  medecinName: string;
  date: string; // YYYY-MM-DD
  heure: string; // HH:mm
  motif: string;
  status: AppointmentStatus;
  notes?: string;
  dateCreation: string;
}

// --- CONSULTATION & DME ---

export interface PrescriptionItem {
  medicament: string;
  posologie: string;
  duree: string; // e.g., "7 jours"
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  medecinId: string;
  medecinName: string;
  date: string;
  motif: string;
  symptomes: string;
  examenClinique: string;
  diagnostic: string; // Text or CIM-10 Code
  cimCode?: string; // CIM-10 Code e.g., "I10"
  prescription: PrescriptionItem[];
  documentsGeneres: {
    certificatMedical?: boolean;
    arretMaladie?: boolean;
    joursArret?: number;
    compteRendu?: string;
  };
  auditLogs?: string;
  isSigned?: boolean;
  signatureMeta?: {
    signedAt: string;
    signedBy: string;
    certKey: string;
    hashAlgorithm: string;
    signatureBase64: string;
  };
}

// --- HOSPITALISATION ---

export interface HospitalisationRecord {
  id: string;
  patientId: string;
  patientName: string;
  batiment: string;
  service: string;
  salle: string;
  lit: string;
  dateAdmission: string;
  dateSortie?: string;
  statut: 'Admis' | 'Transféré' | 'Sorti';
  motifs: string;
  constantes: {
    date: string;
    temperature: number; // °C
    tensionArterielle: string; // e.g. "12/8"
    pulsations: number; // bpm
    note?: string;
  }[];
  traitementsAdministres: {
    date: string;
    medicament: string;
    infirmierName: string;
    note?: string;
  }[];
}

// --- URGENCES ---

export type TriageColor = 'Rouge' | 'Orange' | 'Jaune' | 'Vert';

export interface UrgenceRecord {
  id: string;
  patientId?: string; // Can be anonymous/unidentified first
  patientName: string;
  ageSimule?: string;
  telephone?: string;
  triage: TriageColor;
  dateAdmission: string;
  motif: string;
  medecinId?: string;
  medecinName?: string;
  statut: 'En attente' | 'Pris en charge' | 'Sortie' | 'Hospitalisé';
  notesSymptomes: string;
}

// --- LABORATOIRE ---

export interface LaboratoireExam {
  id: string;
  code: string; // Code unique (e.g., NFS, GLY)
  nom: string;
  categorie: string;
  tarif: number;
}

export interface LaboratoireTest {
  id: string;
  patientId: string;
  patientName: string;
  medecinName: string;
  examId: string;
  examNom: string;
  datePrescription: string;
  dateResultat?: string;
  resultats?: {
    parametre: string;
    valeur: string;
    unite: string;
    reference: string;
  }[];
  statut: 'Prescrit' | 'Prélèvement' | 'Analyses en cours' | 'Résultats saisis' | 'Validé';
  laborantinId?: string;
  laborantinNom?: string;
  fichiersJointes?: string[]; // PDF, Image local filenames
}

// --- IMAGERIE ---

export interface ImagerieTest {
  id: string;
  patientId: string;
  patientName: string;
  medecinName: string;
  typeExamen: 'Radio' | 'Scanner' | 'IRM' | 'Échographie';
  detailsExamen: string; // e.g. "Grille Costale", "Thorax"
  datePrescription: string;
  dateExamen?: string;
  compteRendu?: string;
  statut: 'Prescrit' | 'Réalisé' | 'Interprété';
  radiologueNom?: string;
  imageUrl?: string;
}

// --- PHARMACIE ---

export interface PharmacieProduct {
  id: string;
  code: string;
  nom: string;
  categorie: 'Médicament' | 'Consommable' | 'Réactif';
  forme?: string; // e.g., "Comprimé", "Sirop"
  stockActuel: number;
  seuilCritique: number;
  prixVente: number;
  datePeremption?: string;
  fournisseurNom?: string;
}

export interface PharmacieStockMove {
  id: string;
  productId: string;
  productNom: string;
  type: 'Entrée' | 'Sortie';
  quantite: number;
  motif: string;
  date: string;
  utilisateur: string;
}

// --- TARIFICATION ---

export interface ServiceTarif {
  id: string;
  categorie: 'Consultation' | 'Laboratoire' | 'Imagerie' | 'Hospitalisation';
  nom: string;
  tarif: number;
  historiqueTarifs?: {
    date: string;
    ancienTarif: number;
    nouveauTarif: number;
    auteur: string;
  }[];
}

// --- FACTURATION & CAISSE ---

export type PaymentMethod = 'Espèces' | 'Orange Money' | 'Moov Money' | 'Carte bancaire' | 'Virement';

export interface Facture {
  id: string; // Automatic (e.g. FAC-2026-1004)
  patientId: string;
  patientName: string;
  dateEmission: string;
  totalBrut: number;
  tauxPriseEnChargeAssurance: number; // 0 if none, e.g. 80 for CANAM (80%)
  nomAssurance?: string;
  totalPatient: number;
  totalAssurance: number;
  statut: 'Brouillon' | 'Payée' | 'Partiellement Payée' | 'Annulée';
  remiseValue: number; // e.g. 5000 (remise forfaitaire)
  avoirs?: number; // cumulative credit invoices
  lignes: {
    designation: string;
    quantite: number;
    prixUnitaire: number;
    montant: number;
  }[];
}

export interface PaymentRecord {
  id: string;
  factureId: string;
  patientName: string;
  montant: number;
  date: string;
  modePaiement: PaymentMethod;
  encaisseurName: string;
  statut: 'Actif' | 'Annulé';
  motifAnnulation?: string;
}

export interface CaisseSession {
  id: string;
  dateOuverture: string;
  dateCloture?: string;
  caissierName: string;
  soldeInitial: number;
  fondsEnCaisseSimule?: number;
  ecartsConstates?: number;
  totalEncaissements: number;
  totalDecaissements: number;
  currentSolde: number;
  statut: 'Ouverte' | 'Clôturée';
  transactions: {
    id: string;
    type: 'Encaissement' | 'Décaissement';
    montant: number;
    motif: string;
    heure: string;
    refPayement?: string;
  }[];
}

// --- ASSURANCE ---

export interface AssuranceOrganisme {
  id: string;
  nom: string; // e.g., CANAM, AMO, INPS, NSIA
  type: 'Publique' | 'Privée';
  tauxPriseEnChargeStandard: number; // e.g. 70, 80, 100
  adresse?: string;
  contact?: string;
}

// --- HUMAN RESOURCES (RH) ---

export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  role: UserRole;
  sexe: 'M' | 'F';
  telephone: string;
  email: string;
  dateEmbauche: string;
  salaireDeBase: number;
  statutContrat: 'CDI' | 'CDD' | 'Prestataire';
  dernierePresence?: string; // YYYY-MM-DD
}

export interface PresenceRecord {
  id: string;
  employeeId: string;
  employeeNomComplet: string;
  date: string;
  heureArrivee?: string;
  heureDepart?: string;
  statut: 'Présent' | 'Absent' | 'Retard' | 'Congé' | 'Justifié';
}

export interface CongeRecord {
  id: string;
  employeeId: string;
  employeeNomComplet: string;
  dateDebut: string;
  dateFin: string;
  type: 'Annuel' | 'Maladie' | 'Maternité' | 'Exceptionnel';
  statut: 'En attente' | 'Approuvé' | 'Refusé';
  motif: string;
}

// --- ACHATS, FOURNISSEURS & INVENTAIRE ---

export interface Fournisseur {
  id: string;
  nom: string;
  contact: string;
  telephone: string;
  adresse: string;
  produitsFournis: string[];
}

export interface BonCommande {
  id: string;
  fournisseurNom: string;
  dateCommande: string;
  dateReception?: string;
  statut: 'Commandé' | 'Reçu' | 'Payé' | 'Annulé';
  total: number;
  items: {
    nomProduit: string;
    quantite: number;
    prixUnitaire: number;
  }[];
}

export interface InventaireItem {
  id: string;
  nom: string;
  categorie: 'Informatique' | 'Matériel médical' | 'Mobilier';
  quantite: number;
  etat: 'Excellent' | 'Bon' | 'À réparer' | 'Hors d\'usage';
  localisation: string; // e.g. "Salle de radiologie"
  derniereMaintenance?: string;
}

// --- COURRIER ---

export interface CourrierRecord {
  id: string;
  direction: 'Arrivant' | 'Départ';
  reference: string;
  date: string;
  objet: string;
  nomCorrespondant: string; // Expéditeur ou Destinataire
  serviceAttributaire?: string;
  fichiersJointes?: string[]; // PDF simulation filenames
  archivedAt: string;
}

// --- AUDIT TRAIL ---

export interface AuditLog {
  id: string;
  utilisateur: string;
  date: string;
  heure: string;
  action: string; // e.g. "PATIENT.CREATE"
  module: string; // e.g. "PATIENTS"
  description: string; // e.g. "Création du patient PAT-2026-0001 Touré Ali"
  adresseIp: string;
  posteUtilise: string;
  ancienneValeur?: string;
  nouvelleValeur?: string;
}

// --- FILE D'ATTENTE (QUEUE) ---
export type QueueStatus = 'En attente' | 'Appelé' | 'En consultation' | 'Terminé' | 'Absent';

export interface QueueItem {
  id: string; // Q-001
  patientId: string;
  patientName: string;
  medecinId: string;
  medecinName: string;
  heureArrivee: string; // HH:mm
  heureAppel?: string; // HH:mm
  heureDebutConsult?: string; // HH:mm
  heureFinConsult?: string; // HH:mm
  status: QueueStatus;
  ordrePassage: number;
}

// --- NOTIFICATIONS INTERNES ---
export type NotificationType = 'SYSTEM' | 'MEDICAL' | 'PHARMACIE' | 'LABORATOIRE' | 'ADMINISTRATIVE';

export interface InternalNotification {
  id: string;
  type: NotificationType;
  titre: string;
  description: string;
  date: string; // YYYY-MM-DD
  heure: string; // HH:mm
  lu: boolean;
  prioritaire: boolean;
}
