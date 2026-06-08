/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UrgenceRecord, User, Patient } from '../types';
import { 
  AlertOctagon, 
  Plus, 
  Clock, 
  UserPlus, 
  CheckCircle, 
  UserCheck, 
  Search,
  BadgeAlert,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface UrgencesModuleProps {
  urgences: UrgenceRecord[];
  patients: Patient[];
  currentUser: User;
  onAddUrgence: (urg: any) => Promise<any>;
  onUpdateUrgence: (id: string, updates: any) => Promise<any>;
}

export default function UrgencesModule({
  urgences,
  patients,
  currentUser,
  onAddUrgence,
  onUpdateUrgence
}: UrgencesModuleProps) {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [motif, setMotif] = useState('');
  const [triage, setTriage] = useState<'Rouge' | 'Orange' | 'Jaune' | 'Vert'>('Jaune');
  const [notesSymptomes, setNotesSymptomes] = useState('');
  
  // Anonymous variables
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [ageSimule, setAgeSimule] = useState('');
  const [telephone, setTelephone] = useState('');

  const canManage = currentUser.permissions.includes('URGENCES.MANAGE') || currentUser.role === 'Super Administrateur';

  // Handle swift admission
  const handleSwiftAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif) return;

    let resolvedName = patientName;
    let resolvedId = patientId;

    if (isAnonymous) {
      resolvedName = `Inconnu Sahel #${Math.floor(Math.random() * 1000)}`;
      resolvedId = '';
    } else if (patientId) {
      const match = patients.find(p => p.id === patientId);
      if (match) resolvedName = `${match.nom} ${match.prenom}`;
    }

    if (!resolvedName) resolvedName = "Patient d'Urgence";

    const payload = {
      patientId: resolvedId || undefined,
      patientName: resolvedName,
      triage,
      motif,
      notesSymptomes: notesSymptomes || "Entrée en urgence.",
      ageSimule: isAnonymous ? ageSimule : undefined,
      telephone: isAnonymous ? telephone : undefined
    };

    await onAddUrgence(payload);

    // reset
    setPatientId('');
    setPatientName('');
    setMotif('');
    setTriage('Jaune');
    setNotesSymptomes('');
    setIsAnonymous(false);
    setAgeSimule('');
    setTelephone('');
  };

  const handleAttend = async (id: string) => {
    // assign default attending doctor
    await onUpdateUrgence(id, {
      statut: 'Pris en charge',
      medecinId: currentUser.id,
      medecinName: `${currentUser.prenom} ${currentUser.nom}`
    });
  };

  const handleRelease = async (id: string, decision: 'Sortie' | 'Hospitalisé') => {
    await onUpdateUrgence(id, { statut: decision });
  };

  // Sort queue by priority levels
  const triageRank = { 'Rouge': 1, 'Orange': 2, 'Jaune': 3, 'Vert': 4 };
  const sortedUrgences = [...urgences].sort((a, b) => {
    // If stats differ, active ones first
    const activeA = a.statut === 'En attente' || a.statut === 'Pris en charge' ? 0 : 1;
    const activeB = b.statut === 'En attente' || b.statut === 'Pris en charge' ? 0 : 1;
    if (activeA !== activeB) return activeA - activeB;

    return triageRank[a.triage] - triageRank[b.triage];
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      
      {/* ADMISSION & SPEED TRIAGE DESK */}
      <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative h-fit">
        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b border-gray-100 pb-2">
          COMPTOIR DE TRIAGE CLASSIQUE
        </span>

        {!canManage && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center">
            <ShieldAlert className="w-10 h-10 text-amber-500 mb-2" />
            <h4 className="font-bold text-xs text-gray-950">Accés Triage Restreint</h4>
            <p className="text-[10px] text-gray-450 max-w-xs">
              Seul le personnel médical (Infirmier, Médecin ou Réceptionniste d'admission d'urgence) peut encoder des fiches d'admission prioritaires.
            </p>
          </div>
        )}

        <form onSubmit={handleSwiftAdmission} className="space-y-4 text-xs font-medium text-gray-750">
          
          <div className="flex items-center gap-2 mb-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <input
              type="checkbox"
              id="anonCheck"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded"
            />
            <label htmlFor="anonCheck" className="font-bold text-slate-700 cursor-pointer select-none">
              Patient Non Identifié / Anonyme
            </label>
          </div>

          {!isAnonymous ? (
            <div className="space-y-1">
              <label className="font-bold block">Patient Connu</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white"
              >
                <option value="">-- Choisir Base Patients (Facultatif) --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.id})</option>
                ))}
              </select>
              {!patientId && (
                <div className="pt-1">
                  <span className="text-[10px] text-gray-400 block mb-0.5">Ou saisir nom d'identité manuelle :</span>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nom complet"
                    className="w-full border rounded-lg p-1.5"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-100">
              <div className="space-y-1">
                <label className="font-bold block">Âge d'apparence</label>
                <input
                  type="text"
                  placeholder="e.g. env. 30 ans"
                  value={ageSimule}
                  onChange={(e) => setAgeSimule(e.target.value)}
                  className="w-full border rounded-lg p-1.5"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold block">Téléphone possible</label>
                <input
                  type="text"
                  placeholder="e.g. Inconnu"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full border rounded-lg p-1.5"
                />
              </div>
            </div>
          )}

          {/* COLOR TRIAGE INDICATOR SECTION */}
          <div className="space-y-1.5">
            <label className="font-bold block text-gray-700">Code Tri Obstétrical / Clinique *</label>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {[
                { key: 'Rouge', label: 'Rouge (Vital)', bg: 'bg-red-650 text-white' },
                { key: 'Orange', label: 'Orange (Haut)', bg: 'bg-orange-500 text-white' },
                { key: 'Jaune', label: 'Jaune (Moyen)', bg: 'bg-amber-400 text-slate-900' },
                { key: 'Vert', label: 'Vert (Stable)', bg: 'bg-emerald-500 text-white' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTriage(item.key as any)}
                  className={`p-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer border transition-all ${
                    triage === item.key 
                      ? `${item.bg} ring-2 ring-slate-800 scale-105 border-transparent` 
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {item.key}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Motif principal d'Admission *</label>
            <input
              type="text"
              required
              placeholder="e.g. Trauma crânien, Hémorragie..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full border rounded-lg p-2 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Notes cliniques d'analyse rapide</label>
            <textarea
              rows={2}
              placeholder="Signales de Triage, pupilles stables, désorientation..."
              value={notesSymptomes}
              onChange={(e) => setNotesSymptomes(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-650 hover:bg-rose-700 text-white font-bold p-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider cursor-pointer"
          >
            ADMETTRE D'URGENCE IMMEDIAT
          </button>
        </form>
      </div>

      {/* EMERGENCY ROOMS QUEUE TIMELINE MODULE */}
      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Registre du Triage des Urgences</h3>
            <p className="text-xs text-gray-400">Suivi actif ordonné par degré d'urgence</p>
          </div>
          <span className="p-1 px-3 bg-red-50 text-red-700 border border-red-150 font-mono text-[10px] font-bold rounded-full">
            {urgences.filter(u => u.statut === 'En attente' || u.statut === 'Pris en charge').length} EN ATTENTE
          </span>
        </div>

        <div className="space-y-4 max-h-[550px] overflow-y-auto">
          {sortedUrgences.map((u) => {
            // Priority colors
            const badgeClasses = 
              u.triage === 'Rouge' ? 'bg-red-100 border-red-200 text-red-800' :
              u.triage === 'Orange' ? 'bg-orange-100 border-orange-200 text-orange-850' :
              u.triage === 'Jaune' ? 'bg-amber-105 border-amber-200 text-amber-850' :
              'bg-emerald-100 border-emerald-200 text-emerald-800';

            const isDeadlocks = u.statut === 'Sortie' || u.statut === 'Hospitalisé';

            return (
              <div 
                key={u.id} 
                className={`p-4 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                  isDeadlocks 
                    ? 'bg-slate-50 opacity-60 border-slate-100' 
                    : u.triage === 'Rouge' 
                      ? 'bg-red-50/40 border-red-150 shadow-xs' 
                      : 'bg-white border-gray-100 shadow-xs'
                }`}
              >
                <div className="space-y-2 text-left flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-gray-400 font-bold">{u.id}</span>
                    <span className={`inline-block border text-[9px] font-bold px-2 py-0.5 rounded ${badgeClasses}`}>
                      TRI: {u.triage}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {new Date(u.dateAdmission).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-gray-900 text-sm leading-tight">
                      {u.patientName} {u.ageSimule ? `(${u.ageSimule})` : ''}
                    </h4>
                    <p className="text-xs text-rose-750 font-bold tracking-tight mt-1">"{u.motif}"</p>
                    <p className="text-[11px] text-gray-500 italic mt-0.5 font-medium">"{u.notesSymptomes}"</p>
                  </div>

                  {u.medecinName && (
                    <div className="text-[11px] text-sky-700 bg-sky-50 p-1 px-2.5 rounded-lg border border-sky-100 w-fit font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" /> Pris en charge par : {u.medecinName}
                    </div>
                  )}
                </div>

                {/* Actions workflows */}
                <div className="flex shrink-0 gap-1.5 w-full md:w-auto justify-end">
                  {!isDeadlocks ? (
                    <>
                      {u.statut === 'En attente' && (
                        <button
                          onClick={() => handleAttend(u.id)}
                          className="w-full md:w-auto flex items-center gap-1 justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs p-2 px-3 rounded-lg cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Prendre en Charge
                        </button>
                      )}
                      
                      {u.statut === 'Pris en charge' && (
                        <div className="flex gap-1.5 w-full md:w-auto">
                          <button
                            onClick={() => handleRelease(u.id, 'Sortie')}
                            className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] p-2 px-3 rounded-lg cursor-pointer"
                          >
                            Libérer (Sortie)
                          </button>
                          <button
                            onClick={() => handleRelease(u.id, 'Hospitalisé')}
                            className="flex-1 md:flex-initial bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[11px] p-2 px-3 rounded-lg cursor-pointer"
                          >
                            Hospitaliser
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-100 p-1 px-2.5 rounded-full uppercase font-mono">
                      Traité : {u.statut}
                    </span>
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
