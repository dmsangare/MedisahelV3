/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Facture, PaymentRecord, CaisseSession, User, Patient, ClinicSettings } from '../types';
import { 
  Receipt, 
  Plus, 
  Wallet, 
  Activity, 
  Coins, 
  Check, 
  AlertOctagon, 
  DollarSign, 
  CreditCard, 
  Printer, 
  Save, 
  X,
  FileCheck2,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

interface BillingModuleProps {
  factures: Facture[];
  payments: PaymentRecord[];
  caisseSessions: CaisseSession[];
  patients: Patient[];
  currentUser: User;
  settings: ClinicSettings;
  onAddFacture: (f: any) => Promise<any>;
  onPayFacture: (id: string, payData: any) => Promise<any>;
  onOpenCaisse: (bal: number) => Promise<any>;
  onCloseCaisse: (cash: number) => Promise<any>;
  onAddCaisseTx: (txData: any) => Promise<any>;
}

export default function BillingModule({
  factures,
  payments,
  caisseSessions,
  patients,
  currentUser,
  settings,
  onAddFacture,
  onPayFacture,
  onOpenCaisse,
  onCloseCaisse,
  onAddCaisseTx
}: BillingModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'billing' | 'caisse'>('billing');
  const [selectedFactureId, setSelectedFactureId] = useState<string>('');

  // --- NEW BILLING FORM FIELDS ---
  const [patientId, setPatientId] = useState('');
  const [designation, setDesignation] = useState('Consultation Médecin Généraliste');
  const [prixUnitaire, setPrixUnitaire] = useState(5000);
  const [quantite, setQuantite] = useState(1);
  const [remiseValue, setRemiseValue] = useState(0);
  const [nomAssurance, setNomAssurance] = useState('');
  const [tauxPriseEnCharge, setTauxPriseEnCharge] = useState(0); // e.g. 80 % for CANAM

  // --- CASH REGISTER SETTLEMENT FORM FIELDS ---
  const [cashToPay, setCashToPay] = useState(0);
  const [payMode, setPayMode] = useState<'Espèces' | 'Orange Money' | 'Moov Money' | 'Carte bancaire'>('Espèces');

  // --- CAISSE OPEN / CLOSE FORM FIELDS ---
  const [soldeInitialInput, setSoldeInitialInput] = useState('100000');
  const [fondsPhysiqueInput, setFondsPhysiqueInput] = useState('');

  // Get active open caisse session
  const openCaisse = caisseSessions.find(s => s.statut === 'Ouverte');
  const selectedFacture = factures.find(f => f.id === selectedFactureId);

  const canWrite = currentUser.permissions.includes('FACTURE.CREATE') || currentUser.role === 'Super Administrateur';
  const canCaisse = currentUser.permissions.includes('CAISSE.MANAGE') || currentUser.role === 'Super Administrateur';

  // Issue custom invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !designation || !prixUnitaire) return;

    const selectedPatient = patients.find(p => p.id === patientId);
    if (!selectedPatient) return;

    const brut = prixUnitaire * quantite;
    
    // Create payload
    const payload = {
      patientId,
      patientName: `${selectedPatient.nom} ${selectedPatient.prenom}`,
      totalBrut: brut,
      tauxPriseEnChargeAssurance: tauxPriseEnCharge,
      nomAssurance: nomAssurance || undefined,
      remiseValue,
      lignes: [
        { designation, quantite, prixUnitaire, montant: brut }
      ]
    };

    await onAddFacture(payload);

    // reset
    setPatientId('');
    setPrixUnitaire(5000);
    setQuantite(1);
    setRemiseValue(0);
    setNomAssurance('');
    setTauxPriseEnCharge(0);
  };

  // Pay invoice checkout
  const handleCheckoutInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactureId || !selectedFacture) return;

    if (!openCaisse) {
      alert("Erreur: Vous devez d'abord OUVRIR une session de caisse locale avant d'enregistrer un encaissement physique.");
      return;
    }

    await onPayFacture(selectedFactureId, {
      montant: cashToPay || selectedFacture.totalPatient,
      modePaiement: payMode
    });

    setSelectedFactureId('');
  };

  const handleOpenCaisseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    await onOpenCaisse(parseFloat(soldeInitialInput) || 0);
  };

  const handleCloseCaisseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCloseCaisse(parseFloat(fondsPhysiqueInput) || 0);
    setFondsPhysiqueInput('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Finances Hospitalières</h2>
          <p className="text-xs text-gray-400">Facturations automatiques AMO/CANAM, gestion documentaire et clôtures de caisse auditées</p>
        </div>

        {/* Local subnavigation */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('billing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'billing' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Factures clients ({factures.length})
          </button>
          <button
            onClick={() => setActiveSubTab('caisse')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'caisse' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sessions de Caisse ({caisseSessions.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'billing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SEC 1: ISSUE DRAFT INVOICE */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b border-gray-100 pb-2">
              ÉMETTRE UNE FACTURE
            </span>

            {!canWrite && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center">
                <AlertOctagon className="w-10 h-10 text-amber-500 mb-2" />
                <h4 className="font-bold text-xs text-gray-950">Privilège Restreint</h4>
                <p className="text-[10px] text-gray-450 max-w-xs">
                  Seul le personnel d'administration ou comptable peut émettre de nouvelles factures commerciales authentifiées.
                </p>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs font-medium text-gray-750">
              <div className="space-y-1">
                <label className="font-bold block">Patient Redoutable *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white text-xs"
                >
                  <option value="">-- Choisir Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Désignation Prestation *</label>
                <select
                  value={designation}
                  onChange={(e) => {
                    setDesignation(e.target.value);
                    if (e.target.value.includes('Généraliste')) setPrixUnitaire(5000);
                    else if (e.target.value.includes('VIP')) setPrixUnitaire(45000);
                    else if (e.target.value.includes('Spécialiste')) setPrixUnitaire(10000);
                    else setPrixUnitaire(15000);
                  }}
                  className="w-full border rounded-lg p-2 bg-white text-xs"
                >
                  <option value="Consultation Médecin Généraliste">Consultation Médecin Généraliste (5 000 {settings.devise})</option>
                  <option value="Consultation Spécialiste">Consultation Spécialiste (10 000 {settings.devise})</option>
                  <option value="Frais de lit - Suite Individuelle VIP">Suite Individuelle VIP / jour (45 000 {settings.devise})</option>
                  <option value="Chambre Commune / jour - Forfait Hospitalisation">Chambre Commune / jour (15 000 {settings.devise})</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold block">Prix Unitaire ({settings.devise}) *</label>
                  <input
                    type="number"
                    required
                    value={prixUnitaire}
                    onChange={(e) => setPrixUnitaire(parseFloat(e.target.value))}
                    className="w-full border rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">Quantité *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantite}
                    onChange={(e) => setQuantite(parseInt(e.target.value))}
                    className="w-full border rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* REMISE FORFAIT DISCOUNT */}
              <div className="space-y-1">
                <label className="font-bold block text-gray-500">Remise Forfaitaire Exceptionnelle ({settings.devise})</label>
                <input
                  type="number"
                  value={remiseValue}
                  onChange={(e) => setRemiseValue(parseFloat(e.target.value) || 0)}
                  className="w-full border rounded-lg p-2 text-xs font-mono"
                />
              </div>

              {/* OUTSOURCING ASSURANCE SPLITS */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <span className="block text-[10px] text-indigo-800 font-bold uppercase tracking-wider font-mono">Assurance & Prise en Charge (AMO/CANAM)</span>
                
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-750 block">Organisme Assureur</label>
                    <select
                      value={nomAssurance}
                      onChange={(e) => {
                        setNomAssurance(e.target.value);
                        if (e.target.value === 'CANAM (AMO - Mali)') setTauxPriseEnCharge(80);
                        else if (e.target.value === 'INPS (Mali)') setTauxPriseEnCharge(70);
                        else if (e.target.value === 'NSIA Assurances') setTauxPriseEnCharge(90);
                        else setTauxPriseEnCharge(0);
                      }}
                      className="w-full bg-white border border-indigo-200 rounded-lg p-1.5 text-xs"
                    >
                      <option value="">-- Sans Assurance (Plein Tarif Client) --</option>
                      <option value="CANAM (AMO - Mali)">CANAM (AMO - Prise charge 80%) Museum</option>
                      <option value="INPS (Mali)">INPS (Prise charge 70%)</option>
                      <option value="NSIA Assurances">NSIA Assurances (Prise charge 90%)</option>
                    </select>
                  </div>

                  {nomAssurance && (
                    <div className="space-y-1 animate-in slide-in-from-top-1 duration-100">
                      <label className="text-[10px] font-bold text-indigo-75 block">Taux de Prise en charge (%) :</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={tauxPriseEnCharge}
                        onChange={(e) => setTauxPriseEnCharge(parseInt(e.target.value) || 0)}
                        className="w-20 bg-white border border-indigo-200 rounded p-1 font-mono font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold p-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Générer la Facture Client
              </button>
            </form>
          </div>

          {/* SEC 2: INVOICES REGISTERS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b mb-4">
                <span className="block text-[11px] font-bold text-gray-500 uppercase font-mono">
                  REGISTRE GENERAL DES FACTURES ({factures.length})
                </span>
                <button className="flex items-center gap-1 bg-white border text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Exporter Excel
                </button>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b font-mono text-[10px] text-gray-400 p-2 uppercase font-bold">
                      <th className="p-3">Numéro</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Pris charge Assur.</th>
                      <th className="p-3">Part Client</th>
                      <th className="p-3">Total Brut</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3 text-right">Registre</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {factures.map((fac) => (
                      <tr key={fac.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-gray-900">{fac.id}</td>
                        <td className="p-3 font-semibold text-gray-800">{fac.patientName}</td>
                        <td className="p-3">
                          {fac.nomAssurance ? (
                            <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded font-bold">
                              {fac.nomAssurance.split(' ')[0]} ({fac.tauxPriseEnChargeAssurance}%)
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Aucune</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-gray-900">{fac.totalPatient.toLocaleString()}</td>
                        <td className="p-3 font-mono text-gray-500">{fac.totalBrut.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            fac.statut === 'Payée' ? 'bg-emerald-105 border border-emerald-200 text-emerald-800' :
                            fac.statut === 'Annulée' ? 'bg-gray-105 border border-gray-250 text-gray-600' :
                            'bg-amber-100 border border-amber-205 text-amber-800'
                          }`}>
                            {fac.statut}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {fac.statut === 'Brouillon' ? (
                            <button
                              onClick={() => {
                                if (canCaisse) {
                                  setSelectedFactureId(fac.id);
                                  setCashToPay(fac.totalPatient);
                                }
                              }}
                              disabled={!canCaisse}
                              className={`text-[10px] font-bold p-1 px-2.5 rounded-lg border flex items-center justify-center gap-1 ml-auto ${
                                !canCaisse 
                                  ? 'opacity-30 cursor-not-allowed text-gray-400' 
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 font-bold border-transparent shadow-xs cursor-pointer'
                              }`}
                            >
                              <Wallet className="w-3.5 h-3.5" /> Encaisser
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-450 italic">Fermé</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EXPANDABLE BILLING CHECKOUT RECEIPT MODAL */}
            {selectedFacture && (
              <div className="bg-emerald-50/50 border border-emerald-250 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-3 duration-200 text-xs text-gray-750 text-left">
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="font-bold text-emerald-900 uppercase font-mono tracking-wider">
                    COMPTOIR COMPTABLE ENCAISSEMENT : {selectedFacture.id}
                  </span>
                  <button onClick={() => setSelectedFactureId('')} className="text-emerald-800 hover:text-emerald-950 font-bold">FErmer</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Récapitulatif Ticket</span>
                    <p className="font-semibold text-gray-800 leading-none">Patient: {selectedFacture.patientName}</p>
                    <p className="font-mono">Part Assureur: {selectedFacture.totalAssurance.toLocaleString()} {settings.devise}</p>
                    <p className="font-mono text-gray-900 font-bold text-sm bg-emerald-100 p-1.5 px-3 rounded-lg border border-emerald-200 w-fit">
                      Net à Encaisser Client: {selectedFacture.totalPatient.toLocaleString()} {settings.devise}
                    </p>
                  </div>

                  <form onSubmit={handleCheckoutInvoice} className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold block text-emerald-850">Montant Reçu Physique ({settings.devise}) *</label>
                      <input
                        type="number"
                        required
                        value={cashToPay}
                        onChange={(e) => setCashToPay(parseFloat(e.target.value) || 0)}
                        className="bg-white border rounded p-1.5 w-full text-xs font-bold font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold block text-emerald-850">Mode d'encaissement *</label>
                      <select
                        value={payMode}
                        onChange={(e) => setPayMode(e.target.value as any)}
                        className="bg-white border rounded p-1.5 w-full text-xs bg-white"
                      >
                        <option value="Espèces">Espèces (Fortement conseillé)</option>
                        <option value="Orange Money">Orange Money Mobile</option>
                        <option value="Moov Money">Moov Money Sahel</option>
                        <option value="Carte bancaire">Carte bancaire / TPE</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold p-2.5 rounded-lg text-xs"
                    >
                      Valider Encaissement & Imprimer Reçu
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* CAISSE DESK SECTION */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* SESSION MANAGER CRADLE */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative h-fit text-xs text-gray-700">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b border-gray-100 pb-2">
                CAISSE D'ADMISSION EN DIRECT
              </span>

              {!canCaisse && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center">
                  <AlertOctagon className="w-10 h-10 text-amber-500 mb-2" />
                  <h4 className="font-bold text-sm text-gray-950">Accés Caisse Restreint</h4>
                  <p className="text-[10px] text-gray-450">
                    Seul le caissier attitré (Youssouf Koné, Comptable) ou le Super Administrateur peut ouvrir/clôturer l'activité financière.
                  </p>
                </div>
              )}

              {openCaisse ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl">
                    <span className="block font-bold text-[10px] text-emerald-800 uppercase tracking-wider font-mono">Session Active Ouverte</span>
                    <div className="text-lg font-black font-mono mt-1">
                      {openCaisse.id}
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1">Ouvert par : {openCaisse.caissierName}</p>
                    <p className="text-[10px] text-emerald-700">Heure: {new Date(openCaisse.dateOuverture).toLocaleTimeString()} GMT</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">SOLDE LOGIQUE CENTRAL</span>
                    <span className="text-xl font-bold font-mono text-slate-850">
                      {openCaisse.currentSolde.toLocaleString()} FCFA
                    </span>
                  </div>

                  {/* Close Caisse Form */}
                  <form onSubmit={handleCloseCaisseSession} className="p-3 bg-slate-50 border rounded-xl space-y-3 mt-4">
                    <span className="block text-[11px] font-bold text-slate-600 font-mono">Formulaire Clôture de Caisse</span>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 block font-bold">Fonds physiques recomptés (FCFA) *</label>
                      <input
                        type="number"
                        required
                        placeholder="Recomptage coffre..."
                        value={fondsPhysiqueInput}
                        onChange={(e) => setFondsPhysiqueInput(e.target.value)}
                        className="bg-white border rounded p-1.5 w-full font-mono text-xs font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-slate-900 text-white font-bold p-2 rounded text-[10px] uppercase cursor-pointer"
                    >
                      Compacter & Clôturer la caisse
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-450 italic">La caisse centrale d'admission est actuellement fermée.</p>
                  
                  <form onSubmit={handleOpenCaisseSession} className="p-3 bg-slate-50 border rounded-xl space-y-3">
                    <span className="block text-[11px] font-bold text-slate-650 font-mono">Saisir Solde d'Ouverture</span>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 block font-bold">Fonds de caisse initial (FCFA) *</label>
                      <input
                        type="number"
                        required
                        value={soldeInitialInput}
                        onChange={(e) => setSoldeInitialInput(e.target.value)}
                        className="bg-white border rounded p-1.5 w-full font-mono text-xs font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 rounded text-[11px] cursor-pointer"
                    >
                      Démarrer Activité & Caisse
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* TRANSACTIONS HISTORICAL DATA IN ACTIVE SESSION */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b border-gray-100 pb-2">
                GRAND LIVRE / HISTORIQUES TRANSACTIONS DE SESSION
              </span>

              {openCaisse && openCaisse.transactions.length > 0 ? (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-55 border-b font-mono text-[9px] text-gray-400 font-bold uppercase">
                        <th className="p-2.5">TX_ID</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Heure</th>
                        <th className="p-2.5">Désignation Opération</th>
                        <th className="p-2.5 text-right">Montant (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {openCaisse.transactions.slice().reverse().map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-gray-500">{tx.id}</td>
                          <td className="p-2.5">
                            <span className={`inline-block text-[9px] font-bold p-0.5 px-2 rounded-full ${
                              tx.type === 'Encaissement' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-gray-400">{tx.heure}</td>
                          <td className="p-2.5 text-gray-700 font-sans">{tx.motif}</td>
                          <td className={`p-2.5 text-right font-mono font-bold ${
                            tx.type === 'Encaissement' ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {tx.type === 'Décaissement' ? '-' : ''}{tx.montant.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic p-12 text-center">Aucune transaction enregistrée dans cette session</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
