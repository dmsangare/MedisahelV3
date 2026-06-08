/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Employee, PresenceRecord, CongeRecord, User, ClinicSettings } from '../types';
import { 
  Users, 
  Clock, 
  Calendar, 
  UserPlus, 
  Check, 
  Briefcase, 
  FileSpreadsheet, 
  ShieldCheck, 
  TrendingUp, 
  Inbox,
  AlertCircle
} from 'lucide-react';

interface RHModuleProps {
  employees: Employee[];
  presences: PresenceRecord[];
  conges: CongeRecord[];
  currentUser: User;
  settings: ClinicSettings;
  onAddEmployee: (emp: any) => Promise<any>;
  onCheckIn: (presenceData: any) => Promise<any>;
  onAddConge: (congeData: any) => Promise<any>;
}

export default function RHModule({
  employees,
  presences,
  conges,
  currentUser,
  settings,
  onAddEmployee,
  onCheckIn,
  onAddConge
}: RHModuleProps) {
  const [activeTab, setActiveTab] = useState<'employees' | 'presences' | 'conges'>('employees');

  // Employee creation fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [role, setRole] = useState('Infirmier');
  const [sexe, setSexe] = useState('M');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [salaireDeBase, setSalaireDeBase] = useState(250000);
  const [statutContrat, setStatutContrat] = useState('CDI');

  // Clock-in form fields
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [clockInTime, setClockInTime] = useState('07:30');
  const [clockInStatus, setClockInStatus] = useState<'Présent' | 'Absent' | 'Retard'>('Présent');

  // Congés form fields
  const [congeEmpId, setCongeEmpId] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [congeType, setCongeType] = useState('Annuel');
  const [congeMotif, setCongeMotif] = useState('');

  const canManage = currentUser.role === 'RH' || currentUser.role === 'Super Administrateur';

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !prenom) return;

    await onAddEmployee({
      nom,
      prenom,
      role,
      sexe,
      telephone,
      email,
      dateEmbauche: new Date().toISOString().split('T')[0],
      salaireDeBase,
      statutContrat
    });

    setNom('');
    setPrenom('');
    setTelephone('');
    setEmail('');
  };

  const handleClockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    await onCheckIn({
      employeeId: selectedEmpId,
      employeeNomComplet: `${emp.prenom} ${emp.nom}`,
      heureArrivee: clockInTime,
      statut: clockInStatus
    });

    setSelectedEmpId('');
  };

  const handleCreateConge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!congeEmpId || !dateDebut || !dateFin) return;

    const emp = employees.find(e => e.id === congeEmpId);
    if (!emp) return;

    await onAddConge({
      employeeId: congeEmpId,
      employeeNomComplet: `${emp.prenom} ${emp.nom}`,
      dateDebut,
      dateFin,
      type: congeType,
      motif: congeMotif
    });

    setCongeEmpId('');
    setDateDebut('');
    setDateFin('');
    setCongeMotif('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Ressources Humaines & Contrats</h2>
          <p className="text-xs text-gray-400">Personnel, pointages de présence électronique, grand livre d'indemnités et congés</p>
        </div>

        {/* Local HR layout navigation */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'employees' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Membres du Personnel ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('presences')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'presences' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Feuille d'Émargement ({presences.length})
          </button>
          <button
            onClick={() => setActiveTab('conges')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'conges' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Demandes de Congés ({conges.length})
          </button>
        </div>
      </div>

      {activeTab === 'employees' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* REGISTER NEW COLLABORATOR CARD */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative h-fit">
            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b pb-2">
              EMBAUCHER UN COLLABORATEUR
            </span>

            {!canManage && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                <h4 className="font-bold text-xs text-gray-950">Accés RH Restreint</h4>
                <p className="text-[10px] text-gray-450">
                  Veuillez basculer vers le profil <strong className="font-semibold">RH (Aïssatou Sow)</strong> ou Administrateur pour modifier la base salariale et contrats.
                </p>
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs font-medium text-gray-750">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold block">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Samba"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full border rounded-lg p-2 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Coulibaly"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full border rounded-lg p-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold block">Spécialité / Rôle *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white"
                  >
                    <option value="Médecin">Dr Médecin</option>
                    <option value="Infirmier">Infirmier qualifié</option>
                    <option value="Laborantin">Assistant Laborantin</option>
                    <option value="Pharmacien">Pharmacien-gérant</option>
                    <option value="Comptable">Comptable Coffre</option>
                    <option value="Réceptionniste">Réceptionniste d'admission</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">Sexe *</label>
                  <select
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold block">Salaire (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={salaireDeBase}
                    onChange={(e) => setSalaireDeBase(parseInt(e.target.value) || 0)}
                    className="w-full border rounded-lg p-2 font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">Contrat *</label>
                  <select
                    value={statutContrat}
                    onChange={(e) => setStatutContrat(e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white"
                  >
                    <option value="CDI">CDI (Indéterminée)</option>
                    <option value="CDD">CDD (Déterminée)</option>
                    <option value="Stage">Stage rémunéré</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold block">Téléphone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+223"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@medisahel.ml"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-lg cursor-pointer"
              >
                Intégrer Nouvel Employé
              </button>
            </form>
          </div>

          {/* TABLE OF ACTIVE COLLABORATORS */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b pb-2">
              LISTE GENERALE DU PERSONNEL ({employees.length} MEMBRES)
            </span>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 uppercase text-[9px] text-gray-400 font-black p-3">
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Identité</th>
                    <th className="p-3">Métier</th>
                    <th className="p-3">Contrat</th>
                    <th className="p-3">Salaire de Base</th>
                    <th className="p-3 text-right">Dernière Présence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-gray-500">{emp.id}</td>
                      <td className="p-3">
                        <span className="block font-bold text-gray-850">{emp.prenom} {emp.nom}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{emp.email} • {emp.telephone}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-sky-50 text-sky-800 border px-2 py-0.5 rounded font-semibold text-[10px]">
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-indigo-800 font-mono">{emp.statutContrat}</td>
                      <td className="p-3 font-mono font-bold text-gray-900">{emp.salaireDeBase.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right text-gray-400 font-mono font-medium">{emp.dernierePresence || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : activeTab === 'presences' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CHECK-IN EMBEDDED SLIDE */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative h-fit">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b pb-2">
              ENREGISTRER ÉMARGEMENT DU MATIN
            </span>

            <form onSubmit={handleClockIn} className="space-y-4 text-xs font-medium text-gray-700">
              <div className="space-y-1">
                <label className="font-semibold block text-gray-600">Choisir Collaborateur *</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full border rounded p-2 bg-white text-xs"
                >
                  <option value="">-- Choisir --</option>
                  {employees.map(p => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom} ({p.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold block">Heure Effective *</label>
                  <input
                    type="time"
                    required
                    value={clockInTime}
                    onChange={(e) => setClockInTime(e.target.value)}
                    className="w-full border rounded p-1.5 focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">Qualification *</label>
                  <select
                    value={clockInStatus}
                    onChange={(e) => setClockInStatus(e.target.value as any)}
                    className="w-full border rounded p-1.5 bg-white"
                  >
                    <option value="Présent">Présent (À temps)</option>
                    <option value="Retard">Retard (Bénigne)</option>
                    <option value="Absent">Absent (Justifié)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2 rounded cursor-pointer"
              >
                Pointer la Présence Intranet
              </button>
            </form>
          </div>

          {/* PRESENCE LISTING */}
          <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-xs">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4">
              FEUILLE ADMINISTRATIVE DES PRESENCES ({presences.length} TICKETS)
            </span>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b uppercase text-[10px] text-gray-400 font-bold p-2.5">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Nom Collaborateur</th>
                    <th className="p-2.5">Heure Arrivée</th>
                    <th className="p-2.5 text-right font-sans">Arbitrage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {presences.slice().reverse().map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono text-gray-400">{pr.date}</td>
                      <td className="p-2.5 font-bold text-gray-800">{pr.employeeNomComplet}</td>
                      <td className="p-2.5 font-mono font-semibold text-slate-700">{pr.heureArrivee}</td>
                      <td className="p-2.5 text-right">
                        <span className={`p-0.5 px-3 rounded-full text-[10px] font-bold ${
                          pr.statut.includes('Présent') ? 'bg-emerald-50 text-emerald-800 border' :
                          pr.statut === 'Retard' ? 'bg-amber-100 text-amber-800 border' :
                          'bg-rose-50 text-rose-800 border'
                        }`}>
                          {pr.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* CONGÉS SYSTEM PANEL */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* DEMANDER UN CONGE FORM */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative h-fit">
            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b pb-2">
              DÉPOSER UNE SÉANCE DE CONGÉS
            </span>

            <form onSubmit={handleCreateConge} className="space-y-4 text-xs font-medium text-gray-700">
              <div className="space-y-1">
                <label className="font-semibold block">Employé Demandeur *</label>
                <select
                  required
                  value={congeEmpId}
                  onChange={(e) => setCongeEmpId(e.target.value)}
                  className="w-full border rounded p-2 bg-white text-xs"
                >
                  <option value="">-- Choisir --</option>
                  {employees.map(p => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom} ({p.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold block">Début *</label>
                  <input
                    type="date"
                    required
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full border rounded p-1.5 focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">Fin *</label>
                  <input
                    type="date"
                    required
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full border rounded p-1.5 focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold block text-gray-600">Type de congé *</label>
                <select
                  value={congeType}
                  onChange={(e) => setCongeType(e.target.value)}
                  className="w-full border rounded p-2 bg-white text-xs"
                >
                  <option value="Annuel">Annuel payé</option>
                  <option value="Maladie">Maladie / Convalescence</option>
                  <option value="Maternité">Maternité</option>
                  <option value="Exceptionnel">Exceptionnel (Mariage/Décès)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Motif explicatif</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Voyage annuel..."
                  value={congeMotif}
                  onChange={(e) => setCongeMotif(e.target.value)}
                  className="w-full border rounded p-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2 rounded cursor-pointer"
              >
                Soumettre Demande RH
              </button>
            </form>
          </div>

          {/* CONGE REQUESTS ARCHIVE TABLE */}
          <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-xs">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4">
              HISTORIQUE DES DEMANDES DE CONGES ({conges.length} REQUETES)
            </span>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b uppercase text-[10px] text-gray-400 font-bold p-2.5">
                    <th className="p-2.5">Ref</th>
                    <th className="p-2.5">Demandeur</th>
                    <th className="p-2.5">Intervalle Dates</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5 text-right">Statut RH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-medium">
                  {conges.slice().reverse().map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono text-gray-400">{c.id}</td>
                      <td className="p-2.5 font-bold text-gray-800">
                        <span className="block">{c.employeeNomComplet}</span>
                        <span className="text-[10px] text-gray-400 font-normal italic">"{c.motif}"</span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">
                        Du {c.dateDebut} au {c.dateFin}
                      </td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 p-0.5 px-2 rounded text-gray-600 font-bold text-[9px] uppercase font-mono">
                          {c.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center justify-center ml-auto w-fit">
                          <ShieldCheck className="w-3.5 h-3.5 mr-0.5 text-emerald-600" /> {c.statut}
                        </span>
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
