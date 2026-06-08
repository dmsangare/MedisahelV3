/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { Patient, Consultation, Appointment, User, LaboratoireTest, QueueItem, QueueStatus } from '../types';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  FileText, 
  Pill, 
  CheckSquare, 
  Users, 
  Clock, 
  AlertCircle,
  Activity,
  Heart,
  Save,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Award,
  CircleAlert,
  FolderHeart
} from 'lucide-react';

interface ConsultationModuleProps {
  patients: Patient[];
  consultations: Consultation[];
  appointments: Appointment[];
  currentUser: User;
  queueItems?: QueueItem[];
  labTests?: LaboratoireTest[];
  onAddConsultation: (cs: any) => Promise<any>;
  onAddAppointment: (apt: any) => Promise<any>;
  onUpdateAppointment: (id: string, updates: any) => Promise<any>;
  onAddQueueItem?: (item: any) => Promise<any>;
  onUpdateQueueItem?: (id: string, updates: any) => Promise<any>;
  onSignDocument?: (docType: string, docId: string, signerName: string) => Promise<any>;
}

// Sahel region CIM-10 options for diagnostic helper
const CIM10_OPTIONS = [
  { code: "B54", label: "Paludisme sans précision (Malaria)" },
  { code: "I10", label: "Hypertension essentielle (HTA)" },
  { code: "E11", label: "Diabète sucré non insulinodépendant (Diabète Type 2)" },
  { code: "A09", label: "Diarrhée et gastro-entérite d'origine présumée infectieuse" },
  { code: "J06", label: "Infections aiguës des voies respiratoires supérieures (Grippe/Rhume)" },
  { code: "A01", label: "Fièvres typhoïde et paratyphoïde" },
  { code: "E86", label: "Déshydratation clinique bénigne" }
];

