/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Patient, User } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Phone, 
  MapPin, 
  Activity, 
  X,
  FileSpreadsheet
} from 'lucide-react';

interface PatientsModuleProps {
  patients: Patient[];
  currentUser: User;
  onAddPatient: (p: any) => Promise<any>;
  onUpdatePatient: (id: string, updates: any) => Promise<any>;
}

export default function PatientsModule({
  patients,
  currentUser,
  onAddPatient,
  onUpdatePatient
}: PatientsModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form Fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [sexe, setSexe] = useState<'M' | 'F'>('M');
  const [dateNaissance, setDateNaissance] = useState('');
  const [profession, setProfession] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [groupeSanguin, setGroupeSanguin] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Inconnu'>('Inconnu');
  const [allergiesText, setAllergiesText] = useState('');
  const [antecedentsText, setAntecedentsText] = useState('');
  const [chroniquesText, setChroniquesText] = useState('');

  // Can the user alter records? (RBAC PATIENT.CREATE or PATIENT.UPDATE)
  const canCreate = currentUser.permissions.includes('PATIENT.CREATE') || currentUser.role === 'Super Administrateur';
  const canUpdate = currentUser.permissions.includes('PATIENT.UPDATE') || currentUser.role === 'Super Administrateur';

  const resetForm = () => {
    setNom('');
    setPrenom('');
    setSexe('M');
    setDateNaissance('');
    setProfession('');
    setTelephone('');
    setAdresse('');
    setGroupeSanguin('Inconnu');
    setAllergiesText('');
    setAntecedentsText('');
    setChroniquesText('');
    setEditingPatient(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setNom(p.nom);
    setPrenom(p.prenom);
    setSexe(p.sexe);
    setDateNaissance(p.dateNaissance);
    setProfession(p.profession);
    setTelephone(p.telephone);
    setAdresse(p.adresse);
    setGroupeSanguin(p.groupeSanguin);
    setAllergiesText(p.allergies.join(', '));
    setAntecedentsText(p.antecedentsMedicaux.join(', '));
    setChroniquesText(p.maladiesChroniques.join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !prenom) return;

    const payload = {
      nom,
      prenom,
      sexe,
      dateNaissance,
      profession,
      telephone,
      adresse,
      groupeSanguin,
      allergies: allergiesText ? allergiesText.split(',').map(s => s.trim()) : [],
      antecedentsMedicaux: antecedentsText ? antecedentsText.split(',').map(s => s.trim()) : [],
      maladiesChroniques: chroniquesText ? chroniquesText.split(',').map(s => s.trim()) : []
    };

    if (editingPatient) {
      await onUpdatePatient(editingPatient.id, payload);
    } else {
      await onAddPatient(payload);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleToggleActiveState = async (p: Patient) => {
    if (!canUpdate) return;
    await onUpdatePatient(p.id, { isActive: !p.isActive });
  };

  // Filter list
  const filteredPatients = patients.filter(p => {
    const term = searchQuery.toLowerCase();
    return (
      p.nom.toLowerCase().includes(term) ||
      p.prenom.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.telephone.includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-natural-border pb-5">
        <div>
          <h2 className="text-xl font-serif font-bold text-natural-primary tracking-tight">Fichier Civil des Patients</h2>
          <p className="text-xs text-gray-505">Enregistrement et archivage administratif permanent</p>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {canCreate && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 bg-natural-primary hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Enregistrer Patient
            </button>
          )}
        </div>
      </div>

      {/* Searching HUD */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par identifiant, nom, prénom ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-natural-border pl-10 pr-4 py-2.5 rounded-xl outline-hidden focus:ring-2 focus:ring-natural-primary/25 focus:border-natural-primary font-medium"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-natural-card border border-natural-border rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-natural-secondary border-b border-natural-border flex items-center justify-between">
          <span className="text-[11px] text-natural-primary font-bold uppercase tracking-wider font-mono">Dossiers administratifs ({filteredPatients.length})</span>
          <button className="flex items-center gap-1 text-[10px] bg-white border border-natural-border text-gray-600 font-bold px-2 py-1 rounded-lg shadow-xs hover:bg-natural-hover">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Exporter CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-55 text-gray-400 font-bold uppercase tracking-wider font-mono border-b border-gray-100">
                <th className="p-4 w-28">Identifiant</th>
                <th className="p-4">Identité Civile</th>
                <th className="p-4">Sexe / Âge</th>
                <th className="p-4">Liaisons</th>
                <th className="p-4">Données Médicales</th>
                <th className="p-4 w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-450 italic">
                    Aucun dossier patient dans la base de données locale
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50/50 ${!p.isActive ? 'bg-gray-50/70 opacity-75' : ''}`}>
                    <td className="p-4 font-mono font-bold text-gray-900 group-hover:text-sky-600">
                      {p.id}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800 text-[13px]">{p.nom} {p.prenom}</div>
                      <div className="text-[10px] text-gray-400">{p.profession || "Profession non spécifiée"}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full mr-2 ${
                        p.sexe === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {p.sexe}
                      </span>
                      <span className="text-gray-500">{new Date().getFullYear() - new Date(p.dateNaissance).getFullYear()} ans</span>
                    </td>
                    <td className="p-4 space-y-1 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{p.telephone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate max-w-[150px]">{p.adresse}</span>
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-rose-50 text-rose-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded-sm border border-rose-100">
                          GS: {p.groupeSanguin}
                        </span>
                        {p.maladiesChroniques.length > 0 && (
                          <span className="bg-amber-50 text-amber-800 font-bold text-[9px] px-1.5 py-0.5 rounded-sm" title={p.maladiesChroniques.join(', ')}>
                            Maladie Chronique
                          </span>
                        )}
                      </div>
                      {p.allergies.length > 0 && (
                        <div className="text-[10px] text-rose-500 truncate max-w-[150px]">
                          Allergies: {p.allergies.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {canUpdate && (
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 p-1.5 rounded-lg shadow-xs cursor-pointer"
                            title="Modifier Fiche"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canUpdate ? (
                          <button
                            onClick={() => handleToggleActiveState(p)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold shadow-xs cursor-pointer ${
                              p.isActive 
                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={p.isActive ? "Désactiver dossier / Archiver" : "Réactiver dossier"}
                          >
                            {p.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Lecteur Seul</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Modular Register Drawer/Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingPatient ? `Modifier fiche : ${editingPatient.id}` : "Créer un Nouveau Dossier Patient"}
                </h3>
                <p className="text-xs text-slate-400">Saisie vérifiée sous protocole clinique saharien</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[550px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Nom de Famille *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="e.g. Traoré"
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-sky-550/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="e.g. Alou"
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-sky-550/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Genre / Sexe *</label>
                  <select
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value as 'M' | 'F')}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Date de Naissance *</label>
                  <input
                    type="date"
                    required
                    value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Téléphone *</label>
                  <input
                    type="text"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="e.g. +223 76 54 3210"
                    className="w-full text-xs border border-gray-200 rounded-lg p-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Commerçant, Enregistreur"
                    className="w-full text-xs border border-gray-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Adresse Domiciliaire *</label>
                <input
                  type="text"
                  required
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Quartier, Rue, Ville"
                  className="w-full text-xs border border-gray-200 rounded-lg p-2"
                />
              </div>

              {/* SECTION MEDICAL INFO */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <span className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase font-mono">Informations Cliniques Sommaires</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 block">Groupe Sanguin</label>
                    <select
                      value={groupeSanguin}
                      onChange={(e) => setGroupeSanguin(e.target.value as any)}
                      className="w-full text-xs bg-white border border-gray-250 rounded-lg p-2"
                    >
                      <option value="Inconnu">Inconnu / Non testé</option>
                      <option value="A+">A positif (A+)</option>
                      <option value="A-">A négatif (A-)</option>
                      <option value="B+">B positif (B+)</option>
                      <option value="B-">B négatif (B-)</option>
                      <option value="AB+">AB positif (AB+)</option>
                      <option value="AB-">AB négatif (AB-)</option>
                      <option value="O+">O positif (O+)</option>
                      <option value="O-">O négatif (O-)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 block">Allergies connues (Séparés par virgule)</label>
                    <input
                      type="text"
                      value={allergiesText}
                      onChange={(e) => setAllergiesText(e.target.value)}
                      placeholder="e.g. Pénicilline, Sulfamides"
                      className="w-full text-xs bg-white border border-gray-250 rounded-lg p-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 block">Antécédents Chirurgicaux/Médicaux</label>
                    <input
                      type="text"
                      value={antecedentsText}
                      onChange={(e) => setAntecedentsText(e.target.value)}
                      placeholder="e.g. Césarienne en 2022, Goutte"
                      className="w-full text-xs bg-white border border-gray-250 rounded-lg p-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 block">Maladies Chroniques Diagnostiquées</label>
                    <input
                      type="text"
                      value={chroniquesText}
                      onChange={(e) => setChroniquesText(e.target.value)}
                      placeholder="e.g. Diabète type 2, Asthme, HTA"
                      className="w-full text-xs bg-white border border-gray-250 rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Action Rows */}
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  {editingPatient ? "Appliquer Modifications" : "Créer le Dossier Administratif"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
