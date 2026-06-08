/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CourrierRecord, User } from '../types';
import { 
  Inbox, 
  Send, 
  Plus, 
  FileCheck2, 
  Hash, 
  Search, 
  Bookmark, 
  Bell, 
  Check,
  ClipboardList
} from 'lucide-react';

interface CourrierModuleProps {
  courriers: CourrierRecord[];
  currentUser: User;
  onAddCourrier: (courrier: any) => Promise<any>;
}

export default function CourrierModule({
  courriers,
  currentUser,
  onAddCourrier
}: CourrierModuleProps) {
  const [direction, setDirection] = useState<'Arrivant' | 'Départ'>('Arrivant');
  const [reference, setReference] = useState('');
  const [objet, setObjet] = useState('');
  const [nomCorrespondant, setNomCorrespondant] = useState('');
  const [serviceAttributaire, setServiceAttributaire] = useState('Direction Générale');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'Tous' | 'Arrivant' | 'Départ'>('Tous');

  const canManage = currentUser.permissions.includes('COURRIER.MANAGE') || currentUser.role === 'Super Administrateur';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference || !objet || !nomCorrespondant) return;

    await onAddCourrier({
      direction,
      reference,
      objet,
      nomCorrespondant,
      serviceAttributaire,
      date: new Date().toISOString().split('T')[0]
    });

    setReference('');
    setObjet('');
    setNomCorrespondant('');
  };

  const filteredCourriers = courriers.filter(c => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = c.objet.toLowerCase().includes(term) || c.nomCorrespondant.toLowerCase().includes(term) || c.reference.toLowerCase().includes(term);
    const matchesDir = filterDirection === 'Tous' || c.direction === filterDirection;
    return matchesSearch && matchesDir;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 md:p-6 text-left text-xs text-gray-750 font-sans">
      
      {/* COURIER ENCODER FORM COLUMN */}
      <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative h-fit">
        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b pb-2">
          LOGUER UN PLI / COURRIER INTRA
        </span>

        {!canManage && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center">
            <Hash className="w-10 h-10 text-amber-500 mb-2" />
            <h4 className="font-bold text-xs text-gray-950 font-sans">Accès Archivage Restreint</h4>
            <p className="text-[10px] text-gray-450">
              Requiert l'autorisation Secrétariat / Super Administrateur pour authentifier des plis postaux officiels.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-medium">
          <div className="space-y-1">
            <label className="font-bold block">Sens d'expédition *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('Arrivant')}
                className={`p-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                  direction === 'Arrivant' 
                    ? 'bg-sky-50 border-sky-400 text-sky-800' 
                    : 'bg-slate-50 text-slate-550'
                }`}
              >
                <Inbox className="w-4 h-4" /> Arrivant
              </button>
              <button
                type="button"
                onClick={() => setDirection('Départ')}
                className={`p-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                  direction === 'Départ' 
                    ? 'bg-amber-50 border-amber-300 text-amber-800' 
                    : 'bg-slate-50 text-slate-550'
                }`}
              >
                <Send className="w-4 h-4" /> Départ
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Référence Administrative Courrier *</label>
            <input
              type="text"
              required
              placeholder="e.g. R-M-2026-62"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full border rounded-lg p-2 font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Objet de la correspondance *</label>
            <input
              type="text"
              required
              placeholder="e.g. Accord de prise en charge clinique"
              value={objet}
              onChange={(e) => setObjet(e.target.value)}
              className="w-full border rounded-lg p-2 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Correspondant / Organisme Expéditeur ou Destinataire *</label>
            <input
              type="text"
              required
              placeholder="e.g. Direction générale INPS"
              value={nomCorrespondant}
              onChange={(e) => setNomCorrespondant(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Service Hospitalier Attributaire</label>
            <select
              value={serviceAttributaire}
              onChange={(e) => setServiceAttributaire(e.target.value)}
              className="w-full border rounded p-2 bg-white"
            >
              <option value="Direction Générale">Direction Générale</option>
              <option value="Direction Scientifique">Direction Scientifique</option>
              <option value="Comptabilité & Caisse">Comptabilité & Caisse</option>
              <option value="Achats & Logistique">Achats & Logistique</option>
              <option value="Ressources Humaines">Ressources Humaines</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold p-2.5 rounded-lg cursor-pointer font-semibold uppercase tracking-wider"
          >
            Enregistrer le Courrier
          </button>
        </form>
      </div>

      {/* COURIER TABLE COLUMN */}
      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-4 gap-3">
          <div>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
              REGISTRE INTRANET DU COUURRIER ({filteredCourriers.length} PLIS)
            </span>
            <p className="text-gray-400 text-[11px] mt-0.5">Index chronologique des plis certifiés de l'institut</p>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value as any)}
              className="bg-slate-50 border border-gray-200 rounded p-1 text-[11px] outline-hidden font-bold"
            >
              <option value="Tous">Tous</option>
              <option value="Arrivant">Arrivants</option>
              <option value="Départ">Sortants</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-55 border border-gray-200 pl-7 pr-3 py-1 rounded text-[11px] outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3.5 max-h-[500px] overflow-y-auto">
          {filteredCourriers.map((c) => {
            const isArr = c.direction === 'Arrivant';
            return (
              <div 
                key={c.id} 
                className={`p-3.5 border rounded-xl flex items-center justify-between gap-4 transition-colors hover:border-slate-350 ${
                  isArr ? 'bg-sky-50/15 border-sky-100' : 'bg-amber-50/10 border-amber-100'
                }`}
              >
                <div className="space-y-1 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`p-0.5 px-2 font-mono text-[9px] font-extrabold rounded-full ${
                      isArr ? 'bg-sky-100 text-sky-850' : 'bg-amber-100 text-amber-850'
                    }`}>
                      {c.direction.toUpperCase()}
                    </span>
                    <span className="font-mono text-gray-400 text-[10px] tracking-wide">Ref : {c.reference}</span>
                  </div>

                  <h3 className="text-gray-900 font-bold text-xs tracking-tight">{c.objet}</h3>
                  <p className="text-gray-500">{isArr ? 'De' : 'Pour'} : <strong className="font-semibold text-gray-750">{c.nomCorrespondant}</strong></p>
                  
                  <div className="flex items-center gap-2 pt-0.5 text-[10px] text-gray-400 font-semibold font-mono">
                    <span>Attribué : {c.serviceAttributaire}</span>
                    <span>•</span>
                    <span>Reçu le : {c.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-450 block font-mono font-bold leading-none">{c.id}</span>
                  <span className="inline-flex mt-1.5 items-center bg-gray-50 text-gray-600 border px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono">
                    <Check className="w-3 h-3 mr-0.5 text-sky-600" /> Classifié
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