export default function ConsultationModule({
  patients,
  consultations,
  appointments,
  currentUser,
  queueItems = [],
  labTests = [],
  onAddConsultation,
  onAddAppointment,
  onUpdateAppointment,
  onAddQueueItem,
  onUpdateQueueItem,
  onSignDocument
}: ConsultationModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'queue' | 'consults' | 'schedule'>('dashboard');

  // Search filter for patient directory
  const [patientSearch, setPatientSearch] = useState('');

  // Queue visual call flashing state
  const [callingPatient, setCallingPatient] = useState<string | null>(null);

  // New Consultation Form state
  const [patientId, setPatientId] = useState('');
  const [motif, setMotif] = useState('');
  const [symptomes, setSymptomes] = useState('');
  const [examenClinique, setExamenClinique] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [cimCode, setCimCode] = useState('B54');
  
  // Prescription items state builder
  const [prescriptions, setPrescriptions] = useState<{ medicament: string; posologie: string; duree: string }[]>([]);
  const [medInput, setMedInput] = useState('');
  const [posInput, setPosInput] = useState('');
  const [durInput, setDurInput] = useState('7 jours');

  // Gen documents state
  const [certificatMedical, setCertificatMedical] = useState(false);
  const [arretMaladie, setArretMaladie] = useState(false);
  const [joursArret, setJoursArret] = useState(3);
  const [compteRendu, setCompteRendu] = useState('');

  // New Appointment Form state
  const [aptPatientId, setAptPatientId] = useState('');
  const [aptDate, setAptDate] = useState('2026-06-08');
  const [aptHeure, setAptHeure] = useState('09:00');
  const [aptMotif, setAptMotif] = useState('');
  const [aptNotes, setAptNotes] = useState('');

  // Rapid Queue Intake option
  const [queuePatientId, setQueuePatientId] = useState('');

  const isDoctor = currentUser.role === 'Médecin' || currentUser.role === 'Super Administrateur';
  const isReception = currentUser.role === 'Réceptionniste' || currentUser.role === 'Super Administrateur';

  // Average waiting times algorithm calculation
  const completedQueueItems = queueItems.filter(q => q.heureArrivee && q.heureDebutConsult);
  let totalWaitMinutes = 0;
  completedQueueItems.forEach(q => {
    const [arrH, arrM] = q.heureArrivee.split(':').map(Number);
    const [debH, debM] = q.heureDebutConsult!.split(':').map(Number);
    const arrMin = arrH * 60 + arrM;
    const debMin = debH * 60 + debM;
    if (debMin >= arrMin) {
      totalWaitMinutes += (debMin - arrMin);
    }
  });
  const averageWaitTime = completedQueueItems.length > 0 ? Math.round(totalWaitMinutes / completedQueueItems.length) : 18;

  // Prescription builder helpers
  const handleAddMed = () => {
    if (!medInput) return;
    setPrescriptions([...prescriptions, { medicament: medInput, posologie: posInput, duree: durInput }]);
    setMedInput('');
    setPosInput('');
    setDurInput('7 jours');
  };

  const handleRemoveMed = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  // Submit consultation
  const handleSaveConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !motif || !diagnostic) return;

    const selectedPatient = patients.find(p => p.id === patientId);
    if (!selectedPatient) return;

    const selectedCim = CIM10_OPTIONS.find(c => c.code === cimCode);
    const resolvedDiag = selectedCim ? `${selectedCim.label} - ${diagnostic}` : diagnostic;

    const payload = {
      patientId,
      patientName: `${selectedPatient.nom} ${selectedPatient.prenom}`,
      motif,
      symptomes,
      examenClinique,
      diagnostic: resolvedDiag,
      cimCode,
      prescription: prescriptions,
      documentsGeneres: {
        certificatMedical,
        arretMaladie,
        joursArret,
        compteRendu
      }
    };

    await onAddConsultation(payload);
    
    // Auto terminate ticket in queue if patient was in queue
    const matchingQueue = queueItems.find(q => q.patientId === patientId && q.status !== 'Terminé');
    if (matchingQueue && onUpdateQueueItem) {
      await onUpdateQueueItem(matchingQueue.id, { status: 'Terminé' });
    }

    // Clear forms
    setPatientId('');
    setMotif('');
    setSymptomes('');
    setExamenClinique('');
    setDiagnostic('');
    setPrescriptions([]);
    setCertificatMedical(false);
    setArretMaladie(false);
    setCompteRendu('');
  };

  // Submit Appointment
  const handleSaveApt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptPatientId || !aptDate || !aptHeure || !aptMotif) return;

    const selectedPatient = patients.find(p => p.id === aptPatientId);
    if (!selectedPatient) return;

    const payload = {
      patientId: aptPatientId,
      patientName: `${selectedPatient.nom} ${selectedPatient.prenom}`,
      date: aptDate,
      heure: aptHeure,
      motif: aptMotif,
      notes: aptNotes
    };

    await onAddAppointment(payload);
    
    // Clear
    setAptPatientId('');
    setAptDate('2026-06-08');
    setAptHeure('09:00');
    setAptMotif('');
    setAptNotes('');
  };

  const handleModifyStatus = async (id: string, newStatus: any) => {
    await onUpdateAppointment(id, { status: newStatus });
  };

  // Fast Queue Ticket Dispatcher
  const handleCreateQueueTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queuePatientId || !onAddQueueItem) return;

    const match = patients.find(p => p.id === queuePatientId);
    if (!match) return;

    const now = new Date();
    const arrTime = now.toTimeString().split(' ')[0].substring(0, 5);

    await onAddQueueItem({
      patientId: queuePatientId,
      patientName: `${match.nom} ${match.prenom}`,
      heureArrivee: arrTime
    });

    setQueuePatientId('');
  };

  const handleUpdateQueueStatus = async (id: string, nextStatus: QueueStatus) => {
    if (!onUpdateQueueItem) return;

    if (nextStatus === 'Appelé') {
      const q = queueItems.find(item => item.id === id);
      if (q) {
        setCallingPatient(`${q.patientName} (Ticket ${q.id})`);
        setTimeout(() => setCallingPatient(null), 4000);
      }
    }

    await onUpdateQueueItem(id, { status: nextStatus });
  };

  // Swap passage order indices
  const handleSwapQueueOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!onUpdateQueueItem) return;
    const sorted = [...queueItems].sort((a,b) => a.ordrePassage - b.ordrePassage);
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const itemA = sorted[index];
    const itemB = sorted[targetIdx];

    const tempOrder = itemA.ordrePassage;
    await onUpdateQueueItem(itemA.id, { ordrePassage: itemB.ordrePassage });
    await onUpdateQueueItem(itemB.id, { ordrePassage: tempOrder });
  };

  // Electronic Medical Signature Stamp Trigger
  const handleSignMedDocument = async (id: string) => {
    if (!onSignDocument) return;
    const signName = `${currentUser.prenom} ${currentUser.nom}`;
    await onSignDocument('consultation', id, signName);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      
      {/* Title block */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">Secteur Médical & Consultation</h2>
          <p className="text-xs text-gray-400 font-medium">Planification intelligente, diagnostics codés CIM-10, prescriptions électroniques et signatures certifiées scellées</p>
        </div>

        {/* Global Local Tab Navbar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'dashboard' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Tableau de Bord
          </button>
          
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
              activeSubTab === 'queue' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Salle d'Attente ({queueItems.filter(q => q.status !== 'Terminé').length})
          </button>

          <button
            onClick={() => setActiveSubTab('consults')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'consults' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Feuille d'Examen Clinique
          </button>
          
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'schedule' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Rendez-vous (Agenda)
          </button>
        </div>
      </div>

      {/* FLASHING SCREEN METRIC IN QUEUE SYSTEM OR SPEAKER SPEECH */}
      {callingPatient && (
        <div className="bg-red-650 text-white rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl animate-bounce">
          <div className="flex items-center gap-3">
            <Volume2 className="w-8 h-8 animate-pulse text-yellow-300" />
            <div>
              <span className="block text-[10px] font-mono font-bold tracking-widest text-[#dedea6] uppercase">APPEL PATIENT EN COURS...</span>
              <span className="text-base font-bold font-serif leading-none">{callingPatient}</span>
            </div>
          </div>
          <span className="text-xs bg-[#570a0a] px-3.5 py-1.5 rounded-lg font-mono font-extrabold tracking-wider animate-none border border-red-500">SALLE EXAMEN 1</span>
        </div>
      )}

      {/* TAB 1: DOCTOR'S DAILY DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Daily metrics indicators row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white border rounded-2xl p-4.5 shadow-xs text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Programmés</span>
              <div className="text-2xl font-black text-gray-900 mt-1 font-mono">{appointments.filter(a => a.date === '2026-06-08').length}</div>
              <span className="text-[10px] text-gray-400 block mt-1 font-medium">Consults attendues</span>
            </div>

            <div className="bg-white border rounded-2xl p-4.5 shadow-xs text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Patients Vus</span>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{consultations.filter(c => c.date.startsWith('2026-06-08') || c.date === '2026-06-08').length}</div>
              <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">Examen accomplis</span>
            </div>

            <div className="bg-white border rounded-2xl p-4.5 shadow-xs text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Patients Absents</span>
              <div className="text-2xl font-black text-rose-700 mt-1 font-mono">{queueItems.filter(q => q.status === 'Absent').length}</div>
              <span className="text-[10px] text-rose-600 block mt-1 font-medium">Non présentés</span>
            </div>

            <div className="bg-white border rounded-2xl p-4.5 shadow-xs text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Analyses Prescrites</span>
              <div className="text-2xl font-black text-indigo-700 mt-1 font-mono">{labTests ? labTests.filter(t => t.statut === 'Validé' || t.statut === 'Résultats saisis').length + 1 : 2}</div>
              <span className="text-[10px] text-indigo-600 block mt-1 font-medium">Bilan laboratoire</span>
            </div>

            <div className="bg-white border rounded-2xl p-4.5 shadow-xs text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Ordonnances</span>
              <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
                {consultations.filter(c => c.prescription && c.prescription.length > 0).length}
              </div>
              <span className="text-[10px] text-amber-600 block mt-1 font-semibold font-sans">Traitement prescrits</span>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Today's appointments workbench */}
            <div className="lg:col-span-1 bg-white border rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                  Séances programmées aujourd'hui
                </span>
                <span className="text-[10px] font-bold text-sky-700 font-mono">08 JUIN 2026</span>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                {appointments.filter(a => a.date === '2026-06-08').length === 0 ? (
                  <div className="text-center p-8 text-gray-400 italic text-xs">Aucun patient programmé pour aujourd'hui.</div>
                ) : (
                  appointments.filter(a => a.date === '2026-06-08').map(a => (
                    <div key={a.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs hover:bg-slate-100 transition-colors">
                      <div>
                        <span className="font-mono text-[9px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded mr-1.5">{a.heure}</span>
                        <strong className="font-semibold text-gray-850">{a.patientName}</strong>
                        <p className="text-[10px] text-gray-400 mt-0.5 mt-1">"{a.motif}"</p>
                      </div>

                      <div className="text-right">
                        {a.status === 'Terminé' ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-55 px-2 py-0.5 rounded-full">Fait</span>
                        ) : (
                          <button
                            onClick={() => {
                              setPatientId(a.patientId);
                              setMotif(a.motif);
                              setActiveSubTab('consults');
                            }}
                            className="bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-extrabold px-2 py-1 rounded-lg shadow-xs cursor-pointer"
                          >
                            Consulter
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's clinical charts and signed certificates checklist */}
            <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-xs">
              <div className="border-b pb-3 mb-4 flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                  Rapports Cliniques & Signatures Certifiées
                </span>
                <span className="text-[10px] font-bold bg-amber-55 text-amber-800 border border-amber-100 rounded-lg px-2 py-0.5">Scellé SHA-256</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b font-mono text-[10px] text-gray-400 uppercase font-bold text-left p-3">
                      <th className="p-3">Réf ID</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Diagnostic Principal</th>
                      <th className="p-3">Statut Certif</th>
                      <th className="p-3 text-right">Authentifier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {consultations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center italic text-gray-400">Aucun dossier encours aujourd'hui.</td>
                      </tr>
                    ) : (
                      consultations.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 font-medium">
                          <td className="p-3 font-mono font-bold text-gray-900">{c.id}</td>
                          <td className="p-3">
                            <span className="font-semibold block text-gray-800">{c.patientName}</span>
                            <span className="text-[10px] text-gray-400">Dr {c.medecinName.split(' ').pop()}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-700">{c.diagnostic.split(' - ')[0]}</span>
                            <p className="text-[10px] text-gray-400 leading-none mt-1">CIM: {c.cimCode || "B54"}</p>
                          </td>
                          <td className="p-3">
                            {c.isSigned ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-150 border border-emerald-200 px-2 py-0.5 rounded-full" title={c.signatureMeta?.certKey}>
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> CERTIFIÉ SIGNÉ
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] font-mono font-bold text-amber-800 bg-amber-55 border border-amber-100 px-2 py-0.5 rounded-full">
                                EN ATTENTE SCELLÉ
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {c.isSigned ? (
                              <div className="text-[9px] text-gray-400 font-mono" title={c.signatureMeta?.certKey}>
                                Key: {c.signatureMeta?.certKey?.substring(0, 14)}...
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSignMedDocument(c.id)}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                <Award className="w-3.5 h-3.5" /> Signer Dossier
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: INTELLIGENT WAITING ROOM / QUEUE MANAGER */}
      {activeSubTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SEC 1: PATIENT QUEUE ADMISSION FORM */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white border rounded-2xl p-5 shadow-xs">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b border-gray-100 pb-2">
                ADMETTRE PATIENT EN SALLE D'ATTENTE
              </span>

              <form onSubmit={handleCreateQueueTicket} className="space-y-4 text-xs font-semibold text-gray-700">
                <div className="space-y-1">
                  <label className="block text-gray-600">Rechercher / Sélectionner Patient *</label>
                  <select
                    required
                    value={queuePatientId}
                    onChange={(e) => setQueuePatientId(e.target.value)}
                    className="w-full border rounded-lg p-2.5 bg-white text-gray-900 font-bold"
                  >
                    <option value="">-- Choisir Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!queuePatientId}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold p-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Générer Ticket de Passage
                </button>
              </form>
            </div>

            {/* SECTOR STATISTICS CARD */}
            <div className="bg-slate-900 text-white border rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute right-[-15px] bottom-[-15px] p-6 text-white/5 font-serif font-black text-6xl">SIH</div>
              
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">
                INDICATEURS DE FLUX CLINIQUE
              </span>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase font-mono">Attente Moyenne</span>
                  <div className="text-3xl font-black text-yellow-300 font-mono mt-0.5">{averageWaitTime} min</div>
                  <span className="text-[9px] text-slate-400 leading-tight">Moyenne journalière fluide</span>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase font-mono">En File D'Attente</span>
                  <div className="text-3xl font-black text-sky-400 font-mono mt-0.5">
                    {queueItems.filter(q => q.status === 'En attente' || q.status === 'Appelé').length}
                  </div>
                  <span className="text-[9px] text-slate-400 leading-tight">Files d'attente actives</span>
                </div>
              </div>
            </div>

          </div>

          {/* SEC 2: ATTENDANCE MONITOR TERMINAL TABLE */}
          <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                REGISTRE CHRONOLOGIQUE DES ENTRÉES EN CLINIQUE
              </span>
              <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 border px-2 py-0.5 rounded">INTÉRACTIF (ORDRE DE PASSAGE)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b font-mono text-[10px] text-gray-400 uppercase font-bold text-left p-3">
                    <th className="p-3">Ordre</th>
                    <th className="p-3">Numéro Ticket</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Arrivée à</th>
                    <th className="p-3">Statut Actuel</th>
                    <th className="p-3 text-right">Régulation du Flux</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {queueItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 italic">Aucun patient inscrit dans la file d'attente aujourd'hui.</td>
                    </tr>
                  ) : (
                    [...queueItems].sort((a,b) => a.ordrePassage - b.ordrePassage).map((item, idx) => (
                      <tr key={item.id} className={`hover:bg-slate-50 ${item.status === 'Appelé' ? 'bg-red-50/40 animate-pulse' : ''}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-gray-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{item.ordrePassage}</span>
                            <div className="flex flex-col">
                              <button 
                                onClick={() => handleSwapQueueOrder(idx, 'UP')}
                                disabled={idx === 0}
                                className="text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer p-0.5"
                                title="Monter ordre de passage"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleSwapQueueOrder(idx, 'DOWN')}
                                disabled={idx === queueItems.length - 1}
                                className="text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer p-0.5"
                                title="Descendre ordre de passage"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-gray-900">{item.id}</td>
                        <td className="p-3">
                          <span className="font-semibold block text-gray-800">{item.patientName}</span>
                          <span className="text-[9.5px] text-gray-400">Médecin lié: {item.medecinName.split(' ').pop()}</span>
                        </td>
                        <td className="p-3 font-mono text-gray-500 font-semibold">{item.heureArrivee}</td>
                        <td className="p-3">
                          <span className={`inline-block text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'Terminé' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' :
                            item.status === 'En consultation' ? 'bg-indigo-100 text-indigo-800 border border-indigo-250' :
                            item.status === 'Appelé' ? 'bg-rose-100 text-rose-800 border border-rose-250 animate-bounce' :
                            item.status === 'Absent' ? 'bg-amber-100 text-amber-800 border border-amber-250' :
                            'bg-gray-100 text-gray-700 border border-gray-250'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-right gap-1 flex items-center justify-end">
                          {item.status === 'En attente' && (
                            <>
                              <button
                                onClick={() => handleUpdateQueueStatus(item.id, 'Appelé')}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[9.5px] px-2.5 py-1 rounded-lg cursor-pointer"
                              >
                                Appeler
                              </button>
                              <button
                                onClick={() => handleUpdateQueueStatus(item.id, 'Absent')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[9.5px] px-2 py-1 rounded border cursor-pointer"
                              >
                                Absent
                              </button>
                            </>
                          )}

                          {item.status === 'Appelé' && (
                            <>
                              <button
                                onClick={() => {
                                  handleUpdateQueueStatus(item.id, 'En consultation');
                                  setPatientId(item.patientId);
                                  setMotif("Consultation requise");
                                  setActiveSubTab('consults');
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9.5px] px-2.5 py-1 rounded-lg cursor-pointer"
                              >
                                Démarrer Exam.
                              </button>
                              <button
                                onClick={() => handleUpdateQueueStatus(item.id, 'Absent')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold text-[9.5px] px-2 py-1 rounded border cursor-pointer"
                              >
                                Déclarer Absent
                              </button>
                            </>
                          )}

                          {item.status === 'En consultation' && (
                            <button
                              onClick={() => handleUpdateQueueStatus(item.id, 'Terminé')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9.5px] px-2.5 py-1 rounded-lg cursor-pointer"
                            >
                              Clôturer Séance
                            </button>
                          )}

                          {item.status === 'Terminé' && (
                            <span className="text-[10px] text-emerald-800 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Fait à {item.heureFinConsult || "--:--"}
                            </span>
                          )}

                          {item.status === 'Absent' && (
                            <button
                              onClick={() => handleUpdateQueueStatus(item.id, 'En attente')}
                              className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold text-[9.5px] px-2.5 py-1 rounded cursor-pointer"
                            >
                              Réintégrer File
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CLINICAL FORM WORKBENCH */}
      {activeSubTab === 'consults' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CONSULTATION CLINICAL FORM */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-5 border-b border-gray-100 pb-2.5">
              FEUILLE D'EXAMEN MÉDICAL CLINIQUE
            </span>

            {!isDoctor && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                <h4 className="font-bold text-sm text-gray-950">Accés restreint (Habilité Médecin requis)</h4>
                <p className="text-xs text-gray-550 max-w-sm">
                  Veuillez utiliser l'identité simulée en haut pour basculer vers un rôle <strong className="font-semibold">Médecin (Dr. Ibrahim Sissoko)</strong> afin d'effectuer l'auscultation ou prescrire des traitements officinals.
                </p>
              </div>
            )}

            <form onSubmit={handleSaveConsult} className="space-y-5 text-xs text-gray-750 font-semibold text-left">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold block text-gray-650">Patient ausculté *</label>
                  <select
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full border rounded-lg p-2.5 bg-white font-bold text-gray-900"
                  >
                    <option value="">-- Sélectionner Patient Cible --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold block text-gray-650">Motif d'auscultation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Syndrôme fébrile, céphalées persistantes"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full border rounded-lg p-2.5 bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold block text-gray-650">Symptomatologie observée *</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Fièvre nocturne (39°C), frissons, fatigue intense, douleurs musculaires"
                    value={symptomes}
                    onChange={(e) => setSymptomes(e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold block text-gray-650">Examen clinique objectif *</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Langue saburrale, pas d'ictère, abdomen souple sensible au flanc droit"
                    value={examenClinique}
                    onChange={(e) => setExamenClinique(e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white font-medium"
                  />
                </div>
              </div>

              {/* CODAGE CIM-10 SUITE */}
              <div className="bg-[#fcfcf9] border border-[#eadaa6] p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-1">
                  <label className="font-bold block text-gray-650">Indicateur CIM-10 de Référence</label>
                  <select
                    value={cimCode}
                    onChange={(e) => setCimCode(e.target.value)}
                    className="w-full border border-gray-250 rounded-lg p-2.5 bg-white font-bold text-[#5A5A40]"
                  >
                    {CIM10_OPTIONS.map(c => (
                      <option key={c.code} value={c.code}>[{c.code}] {c.label.substring(0, 22)}...</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold block text-gray-650 font-sans">Diagnostic Clinique Final *</label>
                  <input
                    type="text"
                    required
                    placeholder="Entrez le diagnostic détaillé complétant le code CIM-10"
                    value={diagnostic}
                    onChange={(e) => setDiagnostic(e.target.value)}
                    className="w-full border border-gray-250 rounded-lg p-2.5 bg-white font-semibold"
                  />
                </div>
              </div>

              {/* PRESCRIPTION BUILDER INTERACTIVE COMPONENT */}
              <div className="border border-gray-150 p-4 rounded-xl space-y-3 bg-natural-secondary">
                <span className="block text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase border-b pb-1">
                  ORDONNANCE PHARMACEUTIQUE ÉLECTRONIQUE
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold block text-gray-500">Désignation Spécialité</label>
                    <input
                      type="text"
                      placeholder="e.g. Artéméther-Luméfantrine (Coartem)"
                      value={medInput}
                      onChange={(e) => setMedInput(e.target.value)}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold block text-gray-500">Posologie & Fréquence</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 comp matin et soir au milieu du repas"
                      value={posInput}
                      onChange={(e) => setPosInput(e.target.value)}
                      className="w-full border rounded p-2 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold block text-gray-500">Durée traitement</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={durInput}
                        onChange={(e) => setDurInput(e.target.value)}
                        className="w-full border rounded p-2 bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddMed}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 rounded cursor-pointer"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Listing of entered meds */}
                {prescriptions.length > 0 && (
                  <div className="bg-white border rounded-xl overflow-hidden p-2 text-[11px] leading-snug">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-100 font-mono text-[9px] uppercase font-bold text-gray-400">
                          <th className="p-2">Médicament</th>
                          <th className="p-2">Posologie</th>
                          <th className="p-2">Durée</th>
                          <th className="p-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {prescriptions.map((p, idx) => (
                          <tr key={idx} className="font-medium text-gray-800">
                            <td className="p-2 font-bold">{p.medicament}</td>
                            <td className="p-2 italic">"{p.posologie}"</td>
                            <td className="p-2 font-mono font-bold text-[#5a5a3a]">{p.duree}</td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveMed(idx)}
                                className="text-red-650 hover:text-red-800 inline-flex"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* INTEGRATED PAPERS GENERATOR SUB DESK */}
              <div className="border border-gray-150 p-4 rounded-xl space-y-3.5 bg-sky-50/20 text-gray-800">
                <span className="block text-[10px] font-bold text-sky-700 font-mono tracking-widest uppercase border-b pb-1">
                  ÉDICTION DE DOCUMENTS ADMISSIONS ET CERTIFICATS
                </span>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={certificatMedical}
                      onChange={(e) => setCertificatMedical(e.target.checked)}
                      className="rounded border-gray-300 text-sky-650 outline-hidden"
                    />
                    <span>Certificat d'Aptitude Médicale</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={arretMaladie}
                      onChange={(e) => setArretMaladie(e.target.checked)}
                      className="rounded border-gray-300 text-sky-650 outline-hidden"
                    />
                    <span>Arrêt maladie de travail</span>
                  </label>

                  {arretMaladie && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-[11px] font-bold">Durée de repos :</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={joursArret}
                        onChange={(e) => setJoursArret(Number(e.target.value))}
                        className="bg-white border rounded p-1 w-12 text-center text-xs font-mono font-bold"
                      />
                      <span className="text-gray-500 font-bold">jours</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold block text-gray-500">Compte rendu d'examen clinique additionnel (GED)</label>
                  <input
                    type="text"
                    placeholder="e.g. Patient apte au service après traitement ambulatoire"
                    value={compteRendu}
                    onChange={(e) => setCompteRendu(e.target.value)}
                    className="w-full border rounded p-2.5 bg-white"
                  />
                </div>
              </div>

              {/* SAVE ACTION DESK */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-slate-100/10 bg-[#5A5A40] hover:bg-[#4a4a33] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Enregistrer Consultation clinique
                </button>
              </div>

            </form>
          </div>

          {/* HISTORIC CONSULTATIONS RIGHT SIDEBAR */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b border-gray-100 pb-2">
                RELEVES DES DERNIERS DIAGNOSTICS ({consultations.length})
              </span>

              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-0.5">
                {consultations.map((c) => (
                  <div key={c.id} className="p-3 bg-gray-55 rounded-xl border border-gray-100 hover:border-sky-200 transition-all text-xs font-medium relative">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] text-gray-400 font-bold">{c.id}</span>
                      <span className="font-mono bg-sky-50 px-1 py-0.5 border border-sky-100 text-sky-700 font-bold rounded text-[9.5px]">CIM-10: {c.cimCode || "B54"}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-800 tracking-tight mt-1">{c.patientName}</div>
                    <p className="text-[11.5px] font-semibold text-gray-900 mt-1 leading-snug">{c.diagnostic}</p>
                    <p className="text-[10px] text-gray-400 italic mt-0.5">"{c.motif}" • {c.medecinName}</p>

                    {c.isSigned ? (
                      <div className="mt-2 text-[9px] bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg text-emerald-800 font-mono font-semibold leading-tight">
                        🔒 Scellé par {c.signatureMeta?.signedBy} : {c.signatureMeta?.certKey.substring(0, 16)}...
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSignMedDocument(c.id)}
                        className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9px] py-1 rounded flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Signer Dossier
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: APPOINTMENTS AND BOOKING WORKBENCH */}
      {activeSubTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* APPOINTMENT BOOKING WORKBENCH FORM */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative h-fit text-xs font-semibold">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-5 border-b border-gray-100 pb-2.5">
              PLANIFICATEUR DE SÉANCES / RDV
            </span>

            {!isReception && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-25 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mb-2 animate-bounce" />
                <h4 className="font-bold text-sm text-gray-950">Privilège Restreint</h4>
                <p className="text-xs text-gray-550 max-w-xs leading-relaxed">
                  Veuillez utiliser un compte Réceptionniste ou Super Administrateur pour programmer de nouvelles dates d'auscultation à l'agenda.
                </p>
              </div>
            )}

            <form onSubmit={handleSaveApt} className="space-y-4 text-gray-700">
              <div className="space-y-1">
                <label className="font-bold block">Patient Cible *</label>
                <select
                  required
                  value={aptPatientId}
                  onChange={(e) => setAptPatientId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-white text-gray-950 font-bold"
                >
                  <option value="">-- Choisir Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold block">Date Prévue *</label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full border rounded-lg p-2.5 bg-white text-gray-900 font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">Heure Séance *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:15"
                    value={aptHeure}
                    onChange={(e) => setAptHeure(e.target.value)}
                    className="w-full border rounded-lg p-2.5 bg-white text-gray-900 font-mono font-semibold font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Motif de Consultation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Consultation initiale"
                  value={aptMotif}
                  onChange={(e) => setAptMotif(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block text-gray-550">Instructions préalables (Consignes)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Venir à jeun pour bilan biochimique"
                  value={aptNotes}
                  onChange={(e) => setAptNotes(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5a5a3a] hover:bg-[#4a4a30] text-white font-bold p-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Inscrire à l'Intranet Clinique
              </button>
            </form>
          </div>

          {/* REALTIME AGENDA LIST VIEW */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                AGENDA DIRECT CONSOLIDATEUR DES VISITES (SIH GLOBAL)
              </span>
              <span className="text-[10px] font-bold text-[#5A5A40] font-mono">Total: {appointments.length} dossiers</span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b font-mono text-[10px] text-gray-400 uppercase font-bold p-3">
                    <th className="p-3">Réf</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Date & Heure</th>
                    <th className="p-3">Médecin Habilité</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Décider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                  {appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-gray-900">{a.id}</td>
                      <td className="p-3 font-bold">{a.patientName}</td>
                      <td className="p-3 font-mono">
                        <span className="block font-bold mt-0.5 text-gray-900">{a.date}</span>
                        <span className="text-[10.5px] text-gray-400 font-semibold">{a.heure}</span>
                      </td>
                      <td className="p-3 text-gray-500">{a.medecinName.split(' ').pop()}</td>
                      <td className="p-3">
                        <span className={`inline-block text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          a.status === 'Confirmé' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'Programmé' ? 'bg-sky-100 text-sky-800' :
                          a.status === 'Terminé' ? 'bg-gray-100 text-gray-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={a.status}
                          onChange={(e) => handleModifyStatus(a.id, e.target.value)}
                          className="bg-transparent border border-gray-200 text-gray-750 text-[11px] rounded p-1 cursor-pointer font-bold outline-hidden"
                        >
                          <option value="Programmé">Programmé</option>
                          <option value="Confirmé">Confirmé</option>
                          <option value="Terminé">Terminé</option>
                          <option value="Annulé">Annulé</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
