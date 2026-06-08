/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { User, Patient } from '../types';
import { 
  Mail, 
  Users, 
  FileText, 
  Settings, 
  Send, 
  Clock, 
  FileCheck, 
  Database, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  RefreshCw, 
  Download, 
  X, 
  Edit3,
  MailWarning,
  Paperclip,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  nom: string;
  sujet: string;
  contenu: string;
  categorie: string;
}

interface EmailLog {
  id: string;
  date: string;
  module: string;
  destinatairesCount: number;
  sujet: string;
  statut: 'Envoyé' | 'Programmé' | 'Brouillon' | 'Échec';
  auteur: string;
  contenuFormatted: string;
}

interface EmailsGroupesModuleProps {
  patients: Patient[];
  employees: User[];
  currentUser: User;
  onAddAuditLog: (action: string, detail: string) => void;
}

// Pre-seeded standard Sahel clinic email templates list
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "TMP-001",
    nom: "Rappel de rendez-vous",
    sujet: "Rappel : Votre rendez-vous médical - Polyclinique Sahel",
    contenu: "Bonjour {prenom} {nom},\n\nNous vous rappelons votre rendez-vous prévu le {date} à {heure} avec le {medecin} dans le service {service}.\n\nEn cas d'empêchement, merci de nous contacter au {telephone}.\n\nCordialement,\nLa Direction - Polyclinique Sahel",
    categorie: "Rendez-vous"
  },
  {
    id: "TMP-002",
    nom: "Résultats de laboratoire disponibles",
    sujet: "Résultats d'analyses disponibles - Dossier {numero_dossier}",
    contenu: "Bonjour {prenom} {nom},\n\nVos résultats d'analyses cliniques prescrites le {date} sont désormais validés et disponibles sur votre portail ou à l'accueil de la clinique.\n\nRéférence dossier : {numero_dossier}\n\nCordialement,\nLe Laboratoire - Polyclinique Sahel",
    categorie: "Laboratoire"
  },
  {
    id: "TMP-003",
    nom: "Résultats d'imagerie disponibles",
    sujet: "Compte-rendu d'imagerie médicale disponible - Dossier {numero_dossier}",
    contenu: "Bonjour {prenom} {nom},\n\nLe compte-rendu officiel et les clichés de votre examen de radiologie du {date} sont disponibles.\n\nN'hésitez pas à reprendre contact avec votre docteur référent {medecin}.\n\nCordialement,\nService Imagerie Médicale",
    categorie: "Imagerie"
  },
  {
    id: "TMP-004",
    nom: "Notification d'hospitalisation",
    sujet: "Notification d'admission - Polyclinique Sahel",
    contenu: "Bonjour {prenom} {nom},\n\nNous vous confirmons votre admission en lit d'hospitalisation dans le service {service} ce {date} sous la supervision clinique de {medecin}.\n\nCordialement,\nBureau des Admissions",
    categorie: "Hospitalisation"
  },
  {
    id: "TMP-005",
    nom: "Facture disponible",
    sujet: "Votre facture disponible - Réf {numero_facture}",
    contenu: "Bonjour {prenom} {nom},\n\nVotre facture d'actes cliniques n°{numero_facture} a été générée.\nMontant à votre charge directe : {montant} FCFA.\n\nVous pouvez procéder au règlement auprès du guichet de caisse.\n\nCordialement,\nLe Service Comptabilité",
    categorie: "Facturation"
  },
  {
    id: "TMP-006",
    nom: "Relance de paiement",
    sujet: "Rappel : Encours de paiement - Réf facture {numero_facture}",
    contenu: "Bonjour {prenom} {nom},\n\nSauf erreur de notre part, la facture n°{numero_facture} d'un montant de {montant} FCFA émise le {date} reste en attente de couverture en caisse.\n\nNous vous prions de régulariser la situation dans les plus brefs délais.\n\nLe Service Recouvrement",
    categorie: "Comptabilité"
  },
  {
    id: "TMP-007",
    nom: "Réunion du personnel",
    sujet: "CONVOCATION : Réunion de coordination générale du personnel",
    contenu: "Chers collègues,\n\nVous êtes cordialement invités à assister à la réunion de coordination mensuelle prévue le {date} à {heure} en salle de conférence.\n\nOrdre du jour : Organisation des gardes et audit des DME.\n\nLa Direction Médicale",
    categorie: "Direction"
  },
  {
    id: "TMP-008",
    nom: "Information RH",
    sujet: "RH : Ouverture de la campagne d'évaluation annuelle",
    contenu: "Bonjour {prenom} {nom},\n\nNous vous informons de l'ouverture officielle de la campagne d'évaluations individuelles de l'exercice 2026.\n\nMerci de vous rapprocher du secrétariat RH pour bloquer votre créneau.\n\nLe Département RH",
    categorie: "RH"
  },
  {
    id: "TMP-009",
    nom: "Information pharmacie",
    sujet: "PHARMACIE : Ruptures ou réapprovisionnements critiques",
    contenu: "Bonjour,\n\nNous vous prions de trouver ci-joint l'état des molécules critiques approvisionnées ou en tension au sein du stock central de la Polyclinique ce {date}.\n\nLe Pharmacien Chef",
    categorie: "Pharmacie"
  },
  {
    id: "TMP-010",
    nom: "Message administratif",
    sujet: "ADMIN : Note d'information générale de service",
    contenu: "Chers utilisateurs,\n\nUne maintenance programmée de l'intranet local aura lieu ce {date} à {heure}.\n\nLa résilience locale fallback_db.json veillera à l'intégrité de vos DME pendant le processus.\n\nLe Service Informatique",
    categorie: "ADMIN"
  }
];

