/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Patient, HospitalisationRecord, User } from '../types';
import { 
  Bed, 
  Plus, 
  Activity, 
  Clipboard, 
  Trash, 
  UserCheck, 
  UserMinus, 
  ShieldAlert, 
  Heart,
  Thermometer,
  CalendarCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface HospitalisationModuleProps {
  patients: Patient[];
  hospitalisations: HospitalisationRecord[];
  currentUser: User;
  onAddHospitalisation: (h: any) => Promise<any>;
  onUpdateHospitalisation: (id: string, updates: any) => Promise<any>;
  onAddConstant: (hospId: string, constants: any) => Promise<any>;
  onAddTreatment: (hospId: string, treatments: any) => Promise<any>;
}

export default function HospitalisationModule({
  patients,
  hospitalisations,
  currentUser,
  onAddHospitalisation,
  onUpdateHospitalisation,
  onAddConstant,
  onAddTreatment
}: HospitalisationModuleProps) {
  const [selectedHospId, setSelectedHospId] = useState<string>('');
  
  // Forms state for New Admission
  const [patientId, setPatientId] = useState('');
  const [batiment, setBatiment] = useState('Bâtiment A - Médecine');
  const [service, setService] = useState('Médecine Interne');
  const [salle, setSalle] = useState('Chambre Commune 102');
  const [lit, setLit] = useState('Lit A');
  const [motifs, setMotifs] = useState('');

  // Forms state for adding CONSTANTES vitals
  const [tempInput, setTempInput] = useState('37.0');
  const [tensionInput, setTensionInput] = useState('12/8');
  const [pulseInput, setPulseInput] = useState('75');
  const [constNoteInput, setConstNoteInput] = useState('Stable');

  // Forms state for treatments
  const [drugInput, setDrugInput] = useState('');
  const [treatmentNoteInput, setTreatmentNoteInput] = useState('Dose administrée par voie orale');

  const liveHospitalised = hospitalisations.filter(h => h.statut === 'Admis' || h.statut === 'Transféré');
  const activeHosp = hospitalisations.find(h => h.id === selectedHospId);

  const canManage = currentUser.permissions.includes('HOSPITALISATION.MANAGE') || currentUser.role === 'Super Administrateur';

  // Trigger registration
  const handleAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !motifs) return;

    const matchedPatient = patients.find(p => p.id === patientId);
    if (!matchedPatient) return;

    const payload = {
      patientId,
      patientName: `${matchedPatient.nom} ${matchedPatient.prenom}`,
      batiment,
      service,
      salle,
      lit,
      motifs
    };

    const added = await onAddHospitalisation(payload);
    if (added) {
      setSelectedHospId(added.id); // View details
      setPatientId('');
      setMotifs('');
    }
  };

  // Trigger Vitale constant
  const handleSaveConstant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospId) return;

    await onAddConstant(selectedHospId, {
      temperature: parseFloat(tempInput) || 37.0,
      tensionArterielle: tensionInput,
      pulsations: parseInt(pulseInput) || 75,
      note: constNoteInput
    });

    setTempInput('37.0');
    setTensionInput('12/8');
    setPulseInput('75');
    setConstNoteInput('Suivi stable');
  };

  // Trigger Drug
  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospId || !drugInput) return;

    await onAddTreatment(selectedHospId, {
      medicament: drugInput,
      note: treatmentNoteInput
    });

    setDrugInput('');
    setTreatmentNoteInput('Administré');
  };

  const handleExitPatient = async () => {
    if (!selectedHospId) return;
    await onUpdateHospitalisation(selectedHospId, { statut: 'Sorti' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      
      {/* COLUMN 1: Active Admissions queues and new admission form */}
      <div className="lg:col-span-1 space-y-4">
        {/* NEW ADMISSION FORM */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative">
          <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b border-gray-100 pb-2">
            FORMULAIRE D'ADMISSION EN LIT
          </span>

          {!canManage && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center">
              <ShieldAlert className="w-10 h-10 text-amber-500 mb-2" />
              <h4 className="font-bold text-xs text-gray-950">Accés Clinique Restreint</h4>
              <p className="text-[10px] text-gray-450 max-w-xs">
                Seul le personnel médical (Médecin, Infirmier ou Super Admin) peut affecter des lits d'hospitalisation aux patients admis.
              </p>
            </div>
          )}

          <form onSubmit={handleAdmission} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-gray-650 block">Patient Référant *</label>
              <select
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white"
              >
                <option value="">-- Sélectionner patient --</option>
                {patients.filter(p => !liveHospitalised.some(h => h.patientId === p.id)).map(p => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Aile / Bâtiment *</label>
              <select
                value={batiment}
                onChange={(e) => setBatiment(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white"
              >
                <option value="Bâtiment A - Médecine">Bâtiment A - Médecine</option>
                <option value="Bâtiment B - Chirurgie">Bâtiment B - Chirurgie</option>
                <option value="Pavillon C - Pédiatrie">Pavillon C - Pédiatrie</option>
                <option value="Pavillon d'Honneur VIP">Pavillon d'Honneur VIP</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold block">Service *</label>
                <input
                  type="text"
                  required
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full border rounded-lg p-1.5"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold block">Chambre/Salle *</label>
                <input
                  type="text"
                  required
                  value={salle}
                  onChange={(e) => setSalle(e.target.value)}
                  className="w-full border rounded-lg p-1.5"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Affectation Lit *</label>
              <input
                type="text"
                required
                value={lit}
                onChange={(e) => setLit(e.target.value)}
                placeholder="e.g. Lit B"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold block">Motifs cliniques d'Admission *</label>
              <textarea
                rows={2}
                required
                value={motifs}
                onChange={(e) => setMotifs(e.target.value)}
                placeholder="Diagnostic d'admitting, HTA critique, Diatonie..."
                className="w-full border rounded-lg p-1.5"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider cursor-pointer"
            >
              Émettre Fiche Client Admis
            </button>
          </form>
        </div>

        {/* ACTIVE ADMISSIONS DIRECTORY */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden max-h-[300px] overflow-y-auto">
          <div className="p-3.5 bg-gray-50 border-b border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">Dossiers Hospitalisés actifs ({liveHospitalised.length})</h4>
          </div>
          <div className="divide-y divide-gray-150">
            {liveHospitalised.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHospId(h.id)}
                className={`w-full text-left p-3 flex justify-between items-center transition-colors ${
                  selectedHospId === h.id ? 'bg-sky-50' : 'hover:bg-slate-55'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-gray-900 leading-tight">{h.patientName}</div>
                  <span className="text-[10px] bg-slate-100 font-mono text-gray-600 px-1 py-0.5 rounded mr-1">
                    {h.lit}
                  </span>
                  <span className="text-[10px] text-gray-400">{h.salle}</span>
                </div>
                <span className="text-[11px] bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                  {h.statut}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COLUMN 2 & 3: Detailed view with constante entry (Hospital folder) */}
      <div className="lg:col-span-2 space-y-6">
        {!activeHosp ? (
          <div className="bg-white border border-gray-150 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[480px]">
            <div className="w-16 h-16 bg-indigo-55 text-indigo-650 rounded-full flex items-center justify-center mb-1">
              <Bed className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Aucun lit d'admission actif sélectionné</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Choisissez un patient hospitalisé à gauche pour renseigner ses constantes infirmières, consigner ses traitements administrés, ou conclure sa clôture de chambre.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Folder Identification header */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-gray-400 font-bold tracking-wider uppercase">Fiche d'Admission {activeHosp.id}</span>
                <h3 className="text-base font-bold text-gray-900 block">{activeHosp.patientName}</h3>
                <p className="text-xs text-indigo-750 font-medium">
                  {activeHosp.batiment} — {activeHosp.service} • Chambre {activeHosp.salle} ({activeHosp.lit})
                </p>
                <div className="text-[11px] text-gray-450 italic font-medium">Motifs : "{activeHosp.motifs}"</div>
              </div>

              {canManage && activeHosp.statut === 'Admis' && (
                <button
                  onClick={handleExitPatient}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <UserMinus className="w-4 h-4" /> Libérer Lit / Sortie
                </button>
              )}
            </div>

            {/* Sub content grids: constants vitals logger + therapeutics actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Vitals records and logger */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-5">
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono border-b border-gray-100 pb-2">
                  1. FEUILLA DE VITALE CONSTANTES
                </span>

                {/* Constants List Graph */}
                <div className="space-y-3 max-h-[180px] overflow-y-auto">
                  {activeHosp.constantes.slice().reverse().map((c, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border rounded-xl text-xs flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="block font-mono text-[10px] text-gray-400">
                          {new Date(c.date).toLocaleDateString()} — {new Date(c.date).toTimeString().split(' ')[0].substring(0, 5)}
                        </span>
                        <div className="flex flex-wrap gap-2 text-gray-800">
                          <span className="bg-rose-50 text-rose-800 px-1 rounded font-bold">T°: {c.temperature}°C</span>
                          <span className="bg-blue-50 text-blue-800 px-1 rounded font-bold">TA: {c.tensionArterielle}</span>
                          <span className="bg-indigo-50 text-indigo-800 px-1 rounded font-bold">P: {c.pulsations} bpm</span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic mt-1 leading-tight">"{c.note}"</p>
                      </div>
                      <Thermometer className="w-4 h-4 text-rose-500" />
                    </div>
                  ))}
                </div>

                {/* Form to log constants */}
                {activeHosp.statut === 'Admis' && canManage && (
                  <form onSubmit={handleSaveConstant} className="bg-slate-55 p-3 rounded-xl border space-y-3 text-xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Saisir Constantes Cliniques</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block">T° (°C) *</label>
                        <input
                          type="text"
                          required
                          value={tempInput}
                          onChange={(e) => setTempInput(e.target.value)}
                          className="bg-white border rounded p-1 w-full text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block">Tension *</label>
                        <input
                          type="text"
                          required
                          value={tensionInput}
                          onChange={(e) => setTensionInput(e.target.value)}
                          className="bg-white border rounded p-1 w-full text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block">Pulse *</label>
                        <input
                          type="text"
                          required
                          value={pulseInput}
                          onChange={(e) => setPulseInput(e.target.value)}
                          className="bg-white border rounded p-1 w-full text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={constNoteInput}
                        onChange={(e) => setConstNoteInput(e.target.value)}
                        placeholder="Observation..."
                        className="bg-white border rounded p-1.5 w-full text-xs"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-1 px-3 rounded text-[10px] cursor-pointer"
                      >
                        Enregistrer Vitals
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Pharmaceutical treatments administrate */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-5">
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono border-b border-gray-100 pb-2">
                  2. SUIVI DE TRAITEMENTS ADMINISTRÉS
                </span>

                {/* Treatment entries */}
                <div className="space-y-3.5 max-h-[180px] overflow-y-auto">
                  {activeHosp.traitementsAdministres.length === 0 ? (
                    <p className="text-[11px] italic text-gray-400 py-6 text-center">Aucune administration enregistrée</p>
                  ) : (
                    activeHosp.traitementsAdministres.slice().reverse().map((t, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border rounded-xl text-xs relative text-left">
                        <span className="block font-mono text-[9px] text-gray-400">
                          {new Date(t.date).toLocaleDateString()} — {new Date(t.date).toTimeString().split(' ')[0].substring(0, 5)}
                        </span>
                        <h4 className="font-bold text-indigo-900 mt-1">{t.medicament}</h4>
                        <p className="text-[10px] text-gray-600 italic">Inf: {t.infirmierName}</p>
                        {t.note && (
                          <div className="p-1 px-2 bg-white rounded border text-[10px] text-gray-500 mt-1">
                            {t.note}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Log administrations */}
                {activeHosp.statut === 'Admis' && canManage && (
                  <form onSubmit={handleSaveTreatment} className="bg-slate-55 p-3 rounded-xl border space-y-3 text-xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Enregistrer Médication du jour</span>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Désignation médicament (e.g. Paracétamol IV 1g)"
                        value={drugInput}
                        onChange={(e) => setDrugInput(e.target.value)}
                        className="bg-white border rounded p-1.5 w-full text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Posologie ou remarque (e.g. Perfusion sur 30 min)"
                        value={treatmentNoteInput}
                        onChange={(e) => setTreatmentNoteInput(e.target.value)}
                        className="bg-white border rounded p-1.5 w-full text-xs"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-1 px-3 rounded text-[10px] cursor-pointer"
                      >
                        Valider Administration
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
