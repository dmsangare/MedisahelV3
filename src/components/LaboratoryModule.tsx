/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LaboratoireTest, LaboratoireExam, User, Patient } from '../types';
import { 
  FlaskConical, 
  Plus, 
  CheckSquare, 
  Activity, 
  HelpCircle, 
  UserCheck, 
  AlertCircle,
  FileCheck2,
  ListFilter,
  Save,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

interface LaboratoryModuleProps {
  labTests: LaboratoireTest[];
  examsCatalogue: LaboratoireExam[];
  patients: Patient[];
  currentUser: User;
  onPrescribeTest: (test: any) => Promise<any>;
  onInputResults: (id: string, results: any[]) => Promise<any>;
  onValidateTest: (id: string) => Promise<any>;
}

export default function LaboratoryModule({
  labTests,
  examsCatalogue,
  patients,
  currentUser,
  onPrescribeTest,
  onInputResults,
  onValidateTest
}: LaboratoryModuleProps) {
  const [activeTab, setActiveTab] = useState<'queue' | 'configure'>('queue');
  const [selectedTestId, setSelectedTestId] = useState<string>('');

  // Saisir prescription variables
  const [patientId, setPatientId] = useState('');
  const [examId, setExamId] = useState('LAB-EX-001');

  // Entered parameters variables
  const [param1, setParam1] = useState('');
  const [param2, setParam2] = useState('');

  const canWrite = currentUser.permissions.includes('LABORATOIRE.WRITE') || currentUser.role === 'Super Administrateur';
  const canValidate = currentUser.permissions.includes('LABORATOIRE.VALIDATE') || currentUser.role === 'Super Administrateur';

  const selectedTest = labTests.find(t => t.id === selectedTestId);

  const handlePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    const matchPatient = patients.find(p => p.id === patientId);
    if (!matchPatient) return;

    await onPrescribeTest({
      patientId,
      patientName: `${matchPatient.nom} ${matchPatient.prenom}`,
      examId
    });

    setPatientId('');
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId || !selectedTest) return;

    // custom parameters based on selected exams code
    const isWidal = selectedTest.examId === 'LAB-EX-004';
    const isNfs = selectedTest.examId === 'LAB-EX-001';
    const isGly = selectedTest.examId === 'LAB-EX-002';

    let resultRows = [];
    if (isGly) {
      resultRows = [
        { parametre: "Glycémie à jeun (Plasma)", valeur: param1 || "0.95", unite: "g/L", reference: "0.70 - 1.10" }
      ];
    } else if (isWidal) {
      resultRows = [
        { parametre: "Antigène Typhi O (TO)", valeur: param1 || "Négatif (1/40)", unite: "Titre", reference: "< 1/80" },
        { parametre: "Antigène Typhi H (TH)", valeur: param2 || "Positif (1/160)", unite: "Titre", reference: "< 1/80" }
      ];
    } else {
      // General hematology / biology defaults
      resultRows = [
        { parametre: "Hématies (Globules Rouges)", valeur: param1 || "4.5", unite: "Millions/mm3", reference: "4.0 - 5.5" },
        { parametre: "Hémoglobine", valeur: param2 || "13.2", unite: "g/dL", reference: "12.0 - 16.0" }
      ];
    }

    await onInputResults(selectedTestId, resultRows);
    setParam1('');
    setParam2('');
    setSelectedTestId(''); // deselect
  };

  const handleTriggerValidation = async (id: string) => {
    await onValidateTest(id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Secteur Laboratoire & Analyses</h2>
          <p className="text-xs text-gray-400">Prescriptions électroniques, rapports d'examens et certifications de validation</p>
        </div>

        {/* Local lab sub navbar */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'queue' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            File des Analyses ({labTests.length})
          </button>
          <button
            onClick={() => setActiveTab('configure')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'configure' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Tarifs & Catalogue Examens
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SEC 1: FAST PRESCRIPTION FORM FOR WALK-IN PATIENTS */}
          <div className="lg:col-span-1 bg-white border border-gray-100 p-5 rounded-2xl shadow-xs relative h-fit">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b border-gray-100 pb-2">
              PRESCRIRE UN EXAMEN
            </span>

            <form onSubmit={handlePrescription} className="space-y-4 text-xs font-medium text-gray-750">
              <div className="space-y-1">
                <label className="font-bold block">Patient Cible *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-white"
                >
                  <option value="">-- Choisir Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold block font-sans">Examen Bio-Médical prescrit *</label>
                <select
                  required
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-white font-semibold text-gray-900"
                >
                  {examsCatalogue.map(e => (
                    <option key={e.id} value={e.id}>{e.nom} — {e.tarif.toLocaleString()} FCFA</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Générer Bon de Prescription
              </button>
            </form>
          </div>

          {/* SEC 2: FILE ANALYSIS QUEUES IN INTRA LABS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-2xl p-5 shadow-xs">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4">
                REGISTRE INTRA-MED DES ANALYSES
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b font-mono text-[10px] text-gray-400 uppercase font-bold text-left">
                      <th className="p-3">Numéro</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Type Analyse</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Auteur / Laborantin</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {labTests.map((test) => (
                      <tr key={test.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-gray-900">{test.id}</td>
                        <td className="p-3 font-semibold text-gray-800">{test.patientName}</td>
                        <td className="p-3 font-semibold text-slate-700">{test.examNom}</td>
                        <td className="p-3">
                          <span className={`inline-block text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                            test.statut === 'Validé' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            test.statut === 'Résultats saisis' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {test.statut}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 font-medium">{test.laborantinNom || "Non signé"}</td>
                        <td className="p-3 text-right gap-1.5 flex items-center justify-end">
                          {test.statut === 'Prescrit' || test.statut === 'Analyses en cours' || test.statut === 'Prélèvement' ? (
                            <button
                              onClick={() => {
                                if (canWrite) {
                                  setSelectedTestId(test.id);
                                }
                              }}
                              disabled={!canWrite}
                              className={`text-[10px] font-bold p-1 px-2.5 rounded-lg border transition-all ${
                                !canWrite 
                                  ? 'opacity-30 bg-transparent text-gray-400 cursor-not-allowed' 
                                  : 'bg-amber-50 border-amber-250 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              Saisir Résultats
                            </button>
                          ) : null}

                          {test.statut === 'Résultats saisis' ? (
                            <button
                              onClick={() => {
                                if (canValidate) {
                                  handleTriggerValidation(test.id);
                                }
                              }}
                              disabled={!canValidate}
                              className={`text-[10px] font-bold p-1 px-2.5 rounded-lg border flex items-center gap-1 transition-all ${
                                !canValidate 
                                  ? 'opacity-30 bg-transparent text-gray-450 cursor-not-allowed' 
                                  : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-705'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Valider & Signature
                            </button>
                          ) : null}

                          {test.statut === 'Validé' && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                              <CheckCircle className="w-3 h-3" /> Conclu
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EXPANDABLE MODULAR RESULTS ENTRY POPUP FORM */}
            {selectedTest && (
              <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-3 duration-200 text-xs text-gray-700">
                <div className="flex justify-between items-center border-b border-amber-200/60 pb-2">
                  <span className="font-bold text-amber-900 uppercase font-mono tracking-wider">
                    COMPTES COMPLÉMENTAIRES D'IMPORTS BIO : {selectedTest.id}
                  </span>
                  <button onClick={() => setSelectedTestId('')} className="text-amber-800 hover:text-amber-955 font-bold">FErmer</button>
                </div>

                <p className="font-semibold text-gray-800">
                  Renseignez les données d'analyse pour le patient <strong className="font-extrabold">{selectedTest.patientName}</strong> ({selectedTest.examNom}) :
                </p>

                <form onSubmit={handleSaveResults} className="space-y-4 max-w-md">
                  {selectedTest.examId === 'LAB-EX-002' ? (
                    <div className="space-y-1">
                      <label className="font-bold block text-gray-600">Valeur Glycémie à jeun (g/L) (Référence: 0.70 - 1.10)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1.82"
                        value={param1}
                        onChange={(e) => setParam1(e.target.value)}
                        className="bg-white border rounded p-2 w-full text-xs font-bold"
                      />
                    </div>
                  ) : selectedTest.examId === 'LAB-EX-004' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold block text-gray-600">Séro-Antigène TO</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Négatif (1/40)"
                          value={param1}
                          onChange={(e) => setParam1(e.target.value)}
                          className="bg-white border rounded p-2 w-full text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold block text-gray-600">Séro-Antigène TH</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Positif (1/160)"
                          value={param2}
                          onChange={(e) => setParam2(e.target.value)}
                          className="bg-white border rounded p-2 w-full text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold block text-gray-600">Hématies (M/mm3)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 4.6"
                          value={param1}
                          onChange={(e) => setParam1(e.target.value)}
                          className="bg-white border text-xs rounded p-2 w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold block text-gray-600">Hémoglobine (g/dL)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 12.8"
                          value={param2}
                          onChange={(e) => setParam2(e.target.value)}
                          className="bg-white border text-xs rounded p-2 w-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pr-1">
                    <button
                      type="submit"
                      className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Enregistrer Résultats Saisis
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* CONFIGURE TARIFF CATALOG PANEL */
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs space-y-4">
          <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
            CONFIGURATION DES EXAMENS DISPONIBLES ET TARIFICATION
          </span>

          <div className="overflow-x-auto font-sans text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 uppercase tracking-wider text-[10px] text-gray-400 font-bold p-3">
                  <th className="p-3">Code Unique</th>
                  <th className="p-3">Désignation Examen</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Base Tarifaire (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {examsCatalogue.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-sky-700">{ex.code}</td>
                    <td className="p-3 font-semibold text-gray-800">{ex.nom}</td>
                    <td className="p-3 font-medium text-gray-500">{ex.categorie}</td>
                    <td className="p-3 font-mono font-bold text-gray-900">{ex.tarif.toLocaleString()} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
