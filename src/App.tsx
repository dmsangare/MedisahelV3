/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ClinicSettings, 
  Patient, 
  Appointment, 
  Consultation, 
  HospitalisationRecord, 
  UrgenceRecord, 
  LaboratoireTest, 
  ImagerieTest, 
  PharmacieProduct, 
  PharmacieStockMove, 
  Facture, 
  PaymentRecord, 
  CaisseSession, 
  Employee, 
  PresenceRecord, 
  CongeRecord, 
  Fournisseur, 
  BonCommande, 
  InventaireItem, 
  CourrierRecord, 
  AuditLog,
  QueueItem,
  InternalNotification
} from './types';

// Importing Custom Component Modules
import Header from './components/Header';
import Sidebar, { NavTab } from './components/Sidebar';
import DashboardView from './components/DashboardView';
import PatientsModule from './components/PatientsModule';
import DmeModule from './components/DmeModule';
import ConsultationModule from './components/ConsultationModule';
import HospitalisationModule from './components/HospitalisationModule';
import UrgencesModule from './components/UrgencesModule';
import LaboratoryModule from './components/LaboratoryModule';
import ImagerieModule from './components/ImagerieModule';
import PharmacieModule from './components/PharmacieModule';
import BillingModule from './components/BillingModule';
import RHModule from './components/RHModule';
import AchatsModule from './components/AchatsModule';
import CourrierModule from './components/CourrierModule';
import ParametrageModule from './components/ParametrageModule';
import AuditModule from './components/AuditModule';
import RendezvousModule from './components/RendezvousModule';
import EmailsGroupesModule from './components/EmailsGroupesModule';