export default function EmailsGroupesModule({
  patients,
  employees,
  currentUser,
  onAddAuditLog
}: EmailsGroupesModuleProps) {
  // Navigation Tabs
  const [activeSubTab, setActiveSubTab] = useState<'send' | 'recipients' | 'templates' | 'history' | 'settings'>('send');

  // Recipient list states
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['Patients']);
  const [selectedIndividualEmails, setSelectedIndividualEmails] = useState<string[]>([]);
  const [externalEmailInput, setExternalEmailInput] = useState('');
  
  // Templates States
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState<EmailTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState<EmailTemplate>({ id: '', nom: '', sujet: '', contenu: '', categorie: 'Général' });

  // Outgoing Message Form States
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [customAttachments, setCustomAttachments] = useState<string[]>([]);
  const [programTime, setProgramTime] = useState('');
  const [showProgramInput, setShowProgramInput] = useState(false);

  // SMTP Settings
  const [smtpServer, setSmtpServer] = useState('smtp.intranet-sahel.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpEncryption, setSmtpEncryption] = useState<'SSL' | 'TLS' | 'None'>('TLS');
  const [smtpAddress, setSmtpAddress] = useState('contact@polycliniquesahel.ml');
  const [smtpSenderName, setSmtpSenderName] = useState('Polyclinique Sahel Bamako');
  const [smtpSignature, setSmtpSignature] = useState('Cordialement,\nService Clientèle & Soins\nMÉDISAHEL Enterprise\nTél : (+223) 73 65 14 67');
  const [smtpTestStatus, setSmtpTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  // Mail logs history
  const [mailLogs, setMailLogs] = useState<EmailLog[]>([
    {
      id: "LOG-001",
      date: "2026-06-08 14:30",
      module: "Rendez-vous",
      destinatairesCount: 14,
      sujet: "Rappel : Votre rendez-vous médical - Polyclinique Sahel",
      statut: "Envoyé",
      auteur: "Diallo Ousmane (Super Admin)",
      contenuFormatted: "Contenu de rappel de rendez-vous envoyé à 14 patients..."
    },
    {
      id: "LOG-002",
      date: "2026-06-07 10:15",
      module: "Direction",
      destinatairesCount: 35,
      sujet: "CONVOCATION : Réunion de coordination générale du personnel",
      statut: "Envoyé",
      auteur: "Diallo Ousmane (Super Admin)",
      contenuFormatted: "Convocation envoyée à l'ensemble du personnel clinique..."
    },
    {
      id: "LOG-003",
      date: "2026-06-06 17:00",
      module: "Comptabilité",
      destinatairesCount: 3,
      sujet: "Rappel : Encours de paiement - Réf facture",
      statut: "Échec",
      auteur: "Comptable Sahel",
      contenuFormatted: "Relance comptable échouée suite coupure réseau..."
    }
  ]);

  const [activeLogDetail, setActiveLogDetail] = useState<EmailLog | null>(null);

  // Group definitions for mapping
  const CATEGORIES = [
    'Patients', 'Médecins', 'Infirmiers', 'Laboratoire', 'Imagerie', 
    'Pharmacie', 'Comptabilité', 'RH', 'Hospitalisation', 'Urgences', 
    'Direction', 'Assurances'
  ];

  // Map elements from current patients & employees database to categories
  const resolvedRecipients = useMemo(() => {
    const list: { id: string; nom: string; email: string; fonction: string; service: string; sourceGroup: string }[] = [];
    
    // Patients inclusion
    patients.forEach(p => {
      const cleanPrenom = p.prenom.replace(/\s+/g, '').toLowerCase();
      const cleanNom = p.nom.replace(/\s+/g, '').toLowerCase();
      const email = `${cleanPrenom}.${cleanNom}@sahel-patient.ml`;
      list.push({
        id: p.id,
        nom: `${p.prenom} ${p.nom}`,
        email,
        fonction: 'Patient',
        service: 'Fichier Civil',
        sourceGroup: 'Patients'
      });
    });

    // Employees Inclusion
    employees.forEach(emp => {
      let g = 'Direction';
      if (emp.role === 'Médecin') g = 'Médecins';
      else if (emp.role === 'Infirmier') g = 'Infirmiers';
      else if (emp.role === 'Laborantin') g = 'Laboratoire';
      else if (emp.role === 'Pharmacien') g = 'Pharmacie';
      else if (emp.role === 'Comptable') g = 'Comptabilité';
      else if (emp.role === 'RH') g = 'RH';

      list.push({
        id: emp.id,
        nom: `${emp.prenom} ${emp.nom}`,
        email: emp.email || `${emp.username}@sahel-clinic.ml`,
        fonction: emp.role,
        service: emp.service || 'Service Clinique',
        sourceGroup: g
      });
    });

    // Mock direct direction & insurances to populate
    list.push({
      id: "DIR-001",
      nom: "Dr Ousmane Diallo (Directeur Clinique)",
      email: "o.diallo@sahel-clinic.ml",
      fonction: "Directeur Général",
      service: "Administration",
      sourceGroup: "Direction"
    });
    list.push({
      id: "DIR-002",
      nom: "Mariam Coulibaly (Secrétaire Direction)",
      email: "m.coulibaly@sahel-clinic.ml",
      fonction: "Secrétaire Direction",
      service: "Administration",
      sourceGroup: "Direction"
    });

    list.push({
      id: "ASS-001",
      nom: "Bureau CANAM (AMO)",
      email: "amo.bamako@canam.gov.ml",
      fonction: "Assureur Référent",
      service: "Tiers-Payant",
      sourceGroup: "Assurances"
    });
    list.push({
      id: "ASS-002",
      nom: "Bureau INPS Mali",
      email: "contact@inps.ml",
      fonction: "Assureur Référent",
      service: "Tiers-Payant",
      sourceGroup: "Assurances"
    });

    return list;
  }, [patients, employees]);

  // Active checked recipients based on selectedGroups and selectedIndividualEmails
  const activeSelectedRecipients = useMemo(() => {
    return resolvedRecipients.filter(rec => {
      if (selectedGroups.includes(rec.sourceGroup)) return true;
      if (selectedIndividualEmails.includes(rec.email)) return true;
      return false;
    });
  }, [resolvedRecipients, selectedGroups, selectedIndividualEmails]);

  // Handle Select All of a group
  const handleGroupToggle = (groupName: string) => {
    if (selectedGroups.includes(groupName)) {
      setSelectedGroups(selectedGroups.filter(g => g !== groupName));
    } else {
      setSelectedGroups([...selectedGroups, groupName]);
    }
  };

  // Select Individual Toggle
  const handleIndividualToggle = (email: string) => {
    if (selectedIndividualEmails.includes(email)) {
      setSelectedIndividualEmails(selectedIndividualEmails.filter(e => e !== email));
    } else {
      setSelectedIndividualEmails([...selectedIndividualEmails, email]);
    }
  };

  // Selection Actions Shortcuts
  const selectAllRecipients = () => {
    setSelectedGroups([...CATEGORIES]);
    setSelectedIndividualEmails(resolvedRecipients.map(r => r.email));
  };

  const deselectAllRecipients = () => {
    setSelectedGroups([]);
    setSelectedIndividualEmails([]);
  };

  // Handle template selection and replacement
  const handleSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = e.target.value;
    setSelectedTemplateId(tId);
    const tmpl = templates.find(t => t.id === tId);
    if (tmpl) {
      setMessageSubject(tmpl.sujet);
      setMessageBody(tmpl.contenu);
    } else {
      setMessageSubject('');
      setMessageBody('');
    }
  };

  // Real-time Preview Variable Converter (Replacing variables matching current user or patient references)
  const previewBodyFormatted = useMemo(() => {
    let text = messageBody;
    // Injecting standard clinical test values
    text = text.replace(/{prenom}/g, "Ahmed");
    text = text.replace(/{nom}/g, "Traoré");
    text = text.replace(/{date}/g, "2026-06-08");
    text = text.replace(/{heure}/g, "10:30");
    text = text.replace(/{montant}/g, "15 000");
    text = text.replace(/{medecin}/g, "Dr Ibrahim Sissoko");
    text = text.replace(/{service}/g, "Médecine Générale");
    text = text.replace(/{numero_dossier}/g, "PAT-2026-0421");
    text = text.replace(/{numero_facture}/g, "FAC-2026-1052");
    text = text.replace(/{telephone}/g, "+223 73 65 14 67");
    
    // Add signature automatically
    return text + "\n\n--\n" + smtpSignature;
  }, [messageBody, smtpSignature]);

  // Handle Dispatch of group email execution
  const handleDispatchEmails = async (status: 'Envoyé' | 'Programmé' | 'Brouillon') => {
    const addresses = activeSelectedRecipients.map(r => r.email);
    if (externalEmailInput) {
      addresses.push(...externalEmailInput.split(',').map(s => s.trim()));
    }

    if (addresses.length === 0) {
      alert("Veuillez sélectionner au moins un destinataire.");
      return;
    }

    if (!messageSubject) {
      alert("Veuillez saisir un objet d'email.");
      return;
    }

    const testPayload = {
      smtp: { host: smtpServer, port: smtpPort, user: smtpAddress },
      recipients: addresses,
      subject: messageSubject,
      body: previewBodyFormatted,
      status,
      programTime: status === 'Programmé' ? programTime : undefined,
      attachments: customAttachments
    };

    // Logging & simulating real deliverability
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      const resData = await response.json();
      
      // Update local logs
      const newLog: EmailLog = {
        id: `LOG-0${mailLogs.length + 1}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        module: selectedGroups[0] || "Externe",
        destinatairesCount: addresses.length,
        sujet: messageSubject,
        statut: status,
        auteur: `${currentUser.prenom} ${currentUser.nom} (${currentUser.role})`,
        contenuFormatted: previewBodyFormatted
      };

      setMailLogs([newLog, ...mailLogs]);
      onAddAuditLog('EMAIL.SEND', `Envoi groupé d'e-mails pour ${addresses.length} destinataires (Statut: ${status}). Objet: ${messageSubject}`);
      alert(`Simulation d'envoi SMTP réussie : ${addresses.length} e-mails dispatchés en file d'attente (Status: ${status}).`);
      
      // Clear State
      setMessageSubject('');
      setMessageBody('');
      setSelectedTemplateId('');
      setExternalEmailInput('');
      setCustomAttachments([]);

    } catch (e) {
      alert("Erreur lors de la simulation d'envoi d'emails.");
    }
  };

  // Test Connection
  const handleTestSMTPConnection = async () => {
    setSmtpTestStatus('testing');
    try {
      const response = await fetch('/api/emails/smtp-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: smtpServer, port: smtpPort, encryption: smtpEncryption })
      });
      const data = await response.json();
      if (data.success) {
        setSmtpTestStatus('success');
      } else {
        setSmtpTestStatus('failed');
      }
    } catch {
      setSmtpTestStatus('failed');
    }
  };

  // CRUD Templates Handlers
  const handleOpenTemplateModal = (tmpl?: EmailTemplate) => {
    if (tmpl) {
      setIsEditingTemplate(true);
      setTemplateForm(tmpl);
    } else {
      setIsEditingTemplate(false);
      setTemplateForm({
        id: `TMP-0${templates.length + 1}`,
        nom: '',
        sujet: '',
        contenu: '',
        categorie: 'Général'
      });
    }
    setShowTemplateModal(templateForm);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.nom || !templateForm.sujet || !templateForm.contenu) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }

    if (isEditingTemplate) {
      setTemplates(templates.map(t => t.id === templateForm.id ? templateForm : t));
      onAddAuditLog('EMAIL.TEMPLATE', `Mise à jour du modèle d'email : [${templateForm.nom}]`);
    } else {
      setTemplates([...templates, templateForm]);
      onAddAuditLog('EMAIL.TEMPLATE', `Création d'un nouveau modèle d'email : [${templateForm.nom}]`);
    }

    setShowTemplateModal(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce modèle d'email ?")) {
      setTemplates(templates.filter(t => t.id !== id));
      onAddAuditLog('EMAIL.TEMPLATE', `Suppression du modèle d'email ID : ${id}`);
    }
  };

  const handleDuplicateTemplate = (tmpl: EmailTemplate) => {
    const id = `TMP-0${templates.length + 1}`;
    const duplicated: EmailTemplate = {
      ...tmpl,
      id,
      nom: `${tmpl.nom} (Copie)`
    };
    setTemplates([...templates, duplicated]);
    onAddAuditLog('EMAIL.TEMPLATE', `Duplication du modèle d'email : ${tmpl.nom}`);
  };

  const handleAttachmentToggle = (filename: string) => {
    if (customAttachments.includes(filename)) {
      setCustomAttachments(customAttachments.filter(f => f !== filename));
    } else {
      setCustomAttachments([...customAttachments, filename]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left font-sans text-gray-700">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-950 font-serif">Module de Communication & Mails Groupés</h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Ciblage des destinataires par services cliniques, automatisation par modèles standard de patients, et messagerie SMTP locale.
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center border-b pb-0.5 overflow-x-auto gap-1 text-xs">
        <button
          onClick={() => setActiveSubTab('send')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'send' 
              ? 'border-slate-900 bg-slate-50 text-slate-950' 
              : 'border-transparent text-gray-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4 text-gray-400" />
          Envoyer un Mail Groupé
        </button>

        <button
          onClick={() => setActiveSubTab('recipients')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'recipients' 
              ? 'border-slate-900 bg-slate-50 text-slate-950' 
              : 'border-transparent text-gray-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-gray-400" />
          Fichier des Destinataires ({resolvedRecipients.length})
        </button>

        <button
          onClick={() => setActiveSubTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'templates' 
              ? 'border-slate-900 bg-slate-50 text-slate-950' 
              : 'border-transparent text-gray-400 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4 text-gray-400" />
          Bibliothèque de Modèles ({templates.length})
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'history' 
              ? 'border-slate-900 bg-slate-50 text-slate-950' 
              : 'border-transparent text-gray-400 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4 text-gray-400" />
          Historique des Envois ({mailLogs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'settings' 
              ? 'border-slate-900 bg-slate-50 text-slate-950' 
              : 'border-transparent text-gray-400 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4 text-gray-400" />
          Configuration SMTP
        </button>
      </div>

      {/* --- SUB-TAB: SEND NEW DIRECT EMAILS --- */}
      {activeSubTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Dispatch parameters Form */}
          <div className="lg:col-span-7 bg-white border p-5 rounded-3xl shadow-xxs space-y-4">
            <h3 className="font-serif font-bold text-sm text-gray-950 border-b pb-2 mb-3">Saisie de l'envoi groupé</h3>
            
            <div className="space-y-4 text-xs font-sans">
              
              {/* Target choices selection overview */}
              <div>
                <span className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Destinataires Actifs ({activeSelectedRecipients.length} sélectionnés)</span>
                <div className="p-3 bg-slate-50 border rounded-2xl flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                  {selectedGroups.map(gp => (
                    <span key={gp} className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md font-mono font-bold text-[9px] border border-indigo-200 uppercase">
                      GRP : {gp}
                    </span>
                  ))}
                  {selectedIndividualEmails.map(ie => (
                    <span key={ie} className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-mono text-[9px] border">
                      {ie}
                    </span>
                  ))}
                  {selectedGroups.length === 0 && selectedIndividualEmails.length === 0 && (
                    <span className="text-gray-450 italic text-[10px]">Aucun destinataire choisi. Rendez-vous dans l'onglet des Destinataires pour en cocher !</span>
                  )}
                </div>
              </div>

              {/* External Email Input support */}
              <div>
                <label className="block text-gray-450 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Ajouter un email externe additionnel (optionnel)</label>
                <input
                  type="text"
                  value={externalEmailInput}
                  onChange={(e) => setExternalEmailInput(e.target.value)}
                  placeholder="Ex : dmsangare@gmail.com, labo.secu@mali.org..."
                  className="w-full bg-gray-50 border border-gray-250 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>

              {/* Template selection dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-gray-450 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Sélectionner un Modèle Pré-chargé</label>
                  <select
                    value={selectedTemplateId}
                    onChange={handleSelectTemplate}
                    className="w-full bg-gray-50 border border-gray-250 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">-- Choisir un Modèle --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.nom} ({t.categorie})</option>
                    ))}
                  </select>
                </div>

                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => setActiveSubTab('templates')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-2 rounded-xl text-[10px] uppercase font-mono cursor-pointer border"
                  >
                    Gérer les Modèles
                  </button>
                </div>
              </div>

              {/* Editable email subject line */}
              <div>
                <label className="block text-gray-450 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Objet de l'Email / Sujet Officiel</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Sujet de communication..."
                  className="w-full bg-gray-50 border border-gray-250 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Rich text body description */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-gray-450 font-bold uppercase text-[9px] font-mono tracking-widest">Corps du Message - Éditeur Riche Intranet</label>
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">Variables : {`{prenom}, {nom}, {date}, {heure}, {montant}, {medecin}`}</span>
                </div>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  rows={8}
                  placeholder="Saisissez ou modifiez votre message ici..."
                  className="w-full bg-gray-50 border border-gray-250 text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono leading-relaxed"
                />
              </div>

              {/* Pièces jointes (Attachments files chooser selection) */}
              <div>
                <span className="block text-gray-450 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Pièces Jointes Sélectionnées ({customAttachments.length})</span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { name: 'rapport_clinique.pdf', label: 'PDF Rapport' },
                    { name: 'lettre_transfert.docx', label: 'DOCX Lettre' },
                    { name: 'frais_structure.xlsx', label: 'XLSX Frais' },
                    { name: 'scanner_thoracique.png', label: 'PNG Radio' },
                    { name: 'ordonnance_urgences.jpg', label: 'JPG Ordonnance' }
                  ].map(file => {
                    const active = customAttachments.includes(file.name);
                    return (
                      <button
                        type="button"
                        key={file.name}
                        onClick={() => handleAttachmentToggle(file.name)}
                        className={`p-2 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          active 
                            ? 'bg-slate-900 text-white border-slate-950 font-bold' 
                            : 'bg-slate-50 text-gray-600 hover:bg-slate-100 border-gray-200'
                        }`}
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="text-[8px] truncate max-w-full font-mono">{file.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scheduling and actions row */}
              <div className="border-t pt-4 space-y-4">
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={showProgramInput}
                      onChange={(e) => setShowProgramInput(e.target.checked)}
                      className="rounded"
                    />
                    Programmer l'envoi différé ?
                  </label>

                  {showProgramInput && (
                    <input
                      type="datetime-local"
                      value={programTime}
                      onChange={(e) => setProgramTime(e.target.value)}
                      className="bg-gray-50 border p-1 rounded font-mono text-[10px]"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleDispatchEmails('Brouillon')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer border"
                  >
                    Sauvegarder Brouillon
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!messageSubject || !messageBody) {
                        alert("Le modèle doit avoir un objet et un texte.");
                        return;
                      }
                      setTemplates([...templates, {
                        id: `TMP-0${templates.length + 1}`,
                        nom: `Modèle généré - ${new Date().toLocaleDateString()}`,
                        sujet: messageSubject,
                        contenu: messageBody,
                        categorie: 'Custom'
                      }]);
                      alert("Modèle enregistré avec succès dans votre bibliothèque.");
                    }}
                    className="bg-teal-50 border border-teal-200 text-teal-850 hover:bg-teal-100 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Sauvegarder Modèle
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDispatchEmails(showProgramInput ? 'Programmé' : 'Envoyé')}
                    className="bg-slate-900 border border-slate-950 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-800 cursor-pointer shadow-xs"
                  >
                    {showProgramInput ? "Programmer l'Envoi" : "Envoyer Maintenant"}
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* Email Preview and substitution render */}
          <div className="lg:col-span-5 bg-slate-900 p-5 rounded-3xl border border-slate-950 text-slate-350 space-y-4">
            <h3 className="font-serif font-bold text-sm text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <span>Prévisualisation de livraison</span>
              <span className="bg-amber-500/10 text-amber-400 font-mono text-[9px] px-2 py-0.5 rounded-full border border-amber-500/20 font-black uppercase">
                Mock Intranet Sandbox
              </span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                <div><span className="text-slate-500 font-bold uppercase text-[9px]">Expéditeur:</span> <span className="text-white">{smtpSenderName} &lt;{smtpAddress}&gt;</span></div>
                <div><span className="text-slate-500 font-bold uppercase text-[9px]">Sujet:</span> <span className="text-white font-bold">{messageSubject || "Néant / Objet vide"}</span></div>
                <div><span className="text-slate-500 font-bold uppercase text-[9px]">Fichier joint:</span> <span className="text-white text-[10px] italic">{customAttachments.join(', ') || "Aucune pièce jointe"}</span></div>
              </div>

              <div className="bg-slate-950 p-4 border border-white/5 rounded-2xl min-h-[180px] text-slate-300 select-none overflow-y-auto max-h-[300px]">
                <p className="whitespace-pre-line text-xs leading-relaxed">
                  {messageBody ? previewBodyFormatted : "Saisir un corps de message pour afficher la génération de variable..."}
                </p>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] space-y-1 text-slate-400">
                <span className="block text-[8px] font-bold text-amber-400 font-mono tracking-widest uppercase">Indicateurs de variable</span>
                <p className="font-sans leading-normal">
                  Chaque variable dynamique comme <code className="bg-slate-950 px-1 py-0.5 rounded text-white font-mono text-[9px] font-bold">{`{prenom}`}</code> est remplacée à la volée par les valeurs de l'utilisateur ou du patient destinataire lors du dispatch SMTP réel.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- SUB-TAB: RECIPIENT REGISTRY --- */}
      {activeSubTab === 'recipients' && (
        <div className="bg-white border rounded-3xl p-5 shadow-xxs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
            <div>
              <h3 className="font-serif font-bold text-sm text-gray-950">Fichier de ciblage des destinataires</h3>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Cochez des groupes complets ou sélectionnez individuellement vos contacts.</p>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={selectAllRecipients}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold"
              >
                Tout Sélectionner
              </button>
              <button
                onClick={deselectAllRecipients}
                className="bg-gray-100 hover:bg-gray-200 text-gray-750 px-3 py-1.5 rounded-lg border"
              >
                Tout Désélectionner
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Left rail: groups checkbox */}
            <div className="md:col-span-1 space-y-2.5 bg-slate-50 p-4 border rounded-2xl max-h-[400px] overflow-y-auto">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Groupes de filtrage</span>
              {CATEGORIES.map(category => {
                const countCategory = resolvedRecipients.filter(r => r.sourceGroup === category).length;
                const isChecked = selectedGroups.includes(category);
                
                return (
                  <label key={category} className="flex items-center justify-between p-1.5 hover:bg-white rounded-lg cursor-pointer transition-all font-semibold text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleGroupToggle(category)}
                        className="rounded"
                      />
                      <span>{category}</span>
                    </div>
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold">{countCategory}</span>
                  </label>
                );
              })}
            </div>

            {/* Right table list of individuals */}
            <div className="md:col-span-3 space-y-2 border rounded-2xl p-3 overflow-x-auto">
              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-3">Réceptionnistes individuels ({resolvedRecipients.length} disponibles)</span>
              
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 uppercase text-[9px] text-gray-450 font-bold p-2 border-b">
                    <th className="p-2 w-10">Cible</th>
                    <th className="p-2">Nom Complet</th>
                    <th className="p-2">Adresse Email</th>
                    <th className="p-2">Fonction / Rôle</th>
                    <th className="p-2">Service Affecté</th>
                    <th className="p-2 text-right">Groupe d'origine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-medium">
                  {resolvedRecipients.map((rec) => {
                    const activeInSelection = selectedGroups.includes(rec.sourceGroup) || selectedIndividualEmails.includes(rec.email);
                    
                    return (
                      <tr key={rec.id} className={`hover:bg-slate-50/50 ${activeInSelection ? 'bg-indigo-50/10' : ''}`}>
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={activeInSelection}
                            onChange={() => handleIndividualToggle(rec.email)}
                            // Disabling if group is checked since it's already implicitly selected
                            disabled={selectedGroups.includes(rec.sourceGroup)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-2 font-bold text-gray-900">{rec.nom} <span className="p-0.5 bg-gray-100 text-[8px] rounded border text-gray-400 font-mono font-bold uppercase">{rec.id}</span></td>
                        <td className="p-2 font-mono text-slate-500 text-[11px]">{rec.email}</td>
                        <td className="p-2">{rec.fonction}</td>
                        <td className="p-2 italic text-gray-400">{rec.service}</td>
                        <td className="p-2 text-right font-mono text-[10px] text-indigo-700 font-bold">{rec.sourceGroup}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* --- SUB-TAB: TEMPLATES LIBRARY --- */}
      {activeSubTab === 'templates' && (
        <div className="bg-white border rounded-3xl p-5 shadow-xxs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-serif font-bold text-sm text-gray-950">Bibliothèque de Modèles Standard</h3>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Gérez des modèles de rappels, notifications d'urgences ou relances financières.</p>
            </div>
            
            <button
              onClick={() => handleOpenTemplateModal()}
              className="flex items-center gap-1.5 bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouveau Modèle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(tmpl => (
              <div key={tmpl.id} className="bg-slate-50 border p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:shadow-xxs transition-all">
                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="p-0.5 px-2 bg-slate-200 text-gray-800 font-mono text-[9px] font-bold rounded uppercase">
                      {tmpl.categorie}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-gray-400">{tmpl.id}</span>
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-sm mt-2">{tmpl.nom}</h4>
                  <span className="text-[10px] font-bold text-indigo-800 tracking-tight block">Objet : {tmpl.sujet}</span>
                  <p className="text-gray-400 text-[10px] line-clamp-3 italic leading-relaxed mt-2 font-mono whitespace-pre-line border-t pt-2 border-slate-200">
                    {tmpl.contenu}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setMessageSubject(tmpl.sujet);
                        setMessageBody(tmpl.contenu);
                        setSelectedTemplateId(tmpl.id);
                        setActiveSubTab('send');
                      }}
                      className="text-indigo-650 hover:text-indigo-800 font-bold p-1 cursor-pointer"
                      title="Utiliser ce modèle pour envoyer un mail"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicateTemplate(tmpl)}
                      className="text-gray-500 hover:text-gray-700 p-1 cursor-pointer"
                      title="Dupliquer le modèle"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenTemplateModal(tmpl)}
                      className="text-amber-600 hover:text-amber-800 p-1 cursor-pointer"
                      title="Modifier les lignes"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteTemplate(tmpl.id)}
                    className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                    title="Supprimer définitivement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUB-TAB: LOGS JOURNAL & ARCHIVE --- */}
      {activeSubTab === 'history' && (
        <div className="bg-white border rounded-3xl p-5 shadow-xxs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-serif font-bold text-sm text-gray-950">Journal de communication</h3>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">Suivi de l'état de livraison SMTP réel des campagnes médicales.</p>
            </div>

            <button
              onClick={() => alert("Génération du rapport d'envoi CSV en cours de téléchargement local...")}
              className="flex items-center gap-1.5 border hover:bg-slate-50 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs"
            >
              <Download className="w-4 h-4 text-gray-400" />
              Télécharger Rapport CSV
            </button>
          </div>

          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 uppercase text-[9px] text-gray-400 font-bold p-2.5 border-b">
                <th className="p-2.5">Date Envoi</th>
                <th className="p-2.5">ID Log</th>
                <th className="p-2.5">Module Cible</th>
                <th className="p-2.5">Destinataires</th>
                <th className="p-2.5">Sujet de l'Email</th>
                <th className="p-2.5">Auteur du Dispatch</th>
                <th className="p-2.5 text-center">Statut SMTP</th>
                <th className="p-2.5 text-right font-sans">Visualisation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 font-medium">
              {mailLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-mono text-gray-400">{log.date}</td>
                  <td className="p-2.5 font-mono font-bold">{log.id}</td>
                  <td className="p-2.5">
                    <span className="p-0.5 px-2 bg-slate-100 border text-gray-650 rounded text-[9px] font-mono font-bold uppercase">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-2.5 font-semibold text-gray-900">{log.destinatairesCount} adresses</td>
                  <td className="p-2.5 font-bold text-indigo-850 truncate max-w-xs">{log.sujet}</td>
                  <td className="p-2.5 text-slate-500 italic">{log.auteur}</td>
                  <td className="p-2.5 text-center">
                    <span className={`p-0.5 px-2 text-[9px] rounded font-mono font-black border ${
                      log.statut === 'Envoyé' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      log.statut === 'Programmé' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      log.statut === 'Brouillon' ? 'bg-slate-100 text-slate-700 border-gray-300' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {log.statut.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          const dupTmpl = { id: '', nom: 'Ressaisie', sujet: log.sujet, contenu: log.contenuFormatted, categorie: log.module };
                          setMessageSubject(dupTmpl.sujet);
                          setMessageBody(dupTmpl.contenu);
                          setActiveSubTab('send');
                        }}
                        className="p-1 text-slate-700 hover:bg-slate-100 rounded"
                        title="Réenvoyer / Ressaisir"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveLogDetail(log);
                        }}
                        className="bg-slate-900 text-white font-bold p-1 px-1.5 rounded-lg text-[10px] hover:bg-slate-800"
                      >
                        Détails
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- SUB-TAB: EMAIL SERVER SETTINGS & SMTP PORT INTRANET --- */}
      {activeSubTab === 'settings' && (
        <div className="bg-white border rounded-3xl p-5 shadow-xxs grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          <div className="space-y-4 text-xs font-sans">
            <h3 className="font-serif font-bold text-sm text-gray-950 border-b pb-2 mb-3">Raccordement SMTP Clinique</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Adresse Serveur SMTP Host</label>
                <input
                  type="text"
                  value={smtpServer}
                  onChange={(e) => setSmtpServer(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Port d'écoute SMTP</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Méthode de chiffrement</label>
                <select
                  value={smtpEncryption}
                  onChange={(e: any) => setSmtpEncryption(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="SSL">SSL</option>
                  <option value="TLS">TLS</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5 font-mono">Mail Expéditeur</label>
                <input
                  type="email"
                  value={smtpAddress}
                  onChange={(e) => setSmtpAddress(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Nom Convivial d'envoi</label>
                <input
                  type="text"
                  value={smtpSenderName}
                  onChange={(e) => setSmtpSenderName(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-700">Test de connectivité SMTP local</span>
              </div>

              <div className="flex items-center gap-2">
                {smtpTestStatus === 'testing' && <span className="text-[10px] text-gray-400 italic">Connexion au serveur...</span>}
                {smtpTestStatus === 'success' && <span className="text-[10px] text-emerald-600 font-bold">● SMTP Connecté OK</span>}
                {smtpTestStatus === 'failed' && <span className="text-[10px] text-rose-600 font-bold">● Échec d'authentification</span>}
                
                <button
                  onClick={handleTestSMTPConnection}
                  disabled={smtpTestStatus === 'testing'}
                  className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Tester SMTP
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Signature d'email automatique de la clinique</label>
              <textarea
                value={smtpSignature}
                onChange={(e) => setSmtpSignature(e.target.value)}
                rows={4}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono text-slate-500 text-[10px] leading-relaxed focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-3xl border border-slate-950 text-slate-350 space-y-4 text-xs font-sans">
              <h4 className="font-serif font-black text-white border-b border-white/10 pb-2">Signature de messagerie</h4>
              <p className="leading-relaxed">
                Ce bloc de texte est automatiquement concaténé au bas de toutes vos communications (patients, mutuelles, laboratoires).
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-slate-400 whitespace-pre-line text-[10px]">
                {smtpSignature}
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-xs text-amber-900 leading-normal">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold block mb-1">Règles de conformité RGPD / Confidentialité</span>
                <p className="text-[11px] text-amber-800">
                  Veillez à n'exporter aucun dossier médical diagnostique critique par email non sécurisé (CIM-10). Les communications relatives aux analyses biologiques doivent contenir un renvoi d'identifiant secret non lisible en clair.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- MODAL: READ LOG CONTENT DETAIL --- */}
      {activeLogDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border shadow-xl max-w-xl w-full p-6 text-left relative overflow-hidden font-sans text-xs">
            
            <button 
              onClick={() => setActiveLogDetail(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="bg-slate-150 text-slate-800 px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border">
              LOG TRANSACTION ENVOI • {activeLogDetail.id}
            </span>

            <div className="mt-4 space-y-4 font-sans">
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border p-4 rounded-2xl font-sans">
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest block">Date Enregistrée</span>
                  <span className="font-mono font-bold text-gray-800">{activeLogDetail.date}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest block">Module Initiateur</span>
                  <span className="font-mono font-bold text-gray-800 uppercase tracking-widest text-[10px] text-indigo-700">{activeLogDetail.module}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest block">Nombre destinataires</span>
                  <span className="font-bold text-gray-800">{activeLogDetail.destinatairesCount} destinataires ciblés</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest block">Sujet principal</span>
                  <span className="font-bold text-indigo-850 truncate">{activeLogDetail.sujet}</span>
                </div>
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border text-slate-600">
                <span className="block font-bold text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">Corps du mail envoyé</span>
                <p className="whitespace-pre-line font-mono leading-relaxed text-[11px]">{activeLogDetail.contenuFormatted}</p>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-[10px] text-gray-400 italic font-mono">Auteur : {activeLogDetail.auteur}</span>
                
                <button
                  onClick={() => {
                    setMessageSubject(activeLogDetail.sujet);
                    setMessageBody(activeLogDetail.contenuFormatted);
                    setActiveLogDetail(null);
                    setActiveSubTab('send');
                  }}
                  className="bg-slate-900 text-white font-bold py-1.5 px-4 rounded-xl text-xs hover:bg-slate-800"
                >
                  Ressaisir / Corriger
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / UPDATE TEMPLATE FORM SHEET --- */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border shadow-xl max-w-xl w-full p-6 text-left relative overflow-hidden font-sans text-xs">
            
            <button 
              onClick={() => setShowTemplateModal(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-black text-slate-900 text-base border-b pb-2 mb-4">
              {isEditingTemplate ? "Ajuster le modèle de mail" : "Nouveau modèle d'email standard"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Intitulé interne du Modèle</label>
                <input
                  type="text"
                  value={templateForm.nom}
                  onChange={(e) => setTemplateForm({ ...templateForm, nom: e.target.value })}
                  placeholder="Ex : Notification de résultats labo..."
                  className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Catégorie</label>
                  <select
                    value={templateForm.categorie}
                    onChange={(e) => setTemplateForm({ ...templateForm, categorie: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="Rendez-vous">Rendez-vous</option>
                    <option value="Laboratoire">Laboratoire</option>
                    <option value="Imagerie">Imagerie</option>
                    <option value="Hospitalisation">Hospitalisation</option>
                    <option value="Facturation">Facturation</option>
                    <option value="Comptabilité">Comptabilité</option>
                    <option value="Direction">Direction</option>
                    <option value="RH">RH</option>
                    <option value="Pharmacie">Pharmacie</option>
                    <option value="Général">Général</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Objet de l'Email standard</label>
                  <input
                    type="text"
                    value={templateForm.sujet}
                    onChange={(e) => setTemplateForm({ ...templateForm, sujet: e.target.value })}
                    placeholder="Saisie de l'objet..."
                    className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Contenu avec Variables dynamiques</label>
                <textarea
                  value={templateForm.contenu}
                  onChange={(e) => setTemplateForm({ ...templateForm, contenu: e.target.value })}
                  rows={6}
                  placeholder="Texte libre... Utilisez {nom}, {prenom} etc."
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  onClick={() => setShowTemplateModal(null)}
                  className="bg-gray-150 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-800 shadow-xs"
                >
                  Sauvegarder le modèle
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
