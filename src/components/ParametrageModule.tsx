/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClinicSettings, User } from '../types';
import { 
  Settings, 
  Save, 
  HelpCircle, 
  Sliders, 
  Database, 
  Globe, 
  ShieldAlert, 
  Activity, 
  RefreshCw,
  FileCheck2,
  HardDriveUpload
} from 'lucide-react';

interface ParametrageModuleProps {
  settings: ClinicSettings;
  currentUser: User;
  onUpdateSettings: (settingsUpdates: any) => Promise<any>;
}

export default function ParametrageModule({
  settings,
  currentUser,
  onUpdateSettings
}: ParametrageModuleProps) {
  const [nomClinique, setNomClinique] = useState(settings.nomClinique);
  const [adresse, setAdresse] = useState(settings.adresse);
  const [telephone, setTelephone] = useState(settings.telephone);
  const [email, setEmail] = useState(settings.email);
  const [siteWeb, setSiteWeb] = useState(settings.siteWeb);
  const [cachetText, setCachetText] = useState(settings.cachetText || '');
  const [devise, setDevise] = useState(settings.devise);
  const [langue, setLangue] = useState(settings.langue);

  const [savingStatus, setSavingStatus] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string>('');

  const canManage = currentUser.role === 'Super Administrateur';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStatus(true);
    
    await onUpdateSettings({
      nomClinique,
      adresse,
      telephone,
      email,
      siteWeb,
      cachetText,
      devise,
      langue
    });

    setSavingStatus(false);
  };

  const handleBackup = async () => {
    setBackupStatus('Sauvegarde locale en cours...');
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const data = await res.json();
      setBackupStatus(`Sauvegarde exécutée avec succès — Nom archive : ${data.archiveName}`);
    } catch {
      setBackupStatus('Erreur lors du raccordement au script de sauvegarde.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 md:p-6 text-left text-xs text-gray-755 font-sans">
      
      {/* LEFT COLUMN: CORE CLINIC SETTINGS FORM */}
      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative">
        <span className="block text:[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b pb-2">
          CONFIGURATION GENERALE DE L'ÉTABLISSEMENT
        </span>

        {!canManage && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-15 flex flex-col items-center justify-center p-6 text-center">
            <ShieldAlert className="w-10 h-10 text-amber-500 mb-2" />
            <h4 className="font-bold text-xs text-gray-950 font-sans">Supervision Administrateur Obligatoire</h4>
            <p className="text-[10px] text-gray-450 max-w-xs">
              Seul le <strong className="font-semibold">Super Administrateur (M. Ousmane Diallo)</strong> est habilité à modifier l'identité légale de cet établissement hospitalier ou d'initier des sauvegardes SQL d'Archives.
            </p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 font-medium">
          
          <div className="space-y-1">
            <label className="font-bold block">Nom de la Formation Sanitaire / Clinique *</label>
            <input
              type="text"
              required
              value={nomClinique}
              onChange={(e) => setNomClinique(e.target.value)}
              className="w-full border rounded-lg p-2.5 font-bold text-gray-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Adresse Postale Réelle d'Installation *</label>
            <input
              type="text"
              required
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">Téléphone Local Réception *</label>
              <input
                type="text"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Courriel de Liaison Institutionnel *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold block">Adresse Web Intranet</label>
              <input
                type="text"
                value={ siteWeb }
                onChange={(e) => setSiteWeb(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold block">Devise par défaut</label>
              <select
                value={devise}
                onChange={(e) => setDevise(e.target.value)}
                className="w-full border rounded-lg p-2.5 bg-white font-bold"
              >
                <option value="FCFA">Franc CFA (XOF / Sahel Zone FCFA)</option>
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar Américain ($)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold block">Sceau & Cachet Institutionnel de Signature des Certificats *</label>
            <input
              type="text"
              required
              value={cachetText}
              onChange={(e) => setCachetText(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-gray-700 italic font-mono"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 font-bold text-white p-2.5 px-5 rounded-lg cursor-pointer"
            >
              <Save className="w-4 h-4" /> {savingStatus ? 'Sauvegarde...' : 'Appliquer Nouvelles Configurations'}
            </button>
          </div>

        </form>
      </div>

      {/* RIGHT COLUMN: INFRA BACKUP UTILITIES */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border rounded-2xl p-5 shadow-xs relative">
          <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b pb-2">
            RACCORDEMENTS DE SECURITÉ SQL
          </span>

          {!canManage && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-10" />
          )}

          <div className="space-y-4">
            <p className="text-gray-500 leading-snug">
              Émettez de nouvelles archives de sauvegarde compression in-situ (.tar.gz) synchronisées avec votre base PostgreSQL locale. Les serveurs hors-ligne de l'établissement stockent ces copies dans le compartiment de stockage crypté du serveur principal.
            </p>

            <button
              onClick={handleBackup}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-900 text-white font-bold p-3 rounded-xl cursor-pointer hover:bg-slate-800"
            >
              <Database className="w-4 h-4 text-emerald-500 animate-pulse" /> Lancer Backup Local 1-Click
            </button>

            {backupStatus && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-lg font-mono text-[10px] leading-relaxed">
                {backupStatus}
              </div>
            )}
          </div>
        </div>

        {/* SYSTEM INTRANET LOCAL NETWORK ACCESSIBILITY MARKERS */}
        <div className="bg-slate-50 border p-5 rounded-2xl space-y-3">
          <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider font-mono">Détails d'accessibilité Intranet</span>
          
          <div className="space-y-1.5 text-slate-650 leading-tight">
            <p>● Serveur Intranet local en <strong>0.0.0.0:3000</strong></p>
            <p>● Postgres localisé sur port <strong>5432 (Actif)</strong></p>
            <p>● Les clients connectés par Wifi local utilisent l'URL de redirection locale : <strong>{settings.siteWeb || "intranet.medisahel.local"}</strong></p>
          </div>
        </div>
      </div>

    </div>
  );
}