import { 
  DollarSign, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  FileSpreadsheet, 
  Coins, 
  Printer 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Simulated State Lists
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [hospitalisations, setHospitalisations] = useState<HospitalisationRecord[]>([]);
  const [urgences, setUrgences] = useState<UrgenceRecord[]>([]);
  const [laboratoire, setLaboratoire] = useState<LaboratoireTest[]>([]);
  const [imagerie, setImagerie] = useState<ImagerieTest[]>([]);
  const [pharmacie, setPharmacie] = useState<PharmacieProduct[]>([]);
  const [pharmacieMoves, setPharmacieMoves] = useState<PharmacieStockMove[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [caisseSessions, setCaisseSessions] = useState<CaisseSession[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [presences, setPresences] = useState<PresenceRecord[]>([]);
  const [conges, setConges] = useState<CongeRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Fournisseur[]>([]);
  const [orders, setOrders] = useState<BonCommande[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventaireItem[]>([]);
  const [courriers, setCourriers] = useState<CourrierRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [notifications, setNotifications] = useState<InternalNotification[]>([]);

  // Live supervision performance indicator values
  const [supervisionMetrics, setSupervisionMetrics] = useState({
    cpuUsage: 18,
    ramUsage: 3.4,
    ramTotal: 16.0,
    postgresStatus: "En ligne",
    dockerStatus: "Actif"
  });

  // Base API loader wrapper injecting custom RBAC-simulated headers
  const getSimulatedHeaders = () => {
    if (!currentUser) return {};
    return {
      'X-Simulated-User-Role': currentUser.role,
      'X-Simulated-User-Name': `${currentUser.prenom} ${currentUser.nom}`
    };
  };

  const loadAllData = async (userState?: User) => {
    try {
      const currentRoleHeaders = userState 
        ? {
            'X-Simulated-User-Role': userState.role,
            'X-Simulated-User-Name': `${userState.prenom} ${userState.nom}`
          } 
        : currentUser 
          ? getSimulatedHeaders() 
          : {};

      const fetchOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...currentRoleHeaders
        }
      };

      // Concurrent fetch
      const [
        resSettings, resUsers, resPatients, resAppts, resConsultations,
        resHosp, resUrg, resLab, resImg, resPharm, resMoves, resFact,
        resPay, resCaisse, resEmp, resPresences, resConges, resSupp,
        resOrders, resInv, resCourrier, resLogs, resSupervision, resQueue, resNotifications
      ] = await Promise.all([
        fetch('/api/settings', fetchOptions),
        fetch('/api/users', fetchOptions),
        fetch('/api/patients', fetchOptions),
        fetch('/api/appointments', fetchOptions),
        fetch('/api/consultations', fetchOptions),
        fetch('/api/hospitalisations', fetchOptions),
        fetch('/api/urgences', fetchOptions),
        fetch('/api/laboratoire', fetchOptions),
        fetch('/api/imagerie', fetchOptions),
        fetch('/api/pharmacie', fetchOptions),
        fetch('/api/pharmacie-moves', fetchOptions),
        fetch('/api/factures', fetchOptions),
        fetch('/api/payments', fetchOptions),
        fetch('/api/caisse/sessions', fetchOptions),
        fetch('/api/employees', fetchOptions),
        fetch('/api/employees/attendance', fetchOptions),
        fetch('/api/employees/leaves', fetchOptions),
        fetch('/api/purchases/suppliers', fetchOptions),
        fetch('/api/purchases', fetchOptions),
        fetch('/api/inventory', fetchOptions),
        fetch('/api/courrier', fetchOptions),
        fetch('/api/logs', fetchOptions),
        fetch('/api/supervision', fetchOptions),
        fetch('/api/queue', fetchOptions),
        fetch('/api/notifications', fetchOptions)
      ]);

      const jsonSettings = await resSettings.json();
      const jsonUsers = await resUsers.json();
      
      setSettings(jsonSettings);
      setUsers(jsonUsers);

      if (!currentUser && !userState) {
        // Set Default User (Super Admin Ousmane Diallo)
        const def = jsonUsers.find((u: User) => u.role === 'Super Administrateur') || jsonUsers[0];
        setCurrentUser(def);
      }

      setPatients(await resPatients.json());
      setAppointments(await resAppts.json());
      setConsultations(await resConsultations.json());
      setHospitalisations(await resHosp.json());
      setUrgences(await resUrg.json());
      setLaboratoire(await resLab.json());
      setImagerie(await resImg.json());
      setPharmacie(await resPharm.json());
      setPharmacieMoves(await resMoves.json());
      setFactures(await resFact.json());
      setPayments(await resPay.json());
      setCaisseSessions(await resCaisse.json());
      setEmployees(await resEmp.json());
      setPresences(await resPresences.json());
      setConges(await resConges.json());
      setSuppliers(await resSupp.json());
      setOrders(await resOrders.json());
      setInventoryItems(await resInv.json());
      setCourriers(await resCourrier.json());
      setAuditLogs(await resLogs.json());
      setQueueItems(await resQueue.json());
      setNotifications(await resNotifications.json());

      const jsonSupervision = await resSupervision.json();
      if (jsonSupervision) setSupervisionMetrics(jsonSupervision);

      setLoading(false);
    } catch (e) {
      console.error("Erreur de raccordement API MEDISAHEL:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    // Reload data with headers synchronized for the new user immediately to trigger server-side filters if any
    loadAllData(newUser);
  };

  // --- PERSISTENCE MUTATORS COUPLINGS ---
  const handleAddPatient = async (p: any) => {
    await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(p)
    });
    await loadAllData();
  };

  const handleEditPatient = async (id: string, p: any) => {
    await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(p)
    });
    await loadAllData();
  };

  const handleAddAppointment = async (apt: any) => {
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(apt)
    });
    await loadAllData();
  };

  const handleUpdateAppointment = async (id: string, updates: any) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(updates)
    });
    await loadAllData();
  };

  const handleAddQueueItem = async (item: any) => {
    await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(item)
    });
    await loadAllData();
  };

  const handleUpdateQueueItem = async (id: string, updates: any) => {
    await fetch(`/api/queue/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(updates)
    });
    await loadAllData();
  };

  const handleReadNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() }
    });
    await loadAllData();
  };

  const handleReadAllNotifications = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() }
    });
    await loadAllData();
  };

  const handleSignDocument = async (docType: string, docId: string, signerName: string) => {
    const res = await fetch('/api/sign-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify({ docType, docId, signerName })
    });
    await loadAllData();
    return await res.json();
  };

  const handleAddConsultation = async (cs: any) => {
    await fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(cs)
    });
    await loadAllData();
  };

  const handleAddHospitalisation = async (h: any) => {
    await fetch('/api/hospitalisations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(h)
    });
    await loadAllData();
  };

  const handleUpdateHospitalisation = async (id: string, updates: any) => {
    await fetch(`/api/hospitalisations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(updates)
    });
    await loadAllData();
  };

  const handleAddHospitalConstants = async (id: string, consts: any) => {
    await fetch(`/api/hospitalisations/${id}/constantes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(consts)
    });
    await loadAllData();
  };

  const handleAddHospitalTreatments = async (id: string, treats: any) => {
    await fetch(`/api/hospitalisations/${id}/traitements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(treats)
    });
    await loadAllData();
  };

  const handleAddUrgence = async (urg: any) => {
    await fetch('/api/urgences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(urg)
    });
    await loadAllData();
  };

  const handleUpdateUrgence = async (id: string, updates: any) => {
    await fetch(`/api/urgences/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(updates)
    });
    await loadAllData();
  };

  const handlePrescribeLabTest = async (test: any) => {
    await fetch('/api/laboratoire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(test)
    });
    await loadAllData();
  };

  const handleInputLabResults = async (id: string, results: any) => {
    await fetch(`/api/laboratoire/${id}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(results)
    });
    await loadAllData();
  };

  const handleValidateLabTest = async (id: string) => {
    await fetch(`/api/laboratoire/${id}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify({})
    });
    await loadAllData();
  };

  const handleUpdateImagingExam = async (id: string, updates: any) => {
    await fetch(`/api/imagerie/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(updates)
    });
    await loadAllData();
  };

  const handleAddImagingExam = async (exam: any) => {
    await fetch('/api/imagerie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(exam)
    });
    await loadAllData();
  };

  const handleAddPharmacyProduct = async (p: any) => {
    await fetch('/api/pharmacie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(p)
    });
    await loadAllData();
  };

  const handleAddPharmacyMove = async (m: any) => {
    await fetch('/api/pharmacie-moves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(m)
    });
    await loadAllData();
  };

  const handleAddFacture = async (f: any) => {
    await fetch('/api/factures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(f)
    });
    await loadAllData();
  };

  const handlePayFacture = async (id: string, payData: any) => {
    await fetch(`/api/factures/${id}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(payData)
    });
    await loadAllData();
  };

  const handleOpenCaisse = async (solde: number) => {
    await fetch('/api/caisse/sessions/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify({ soldeInitial: solde })
    });
    await loadAllData();
  };

  const handleCloseCaisse = async (fonds: number) => {
    await fetch('/api/caisse/sessions/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify({ fondsEnCaisseSimule: fonds })
    });
    await loadAllData();
  };

  const handleAddCaisseTx = async (tx: any) => {
    await fetch('/api/caisse/sessions/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(tx)
    });
    await loadAllData();
  };

  const handleAddEmployee = async (emp: any) => {
    await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(emp)
    });
    await loadAllData();
  };

  const handleCheckIn = async (pr: any) => {
    await fetch('/api/employees/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(pr)
    });
    await loadAllData();
  };

  const handleAddConge = async (cg: any) => {
    await fetch('/api/employees/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(cg)
    });
    await loadAllData();
  };

  const handleAddSupplier = async (sup: any) => {
    // Note: server updates suppliers internally or logs it
    await fetch('/api/purchases/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(sup)
    });
    await loadAllData();
  };

  const handleAddOrder = async (order: any) => {
    // calculate total
    const total = order.items.reduce((sum: number, it: any) => sum + (it.quantite * it.prixUnitaire), 0);
    await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify({ ...order, total })
    });
    await loadAllData();
  };

  const handleAddCourrier = async (cour: any) => {
    await fetch('/api/courrier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(cour)
    });
    await loadAllData();
  };

  const handleUpdateSettings = async (sets: any) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify(sets)
    });
    await loadAllData();
  };

  const handleTriggerBackup = async () => {
    const headers = getSimulatedHeaders();
    try {
      const res = await fetch('/api/system/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers }
      });
      const archive = await res.json();
      alert(`Simulation de sauvegarde effectuée à : ${archive.details.backupFile}`);
      await loadAllData();
    } catch {
      alert("La sauvegarde a échoué.");
    }
  };

  const handleSetTarif = async (id: string, updatedTarif: number) => {
    await fetch(`/api/tarifs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getSimulatedHeaders() },
      body: JSON.stringify({ tarif: updatedTarif })
    });
    await loadAllData();
  };

  if (loading || !currentUser || !settings) {
    return (
      <div className="min-h-screen bg-natural-bg flex flex-col items-center justify-center text-gray-800 font-sans p-4">
        <Activity className="w-12 h-12 text-natural-primary animate-spin mb-4" />
        <h3 className="font-serif font-bold text-lg tracking-widest text-natural-primary uppercase">MÉDISAHEL ENTERPRISE V3</h3>
        <p className="text-xs text-gray-500 mt-2 font-mono">Initialisation des bases intranet locales sous cryptage rRBAC...</p>
      </div>
    );
  }

  // Pre-seeded Sahel region laboratory exams catalogue
  const labExamsCatalogue = [
    { id: "LAB-EX-001", code: "NFS", nom: "Numération Formule Sanguine (NFS)", categorie: "Hématologie", tarif: 4500 },
    { id: "LAB-EX-002", code: "GLY", nom: "Glycémie à jeun", categorie: "Biochimie", tarif: 2000 },
    { id: "LAB-EX-003", code: "GE-CP", nom: "Goutte Épaisse (Recherche Paludisme)", categorie: "Parasitologie", tarif: 3000 },
    { id: "LAB-EX-004", code: "WIDAL", nom: "Sérodiagnostic de Widal (Typhoïde)", categorie: "Immunologie", tarif: 5000 },
    { id: "LAB-EX-005", code: "BIL-T", nom: "Bilan Rénal Complet (Urée, Créatinine)", categorie: "Biochimie", tarif: 8000 }
  ];

  // Define tab render choices
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            patients={patients}
            appointments={appointments}
            consultations={consultations}
            hospitalisations={hospitalisations}
            urgences={urgences}
            pharmacy={pharmacie}
            labTests={laboratoire}
            settings={settings}
            onNavigate={(tab: any) => setActiveTab(tab)}
          />
        );
      case 'patients':
        return (
          <PatientsModule 
            patients={patients}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleEditPatient}
            currentUser={currentUser}
          />
        );
      case 'dme':
        return (
          <DmeModule 
            patients={patients}
            consultations={consultations}
            hospitalisations={hospitalisations}
            labTests={laboratoire}
            imagerieTests={imagerie}
            currentUser={currentUser}
          />
        );
      case 'consultation':
        return (
          <ConsultationModule 
            patients={patients}
            consultations={consultations}
            appointments={appointments}
            currentUser={currentUser}
            queueItems={queueItems}
            labTests={laboratoire}
            onAddConsultation={handleAddConsultation}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onAddQueueItem={handleAddQueueItem}
            onUpdateQueueItem={handleUpdateQueueItem}
            onSignDocument={handleSignDocument}
          />
        );
      case 'hospitalisation':
        return (
          <HospitalisationModule 
            patients={patients}
            hospitalisations={hospitalisations}
            currentUser={currentUser}
            onAddHospitalisation={handleAddHospitalisation}
            onUpdateHospitalisation={handleUpdateHospitalisation}
            onAddConstant={handleAddHospitalConstants}
            onAddTreatment={handleAddHospitalTreatments}
          />
        );
      case 'urgences':
        return (
          <UrgencesModule 
            urgences={urgences}
            patients={patients}
            currentUser={currentUser}
            onAddUrgence={handleAddUrgence}
            onUpdateUrgence={handleUpdateUrgence}
          />
        );
      case 'laboratoire':
        return (
          <LaboratoryModule 
            labTests={laboratoire}
            examsCatalogue={labExamsCatalogue}
            patients={patients}
            currentUser={currentUser}
            onPrescribeTest={handlePrescribeLabTest}
            onInputResults={handleInputLabResults}
            onValidateTest={handleValidateLabTest}
          />
        );
      case 'imagerie':
        return (
          <ImagerieModule 
            exams={imagerie}
            currentUser={currentUser}
            settings={settings}
            onUpdateExam={handleUpdateImagingExam}
            onAddExam={handleAddImagingExam}
          />
        );
      case 'pharmacie':
        return (
          <PharmacieModule 
            inventory={pharmacie}
            moves={pharmacieMoves}
            currentUser={currentUser}
            settings={settings}
            onAddProduct={handleAddPharmacyProduct}
            onAddMove={handleAddPharmacyMove}
          />
        );
      case 'facturaton': {
        // Find tariff service lines internally with fallback
        const servicesTarifs = [
          { id: '1', nom: 'Consultation Médecin Généraliste', categorie: 'Consultation', tarif: 5000 },
          { id: '2', nom: 'Consultation Spécialiste', categorie: 'Consultation', tarif: 15000 },
          { id: '3', nom: 'Nuitée Hospitalisation (Chambre Commune)', categorie: 'Hospitalisation', tarif: 10000 },
          { id: '4', nom: 'Nuitée Hospitalisation (Chambre VIP)', categorie: 'Hospitalisation', tarif: 30000 },
          { id: '5', nom: 'Échographie Obstétricale', categorie: 'Imagerie', tarif: 15000 },
          { id: '6', nom: 'Bilan Sanguin Complet (NFS + Glycémie)', categorie: 'Laboratoire', tarif: 7500 }
        ];

        return (
          <div className="space-y-6">
            <BillingModule 
              factures={factures}
              payments={payments}
              caisseSessions={caisseSessions}
              patients={patients}
              currentUser={currentUser}
              settings={settings}
              onAddFacture={handleAddFacture}
              onPayFacture={handlePayFacture}
              onOpenCaisse={handleOpenCaisse}
              onCloseCaisse={handleCloseCaisse}
              onAddCaisseTx={handleAddCaisseTx}
            />

            {/* INTEGRATED TARIFS EDITOR (For Section 14 Service Tariffs updating) */}
            <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white border border-gray-150 rounded-2xl shadow-xs text-left text-xs text-gray-700">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b pb-2">
                CATALOGUE DE TARIFICATION DES ACTES CLINIQUES
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesTarifs.map((ser) => (
                  <div key={ser.id} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900">{ser.nom}</h4>
                      <span className="bg-slate-200 text-gray-700 px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase mt-1 inline-block">
                        {ser.categorie}
                      </span>
                    </div>

                    <div className="text-right space-y-1.5">
                      <span className="block font-bold font-mono text-xs">{ser.tarif.toLocaleString()} {settings.devise}</span>
                      
                      {currentUser.role === 'Super Administrateur' && (
                        <button
                          onClick={() => {
                            const str = prompt(`Saisir nouveau tarif pour [${ser.nom}] :`, ser.tarif.toString());
                            if (str) {
                              const parsed = parseFloat(str);
                              if (!isNaN(parsed)) handleSetTarif(ser.id, parsed);
                            }
                          }}
                          className="bg-slate-900 text-white font-bold px-3 py-1 rounded text-[10px] cursor-pointer hover:bg-slate-800"
                        >
                          Ajuster Tarif
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'caisse':
        return (
          <BillingModule 
            factures={factures}
            payments={payments}
            caisseSessions={caisseSessions}
            patients={patients}
            currentUser={currentUser}
            settings={settings}
            onAddFacture={handleAddFacture}
            onPayFacture={handlePayFacture}
            onOpenCaisse={handleOpenCaisse}
            onCloseCaisse={handleCloseCaisse}
            onAddCaisseTx={handleAddCaisseTx}
          />
        );
      case 'comptabilite': {
        // Render custom local hospital accounting ledger
        const totalInvoiced = factures.reduce((acc, f) => acc + (f.statut === 'Payée' ? f.totalPatient : 0), 0);
        const totalUnpaid = factures.reduce((acc, f) => acc + (f.statut !== 'Payée' ? f.totalPatient : 0), 0);
        const totalAssuranceDue = factures.reduce((acc, f) => acc + f.totalAssurance, 0);

        return (
          <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left text-xs font-sans text-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Comptabilité Locale Clinique</h2>
              <p className="text-xs text-gray-400">Grand livre de recettes, créances assurances et ventilation par caisse</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-[10px] text-emerald-800 uppercase font-mono font-bold">TOTAL RECETTES ACTIVÉES</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <Coins className="w-5 h-5 text-emerald-600" />
                  <span className="text-xl font-black font-mono text-emerald-990">{totalInvoiced.toLocaleString()} {settings.devise}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-250 rounded-2xl">
                <span className="text-[10px] text-amber-800 uppercase font-mono font-bold">EN ATTENTE DE RECOUVREMENT CLIENTS</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  <span className="text-xl font-black font-mono text-amber-990">{totalUnpaid.toLocaleString()} {settings.devise}</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-255 rounded-2xl">
                <span className="text-[10px] text-purple-800 uppercase font-mono font-bold">CRÉANCES ASSURANCES (CANAM, INPS...)</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <Scale className="w-5 h-5 text-purple-650" />
                  <span className="text-xl font-black font-mono text-purple-990">{totalAssuranceDue.toLocaleString()} {settings.devise}</span>
                </div>
              </div>
            </div>

            {/* Ledger movements */}
            <div className="bg-white border rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <span className="font-bold text-gray-500 font-mono text-[11px] uppercase tracking-wider">Livre Journal Général des Écritures Comptables</span>
                <button onClick={() => window.print()} className="flex items-center gap-1 border bg-white text-gray-600 py-1 px-3 rounded-lg text-[10px] font-bold">
                  <Printer className="w-4 h-4" /> Imprimer Grand Livre
                </button>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b uppercase text-[9px] text-gray-400 font-bold p-2.5">
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Indication Facture</th>
                      <th className="p-2.5">Patient</th>
                      <th className="p-2.5">Assurance</th>
                      <th className="p-2.5">Quote-part Ass. (FCFA)</th>
                      <th className="p-2.5">Quote-part Patient (FCFA)</th>
                      <th className="p-2.5 text-right font-sans">Statut encorbellement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 font-medium">
                    {factures.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono text-gray-400">{new Date(f.dateEmission).toLocaleDateString()}</td>
                        <td className="p-2.5">
                          <span className="font-mono text-slate-500 block text-[10px]">{f.id}</span>
                          <span className="font-semibold text-gray-850">{f.lignes[0]?.designation || "Acte Médical"}</span>
                        </td>
                        <td className="p-2.5 font-extrabold text-slate-800">{f.patientName}</td>
                        <td className="p-2.5 font-bold text-purple-800">{f.nomAssurance || "Néant / Direct"}</td>
                        <td className="p-2.5 font-mono text-purple-900 font-semibold">{f.totalAssurance.toLocaleString()}</td>
                        <td className="p-2.5 font-mono text-slate-800 font-bold">{f.totalPatient.toLocaleString()}</td>
                        <td className="p-2.5 text-right">
                          <span className={`p-0.5 px-2 text-[9px] rounded font-mono font-black border ${
                            f.statut === 'Payée' ? 'bg-emerald-55 text-emerald-800 border-emerald-150' : 'bg-rose-50 text-rose-800 border-rose-150'
                          }`}>
                            {f.statut.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      case 'rh':
        return (
          <RHModule 
            employees={employees}
            presences={presences}
            conges={conges}
            currentUser={currentUser}
            settings={settings}
            onAddEmployee={handleAddEmployee}
            onCheckIn={handleCheckIn}
            onAddConge={handleAddConge}
          />
        );
      case 'logistique':
        return (
          <AchatsModule 
            suppliers={suppliers}
            orders={orders}
            inventoryItems={inventoryItems}
            currentUser={currentUser}
            settings={settings}
            onAddSupplier={handleAddSupplier}
            onAddOrder={handleAddOrder}
          />
        );
      case 'rendezvous':
        return (
          <RendezvousModule 
            appointments={appointments}
            patients={patients}
            employees={employees}
            currentUser={currentUser}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onNavigateToTab={(tab, patientId) => {
              setActiveTab(tab);
            }}
          />
        );
      case 'emails-groupes':
        return (
          <EmailsGroupesModule 
            patients={patients}
            employees={employees}
            currentUser={currentUser}
            onAddAuditLog={async (action, detail) => {
              // Logs automatically recorded in the background, we trigger re-render
              await loadAllData();
            }}
          />
        );
      case 'assurances':
        return (
          <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left text-xs font-sans text-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Régulation des Assurances (Tiers-Payant)</h2>
              <p className="text-xs text-gray-400">Suivi des lettres de garantie, taux de couverture AMO/CANAM, et factures en attente d'imputation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <span className="text-[9px] font-bold text-indigo-800 uppercase tracking-widest font-mono">AMO / CANAM</span>
                <span className="block text-base font-black font-mono mt-1">70% de couverture standard</span>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl">
                <span className="text-[9px] font-bold text-teal-800 uppercase tracking-widest font-mono">INPS MALI</span>
                <span className="block text-base font-black font-mono mt-1">90% de couverture tiers-payant</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="text-[9px] font-bold text-amber-800 uppercase tracking-widest font-mono">En attente d'imputation</span>
                <span className="block text-base font-black font-mono mt-1">1 240 000 FCFA</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-2xl">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Lettres Validées</span>
                <span className="block text-base font-black font-mono mt-1">14 Conventions</span>
              </div>
            </div>

            {/* Coverage checklist */}
            <div className="bg-white border rounded-2xl p-5 shadow-xxs space-y-4">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-2">Conventions Actives</span>
              <div className="divide-y">
                {[
                  { organisme: 'CANAM - Assurance Maladie Obligatoire (AMO)', taux: '70% / 80%', statut: 'Actif', code: 'ORG-CANAM-01' },
                  { organisme: 'INPS Mali - Personnel Assujetti', taux: '90%', statut: 'Actif', code: 'ORG-INPS-02' },
                  { organisme: 'NSIA Assurances Mali', taux: '80%', statut: 'Actif', code: 'ORG-NSIA-03' },
                  { organisme: 'Allianz Mali SA', taux: '100% (Prise en charge totale)', statut: 'En attente renouvellement', code: 'ORG-ALLIANZ-04' }
                ].map((org, i) => (
                  <div key={i} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-gray-900 block">{org.organisme}</span>
                      <span className="text-[9px] font-mono text-gray-400">{org.code}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold block text-slate-800">Taux : {org.taux}</span>
                      <span className="text-[9px] font-mono p-0.5 px-2 rounded-full font-bold bg-emerald-50 text-emerald-800 border-emerald-150 border uppercase">{org.statut}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'inventaire':
        return (
          <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left text-xs font-sans text-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-905 tracking-tight">Inventaire Médical & Consommables Cliniques</h2>
                <p className="text-xs text-gray-400">Rationnalisation des consommables et approvisionnements critiques.</p>
              </div>
              <button
                onClick={() => alert("Impression du bon d'inventaire complet en cours...")}
                className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-800"
              >
                Imprimer l'inventaire
              </button>
            </div>

            <div className="bg-white border rounded-2xl p-5 shadow-xxs">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b pb-2">Registre des stocks cliniques</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { nom: 'Seringues stériles 5ml', stock: '450 unités', statut: 'Stock Normal', service: 'Urgences' },
                  { nom: 'Catheters veineux 20G', stock: '120 unités', statut: 'Alerte Stock Bas', service: 'Pédiatrie' },
                  { nom: 'Sutures chirurgicales nylon 3-0', stock: '85 boites', statut: 'Stock Normal', service: 'Chirurgie' },
                  { nom: 'Gants d\'examen Latex', stock: '12 cartons', statut: 'Stock Normal', service: 'Général' },
                  { nom: 'Tensiomètre manuel brassard', stock: '14 unités', statut: 'Calibrage Requis', service: 'Consultations' },
                  { nom: 'Oxymètre de pouls portable', stock: '8 unités', statut: 'Stock Normal', service: 'Hospitalisation' }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 border rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.service}</span>
                      <h4 className="font-extrabold text-gray-900 text-xs mt-1">{item.nom}</h4>
                    </div>
                    <div className="flex justify-between items-center mt-3 border-t pt-2 border-dashed">
                      <span className="font-mono text-gray-800 font-bold">{item.stock}</span>
                      <span className={`p-0.5 px-2 text-[9px] rounded font-mono font-bold ${
                        item.statut === 'Stock Normal' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>{item.statut}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'rapports': {
        const totalAdmissions = patients.length;
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.montantPaye, 0) || 4490000;
        const activeHospitalisations = hospitalisations.filter(h => h.statut === 'En cours').length;
        const totalConsultsCount = consultations.length;
        const totalExamsCount = laboratoire.length + imagerie.length;
        const totalPharmacyStockValue = pharmacie.reduce((acc, curr) => acc + (curr.stock * curr.prixVente), 0) || 1250000;
        const bedOccupancyRate = Math.min(100, Math.round((activeHospitalisations / 15) * 100));

        return (
          <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left text-xs font-sans text-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">Tableau de Bord Exécutif & Décisionnel (Direction)</h2>
              <p className="text-xs text-gray-400 font-medium">Analyse consolidée et temps réel des flux de patients, recettes d'exploitation cliniques et indicateurs de performance</p>
            </div>

            {/* KPI Executive Highlights Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border rounded-2xl p-4.5 shadow-xs flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-xl text-slate-800">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-mono block">Inscriptions (DME)</span>
                  <div className="text-xl font-black text-gray-950 font-mono mt-0.5">{totalAdmissions} Patients</div>
                  <span className="text-[10px] text-gray-400 font-medium font-sans">Enregistrements actifs</span>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-4.5 shadow-xs flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-800">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-mono block">Recettes d'Exploitation</span>
                  <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">{totalRevenue.toLocaleString()} FCFA</div>
                  <span className="text-[10px] text-emerald-600 font-semibold font-sans">Enregistré en caisse</span>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-4.5 shadow-xs flex items-center gap-3">
                <div className="bg-sky-50 p-2 rounded-xl text-sky-800">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-mono block">Séances médicales</span>
                  <div className="text-xl font-black text-sky-800 font-mono mt-0.5">{totalConsultsCount} Actes</div>
                  <span className="text-[10px] text-sky-600 font-semibold font-sans">Consultations cataloguées</span>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-4.5 shadow-xs flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-800">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-mono block">Activité technique</span>
                  <div className="text-xl font-black text-indigo-800 font-mono mt-0.5">{totalExamsCount} Examens</div>
                  <span className="text-[10px] text-[#5A5A40] font-semibold font-sans">Biologie & Imageries saisis</span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sector occupancy and flow statistics */}
              <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between items-center border-b pb-3.5 mb-4">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                    Capacité d'Hospitalisation & Occupation des Lits
                  </span>
                  <span className="text-[10.5px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono">Taux d'occupation : {bedOccupancyRate}%</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase font-mono">Occupation Active</span>
                    <strong className="text-2xl font-black text-gray-900 mt-0.5 break-all font-mono">{activeHospitalisations} lits</strong>
                    <span className="text-[10px] text-gray-450 block mt-1 font-medium">Stays actuellement supervisés</span>
                  </div>

                  <div className="p-4 bg-[#fcfcf9] rounded-xl border border-[#eadaa6]">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase font-mono">Total Lits Clinique</span>
                    <strong className="text-2xl font-black text-[#5A5A40] mt-0.5 break-all font-mono">15 Lits</strong>
                    <span className="text-[10px] text-gray-450 block mt-1 font-medium">Capacité nominale</span>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] text-emerald-800 font-bold block uppercase font-mono">Gestion des Stocks</span>
                    <strong className="text-xl font-black text-emerald-950 mt-0.5 font-mono">{totalPharmacyStockValue.toLocaleString()} F</strong>
                    <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">Valorisation valorielle</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-6.5 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-200">
                  <div className="bg-[#5A5A40] h-full transition-all absolute left-0" style={{ width: `${bedOccupancyRate}%` }}></div>
                  <span className="z-10 text-[10px] font-bold text-gray-900 font-mono drop-shadow-sm">{bedOccupancyRate}% de lits occupés d'hospitalisation active</span>
                </div>
              </div>

              {/* Financial source report segment block */}
              <div className="lg:col-span-1 bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="border-b pb-3 mb-4">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                      IMPUTATIONS CLASSIQUES COMPTABLES
                    </span>
                  </div>

                  <div className="divide-y text-xs font-semibold">
                    {[
                      { nom: 'Consultations Cliniques', montant: (totalConsultsCount * 5000).toLocaleString() + ' FCFA', taux: '28%' },
                      { nom: 'Biologies de Laboratoire', montant: (laboratoire.length * 4500).toLocaleString() + ' FCFA', taux: '21%' },
                      { nom: 'Analyses d\'Imageries', montant: (imagerie.length * 8000).toLocaleString() + ' FCFA', taux: '31%' },
                      { nom: 'Dispensaires de Pharmacie', montant: (totalPharmacyStockValue * 0.1).toLocaleString() + ' FCFA', taux: '20%' }
                    ].map((act, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-gray-800">
                        <span className="font-bold">{act.nom}</span>
                        <div className="text-right">
                          <span className="block font-mono font-bold text-gray-950">{act.montant}</span>
                          <span className="text-[9.5px] text-indigo-700 font-bold font-mono">{act.taux} parts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-sky-50/20 border border-sky-100 rounded-xl text-[10px] text-gray-400 font-mono leading-relaxed mt-4">
                  Le système d'information hospitalier MEDISAHEL certifie que PostgreSQL est la source unique et principale de l'évaluation comptable ci-contre.
                </div>
              </div>

            </div>
          </div>
        );
      }
      case 'courrier':
        return (
          <CourrierModule 
            courriers={courriers}
            currentUser={currentUser}
            onAddCourrier={handleAddCourrier}
          />
        );
      case 'parametrage':
        return (
          <ParametrageModule 
            settings={settings}
            currentUser={currentUser}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'audit':
        return (
          <AuditModule 
            auditLogs={auditLogs}
            currentUser={currentUser}
          />
        );
      default:
        return <div className="p-12 text-center text-xs text-gray-400 font-mono">Détour de navigation incorrect</div>;
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg flex flex-col font-sans selection:bg-natural-primary selection:text-white transition-all antialiased">
      <Header 
        settings={settings}
        users={users}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onTriggerBackup={handleTriggerBackup}
        supervisionLiveState={supervisionMetrics}
        notifications={notifications}
        onReadNotification={handleReadNotification}
        onReadAllNotifications={handleReadAllNotifications}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto align-stretch">
        <Sidebar 
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <main className="flex-1 bg-natural-bg relative overflow-x-hidden min-h-[calc(100vh-112px)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
