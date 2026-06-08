/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Patient, 
  Consultation, 
  HospitalisationRecord, 
  LaboratoireTest, 
  ImagerieTest, 
  User 
} from '../types';
import { 
  FolderHeart, 
  Search, 
  FileText, 
  Heart, 
  Activity, 
  FlaskConical, 
  Scan, 
  Bed, 
  AlertTriangle,
  BadgeAlert,
  Calendar,
  Layers,
  FileCheck2,
  FolderOpen
} from 'lucide-react';

interface DmeModuleProps {
  patients: Patient[];
  consultations: Consultation[];
  hospitalisations: HospitalisationRecord[];
  labTests: LaboratoireTest[];
  imagerieTests: ImagerieTest[];
  currentUser: User;
}

export default function DmeModule({
  patients,
  consultations,
  hospitalisations,
  labTests,
  imagerieTests,
  currentUser
}: DmeModuleProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Find the currently viewed patient
  const activePatient = patients.find(p => p.id === selectedPatientId);

  // Filter patients lookup list
  const lookupPatients = patients.filter(p => {
    const term = searchQuery.toLowerCase();
    return p.nom.toLowerCase().includes(term) || p.prenom.toLowerCase().includes(term) || p.id.includes(term);
  });

  // Collect all timeline records for the active patient
  const patientConsultations = consultations.filter(c => c.patientId === selectedPatientId);
  const patientHospitalisations = hospitalisations.filter(h => h.patientId === selectedPatientId);
  const patientLabTests = labTests.filter(l => l.patientId === selectedPatientId);
  const patientImageries = imagerieTests.filter(i => i.patientId === selectedPatientId);

  // Merge into a chronological array
  interface TimelineItem {
    id: string;
    date: string;
    type: 'consultation' | 'hospitalisation' | 'laboratoire' | 'imagerie';
    title: string;
    subtitle: string;
    badgeColor: string;
    details: any;
  }

  const timelineItems: TimelineItem[] = [];

  patientConsultations.forEach(c => {
    timelineItems.push({
      id: c.id,
      date: c.date,
      type: 'consultation',
      title: `Consultation : ${c.motif}`,
      subtitle: `Par ${c.medecinName}`,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-250',
      details: c
    });
  });

  patientHospitalisations.forEach(h => {
    timelineItems.push({
      id: h.id,
      date: h.dateAdmission,
      type: 'hospitalisation',
      title: `Hospitalisation : ${h.statut}`,
      subtitle: `Service ${h.service} — Salle ${h.salle} (Lit ${h.lit})`,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-250',
      details: h
    });
  });

  patientLabTests.forEach(l => {
    timelineItems.push({
      id: l.id,
      date: l.datePrescription,
      type: 'laboratoire',
      title: `Examen Laboratoire : ${l.examNom}`,
      subtitle: `Statut de l'analyse : ${l.statut}`,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-250',
      details: l
    });
  });

  patientImageries.forEach(i => {
    timelineItems.push({
      id: i.id,
      date: i.datePrescription,
      type: 'imagerie',
      title: `Observation Imagerie : ${i.typeExamen} (${i.detailsExamen})`,
      subtitle: `Statut : ${i.statut}`,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-250',
      details: i
    });
  });

  // Sort chronological - most recent first
  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      {/* LEFT COLUMN: Patient selectors */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-3">Recherche Électronique</span>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-gray-150 pl-9 pr-4 py-2 rounded-lg outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Patients lookup result frame */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden max-h-[500px] overflow-y-auto">
          <div className="p-3.5 bg-gray-50 border-b border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">Dossiers Consultables ({lookupPatients.length})</h4>
          </div>
          <div className="divide-y divide-gray-150">
            {lookupPatients.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`w-full text-left p-3.5 flex items-center justify-between transition-colors ${
                  selectedPatientId === p.id ? 'bg-sky-50/70 border-l-4 border-sky-600' : 'hover:bg-slate-55'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-gray-900 leading-tight">
                    {p.nom} {p.prenom}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono tracking-wider">{p.id} • {p.sexe}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] bg-red-50 text-red-700 font-extrabold px-1.5 py-0.5 rounded-sm border border-red-100">
                    {p.groupeSanguin}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: DME dossier representation */}
      <div className="lg:col-span-2 space-y-6">
        {!activePatient ? (
          <div className="bg-white border border-gray-150 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[480px]">
            <div className="w-16 h-16 bg-sky-55 text-sky-600 rounded-full flex items-center justify-center mb-1">
              <FolderHeart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Aucun dossier médical électronique sélectionné</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Choisissez un patient dans l'index civil à gauche pour afficher son historique permanent, diagnostics codés CIM-10, examens de laboratoire et ordonnances.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. TOP CARD: Patient core clinical identity markers */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute right-0 top-0 bg-sky-55 text-sky-800 px-4 py-1.5 text-xs font-bold font-mono rounded-bl-xl border-l border-b border-sky-100">
                CRÉATION : {new Date(activePatient.dateCreation).toLocaleDateString()}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-14 h-14 bg-sky-600 rounded-2xl text-white font-extrabold text-lg flex items-center justify-center border-2 border-white shadow-md shadow-sky-500/10">
                  {activePatient.nom[0]}{activePatient.prenom[0]}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 leading-tight">
                    {activePatient.nom} {activePatient.prenom}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="font-mono font-bold text-sky-600">{activePatient.id}</span>
                    <span>•</span>
                    <span>Né(e) le {new Date(activePatient.dateNaissance).toLocaleDateString()} ({new Date().getFullYear() - new Date(activePatient.dateNaissance).getFullYear()} ans)</span>
                  </div>
                </div>
              </div>

              {/* Patient mini-clinical HUD */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-5 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Groupe Sanguin</span>
                  <span className="bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded border border-rose-200">
                    {activePatient.groupeSanguin}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Allergies Cliniques</span>
                  <span className="font-semibold text-gray-850">
                    {activePatient.allergies.length > 0 ? activePatient.allergies.join(', ') : "Aucune"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Maladies Chroniques</span>
                  <span className="font-semibold text-gray-850">
                    {activePatient.maladiesChroniques.length > 0 ? activePatient.maladiesChroniques.join(', ') : "Aucune"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block">Antécédents</span>
                  <span className="font-semibold text-gray-850">
                    {activePatient.antecedentsMedicaux.length > 0 ? activePatient.antecedentsMedicaux.join(', ') : "Aucun"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. TIMELINE: Chronological permanent history HUD */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Parcours Médical Permanent</h3>
                  <p className="text-xs text-gray-400">Section historique inaltérable d'actes cliniques</p>
                </div>
                <span className="p-1 px-3.5 bg-gray-100 text-gray-600 font-bold font-mono text-[10px] rounded-full">
                  {timelineItems.length} ACTES LOGUÉS
                </span>
              </div>

              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {timelineItems.length === 0 ? (
                  <p className="text-xs text-center text-gray-450 italic py-8">Aucun acte enregistré pour ce dossier DME</p>
                ) : (
                  timelineItems.map((item) => (
                    <div key={item.id} className="flex gap-4 relative group text-xs text-left">
                      
                      {/* Timeline Node Icon Anchor */}
                      <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center shrink-0 z-10">
                        {item.type === 'consultation' && <Heart className="w-3.5 h-3.5 text-emerald-600" />}
                        {item.type === 'hospitalisation' && <Bed className="w-3.5 h-3.5 text-indigo-600" />}
                        {item.type === 'laboratoire' && <FlaskConical className="w-3.5 h-3.5 text-amber-600" />}
                        {item.type === 'imagerie' && <Scan className="w-3.5 h-3.5 text-purple-600" />}
                      </div>

                      {/* Timeline Body element */}
                      <div className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl p-4 transition-colors space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-[10px] text-gray-400">
                            {new Date(item.date).toLocaleString()}
                          </span>
                          <span className={`inline-block border text-[9px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.type.toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-gray-900 text-[13px]">{item.title}</h4>
                          <p className="text-xs text-gray-450 mt-0.5 font-medium">{item.subtitle}</p>
                        </div>

                        {/* Expandable specifics depending on records type */}
                        {item.type === 'consultation' && (
                          <div className="border-t border-slate-200/60 pt-3 space-y-2.5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                              <div>
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Symptômes relevés :</span>
                                <p className="text-gray-700 italic">"{item.details.symptomes}"</p>
                              </div>
                              <div>
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Examen Clinique :</span>
                                <p className="text-gray-700">{item.details.examenClinique}</p>
                              </div>
                            </div>

                            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                              <span className="text-[10px] text-emerald-800 font-extrabold block uppercase tracking-wide">Diagnostic Répertorié</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="p-0.5 px-2 bg-emerald-100 border border-emerald-250 text-emerald-900 font-mono font-bold text-[10px] rounded">
                                  CIM-10: {item.details.cimCode || "Sans Code"}
                                </span>
                                <span className="text-xs text-emerald-950 font-bold font-sans">
                                  {item.details.diagnostic}
                                </span>
                              </div>
                            </div>

                            {item.details.prescription && item.details.prescription.length > 0 && (
                              <div className="p-2.5 bg-white border border-slate-150 rounded-lg space-y-1.5">
                                <span className="block font-bold text-[10px] text-slate-400 uppercase">Prescription Officinale</span>
                                <div className="divide-y divide-slate-100">
                                  {item.details.prescription.map((pr: any, i: number) => (
                                    <div key={i} className="py-1 flex items-center justify-between text-xs">
                                      <span className="font-semibold text-gray-850">● {pr.medicament}</span>
                                      <span className="text-gray-500">{pr.posologie} ({pr.duree})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Gen Document Certificates representation */}
                            {item.details.documentsGeneres && (item.details.documentsGeneres.certificatMedical || item.details.documentsGeneres.arretMaladie) && (
                              <div className="flex gap-2 pt-1.5">
                                {item.details.documentsGeneres.certificatMedical && (
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-1 rounded border border-sky-100">
                                    <FileCheck2 className="w-3.5 h-3.5" /> Certificat Médical disponible
                                  </span>
                                )}
                                {item.details.documentsGeneres.arretMaladie && (
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-1 rounded border border-amber-100">
                                    <Calendar className="w-3.5 h-3.5" /> Arrêt de travail ({item.details.documentsGeneres.joursArret} jours)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {item.type === 'hospitalisation' && (
                          <div className="border-t border-slate-200/60 pt-3 space-y-2">
                            <span className="block text-[10px] text-gray-400 font-bold">MOTIF D'ADMISSION :</span>
                            <p className="text-gray-700">{item.details.motifs}</p>
                            
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded">
                                Lits: {item.details.lit}
                              </span>
                              <span className="bg-slate-100 text-slate-700 font-mono text-[9px] px-2 py-0.5 rounded">
                                ADMIS LE: {new Date(item.details.dateAdmission).toLocaleDateString()}
                              </span>
                              {item.details.dateSortie && (
                                <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] px-2 py-0.5 rounded">
                                  SORTIE LE: {new Date(item.details.dateSortie).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {item.type === 'laboratoire' && (
                          <div className="border-t border-slate-200/60 pt-3 space-y-2">
                            {item.details.resultats && item.details.resultats.length > 0 ? (
                              <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg">
                                <span className="text-[10px] text-amber-800 font-bold block uppercase mb-1.5">Rapports d'Analyse Biochimique</span>
                                <div className="space-y-1">
                                  {item.details.resultats.map((res: any, i: number) => (
                                    <div key={i} className="flex justify-between border-b border-amber-100/30 pb-1 last:border-0">
                                      <span className="text-gray-700">{res.parametre}</span>
                                      <span className="font-bold font-mono text-gray-900">{res.valeur} {res.unite}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">En attente d'analyses bio-médicales</p>
                            )}
                          </div>
                        )}

                        {item.type === 'imagerie' && (
                          <div className="border-t border-slate-200/60 pt-3 space-y-2">
                            {item.details.compteRendu ? (
                              <div className="space-y-2">
                                <div className="text-gray-700 italic">"{item.details.compteRendu}"</div>
                                {item.details.imageUrl && (
                                  <div className="border border-slate-200 rounded-lg overflow-hidden max-w-xs mt-1">
                                    <img src={item.details.imageUrl} alt="observation" referrerpolicy="no-referrer" className="w-full h-auto object-cover max-h-32" />
                                    <span className="block text-[9px] text-slate-400 p-1.5 text-center font-mono bg-slate-100">
                                      Radiographie Pulmonaire - Cliché Officiel
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">En attente de radiographie ou imagerie</p>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
