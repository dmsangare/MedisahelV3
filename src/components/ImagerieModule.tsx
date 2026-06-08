/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ImagerieTest, User, ClinicSettings } from '../types';
import { 
  Scan, 
  Search, 
  FileCheck2, 
  Upload, 
  Image, 
  Printer, 
  Check, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

interface ImagerieModuleProps {
  exams: ImagerieTest[];
  currentUser: User;
  settings: ClinicSettings;
  onUpdateExam: (id: string, updateData: any) => Promise<any>;
  onAddExam: (examData: any) => Promise<any>;
}

export default function ImagerieModule({
  exams,
  currentUser,
  settings,
  onUpdateExam,
  onAddExam
}: ImagerieModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Form input fields for uploading report / interpreting
  const [compteRendu, setCompteRendu] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [statut, setStatut] = useState<'Réalisé' | 'Interprété'>('Interprété');

  // Manual exam prescription fields
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [typeExamen, setTypeExamen] = useState('Radiographie Thoracique (Face)');
  const [indicationClinique, setIndicationClinique] = useState('');

  const canWrite = currentUser.permissions.includes('IMAGERIE.WRITE') || currentUser.role === 'Super Administrateur';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) return;

    await onUpdateExam(selectedExamId, {
      compteRendu,
      imageUrl: imageUrl || undefined,
      statut
    });

    setSelectedExamId(null);
    setCompteRendu('');
    setImageUrl('');
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) return;

    await onAddExam({
      patientId: patientId || `P-${Math.floor(Math.random() * 9000) + 1000}`,
      patientName,
      typeExamen,
      detailsExamen: indicationClinique,
      statut: 'Prescrit'
    });

    setPatientId('');
    setPatientName('');
    setIndicationClinique('');
  };

  const selectedExam = exams.find(ex => ex.id === selectedExamId);

  const filteredExams = exams.filter(ex => {
    const term = searchQuery.toLowerCase();
    return ex.patientName.toLowerCase().includes(term) || ex.typeExamen.toLowerCase().includes(term) || ex.id.toLowerCase().includes(term);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 md:p-6 text-left text-xs font-sans text-gray-700">
      
      {/* COLUMN 1: PRESCRIBE NEW IMAGING OR INTERPRET ACTION */}
      <div className="lg:col-span-1 space-y-4">
        
        {/* INTERPRET POP CONSOLE */}
        {selectedExamId && selectedExam ? (
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-mono text-gray-400 uppercase tracking-wider text-[10px]">REDACTION DU COMPTE RENDU</span>
              <button 
                onClick={() => setSelectedExamId(null)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer font-mono"
              >
                Annuler
              </button>
            </div>

            {!canWrite && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center text-white">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                <h4 className="font-bold text-xs">Droits Radiologue Restreints</h4>
                <p className="text-[10px] text-gray-400 max-w-xs leading-normal mt-1">
                  Veuillez basculer vers le profil <strong className="font-semibold text-white">Dr. Alou Sy (Radiologue)</strong> pour valider les analyses d'imagerie.
                </p>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-mono">Exam cible</label>
                <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-755 mt-1">
                  <span className="block font-bold text-white">{selectedExam.typeExamen}</span>
                  <span className="block text-[10px] text-sky-400 font-mono mt-0.5">{selectedExam.patientName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-semibold">Observations & Compte Rendu Médical *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Infiltration pulmonaire basale gauche, absence d'épanchement pleural..."
                  value={compteRendu}
                  onChange={(e) => setCompteRendu(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-semibold">Asset URL Cliché Radiologique</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 font-mono"
                />
                <p className="text-[9px] text-gray-400">Laisser vide pour charger le cliché de secours intégré par défaut</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-gray-300">Statut diagnostic</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Interprété">Interprété (Définitif)</option>
                    <option value="Réalisé">Réalisé (En attente d'interprétation)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-sky-600 font-bold hover:bg-sky-500 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center gap-1"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" /> Signer et Publier
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* PRESCRIBE CARD */
          <div className="bg-white border rounded-2xl p-5 shadow-xs relative">
            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b pb-2">
              PRESCRIRE UN EXAMEN RADIOGRAPHIQUE
            </span>

            <form onSubmit={handlePrescribe} className="space-y-4 font-medium text-gray-700">
              <div className="space-y-1">
                <label className="font-bold block">Patient Cible *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salimata Keita"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full border rounded-lg p-2 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Type d'imagerie clinique *</label>
                <select
                  value={typeExamen}
                  onChange={(e) => setTypeExamen(e.target.value)}
                  className="w-full border rounded-lg p-2.5 bg-white"
                >
                  <option value="Radiographie Thoracique (Face)">Radiographie Thoracique (Face)</option>
                  <option value="Échographie Abdomino-pelvienne">Échographie Abdomino-pelvienne</option>
                  <option value="Scanner Cérébral (TDM)">Scanner Cérébral (TDM)</option>
                  <option value="IRM Rachidienne">IRM Rachidienne</option>
                  <option value="Mammographie Bilatérale">Mammographie Bilatérale</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold block col-span-1">Indication Médicale d'Orientation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suspicion pneumonie lobaire droite"
                  value={indicationClinique}
                  onChange={(e) => setIndicationClinique(e.target.value)}
                  className="w-full border rounded p-2 text-xs font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold p-2.5 rounded-lg cursor-pointer"
              >
                Générer Bon d'Imagerie
              </button>
            </form>
          </div>
        )}

      </div>

      {/* COLUMN 2 & 3: EXAMEN LOG MATRICE */}
      <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-4 gap-3">
          <div>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
              MATRICE DES IMAGERIES ET TRAITEMENT ({exams.length} ENREGISTREMENTS)
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer par patient ou imagerie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-55 border border-gray-200 pl-8 pr-3 py-1 rounded text-[11px] outline-hidden focus:ring-1"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredExams.map((ex) => {
            const isPrescrit = ex.statut === 'Prescrit';
            const isInterp = ex.statut === 'Interprété';

            return (
              <div key={ex.id} className="p-4 border border-gray-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="p-0.5 px-2 bg-slate-200 rounded font-mono font-bold text-[9px] text-gray-650">
                      {ex.id}
                    </span>
                    <strong className="text-gray-900">{ex.patientName}</strong>
                    <span className={`text-[9px] font-bold p-0.5 px-2 rounded-full border ${
                      isPrescrit ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      isInterp ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      'bg-sky-50 text-sky-800 border-sky-200'
                    }`}>
                      {ex.statut}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
                    <Scan className="w-4 h-4 text-sky-600 inline shrink-0" />
                    {ex.typeExamen}
                  </h3>

                  <p className="text-gray-500">
                    <span className="font-bold text-[10px] text-gray-400 uppercase block font-mono">Indication Clinique d'admission :</span>
                    "{ex.detailsExamen}"
                  </p>

                  {ex.compteRendu && (
                    <div className="p-2.5 bg-white border border-gray-100 rounded-lg text-slate-700 italic font-mono text-[10.5px]">
                      <span className="block font-bold font-sans text-[10px] text-sky-700 float-none uppercase not-italic mb-1 border-b">OBSERVATION & INTERPRÉTATION :</span>
                      {ex.compteRendu}
                    </div>
                  )}

                  {ex.imageUrl && (
                    <details className="mt-2 text-[10.5px]">
                      <summary className="cursor-pointer font-bold text-sky-600 select-none hover:underline">Afficher le rapport Cliché d'imagerie (.PNG)</summary>
                      <div className="mt-2 text-center bg-slate-900 p-2 rounded-xl">
                        <img 
                          src={ex.imageUrl} 
                          alt="Imaging scan" 
                          referrerPolicy="no-referrer"
                          className="max-h-[180px] mx-auto rounded border" 
                        />
                      </div>
                    </details>
                  )}
                </div>

                <div className="flex md:flex-col items-end gap-2 shrink-0">
                  {isPrescrit ? (
                    <button
                      onClick={() => {
                        setSelectedExamId(ex.id);
                        setCompteRendu(ex.compteRendu || '');
                        setImageUrl(ex.imageUrl || '');
                      }}
                      className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold p-2 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" /> Interpréter
                    </button>
                  ) : (
                    <button
                      onClick={() => window.print()}
                      className="w-full md:w-auto bg-white border text-gray-600 font-bold p-2 px-3 rounded-lg cursor-pointer flex items-center gap-1 hover:bg-slate-50"
                    >
                      <Printer className="w-3.5 h-3.5" /> imprimer Rapport
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
