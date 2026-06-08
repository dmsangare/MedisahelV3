/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuditLog, User } from '../types';
import { 
  ShieldAlert, 
  Search, 
  Terminal, 
  Clock, 
  RefreshCw, 
  Activity, 
  Cpu, 
  HardDrive,
  CheckCircle2,
  ListFilter,
  Monitor
} from 'lucide-react';

interface AuditModuleProps {
  auditLogs: AuditLog[];
  currentUser: User;
}

export default function AuditModule({
  auditLogs,
  currentUser
}: AuditModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('Tous');

  // Server performance metrics (simulated, fetching from supervision endpoints)
  const [specs, setSpecs] = useState({
    cpuUsage: 18,
    ramUsage: 3.4,
    ramTotal: 16.0,
    diskUsage: 122,
    diskTotal: 500,
    postgresStatus: "En ligne (port 5432)",
    dockerStatus: "Actif (6 conteneurs)",
    simulatedUsersOnline: 4
  });

  const fetchSupervision = async () => {
    try {
      const res = await fetch('/api/supervision');
      const data = await res.json();
      if (data) setSpecs(data);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    fetchSupervision();
    const interval = setInterval(fetchSupervision, 10000);
    return () => clearInterval(interval);
  }, []);

  const canRead = currentUser.permissions.includes('AUDIT.READ') || currentUser.role === 'Super Administrateur';

  const filteredLogs = auditLogs.filter(log => {
    const term = searchQuery.toLowerCase();
    const matchesQuery = 
      log.action.toLowerCase().includes(term) || 
      log.utilisateur.toLowerCase().includes(term) || 
      log.description.toLowerCase().includes(term);

    const matchesModule = filterModule === 'Tous' || log.module === filterModule;

    return matchesQuery && matchesModule;
  });

  // Extract unique modules
  const modulesSet = new Set<string>();
  auditLogs.forEach(l => {
    if (l.module) modulesSet.add(l.module);
  });
  const modulesList = Array.from(modulesSet);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left text-xs font-sans">
      
      {/* SECTION 1: SUPERVISION GRAPH GAUGES AND SPECS METERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Postgres & SQL Server State */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col justify-between border border-slate-800 shadow-sm min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-450 uppercase tracking-wider font-mono">SERVEUR RELATIONAL SQL</span>
            <span className="block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div>
            <h4 className="text-sm font-bold mt-2 font-mono">PostgreSQL Database</h4>
            <span className="inline-block mt-1 text-[11px] bg-slate-800 text-slate-350 px-2.5 py-0.5 rounded-md border border-slate-700">
              {specs.postgresStatus}
            </span>
          </div>
        </div>

        {/* Server Physical CPU Usage */}
        <div className="bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-xs min-h-[110px]">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] uppercase tracking-wider font-mono">CHARGE CPU DU SERVEUR</span>
            <Cpu className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-black font-mono text-gray-800">{specs.cpuUsage}%</span>
              <span className="text-[10px] text-gray-400 font-mono">HP ProLiant</span>
            </div>
            {/* ProgressBar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-sky-500 h-full transition-all duration-500" style={{ width: `${specs.cpuUsage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Server Memory RAM Meter */}
        <div className="bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-xs min-h-[110px]">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] uppercase tracking-wider font-mono">UTILISATION MEMOIRE RAM</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-black font-mono text-gray-800">{specs.ramUsage} GB</span>
              <span className="text-[10px] text-gray-400 font-mono">/ {specs.ramTotal} GB dispos</span>
            </div>
            {/* ProgressBar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(specs.ramUsage / specs.ramTotal) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Server Disk Volumes info */}
        <div className="bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-xs min-h-[110px]">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] uppercase tracking-wider font-mono">STOCKAGE DISQUE DISPO (INTRA)</span>
            <HardDrive className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-black font-mono text-gray-800">{(specs.diskTotal - specs.diskUsage)} GB libres</span>
              <span className="text-[10px] text-gray-400 font-mono">/ {specs.diskTotal} GB</span>
            </div>
            {/* ProgressBar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${(specs.diskUsage / specs.diskTotal) * 100}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: MASTER AUDIT TRAIL LOGS */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative">
        <span className="block text:[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b pb-2">
          JOURNAL D'AUDIT ET DE PARCOURS CLINIQUE (TRACEABILITÉ COMPLETE)
        </span>

        {!canRead && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-15 flex flex-col items-center justify-center p-6 text-center">
            <ShieldAlert className="w-10 h-10 text-amber-500 mb-2" />
            <h4 className="font-bold text-xs text-gray-950 font-sans">Accès Journal d'Audit Verrouillé</h4>
            <p className="text-[10px] text-gray-450 max-w-sm">
              La consultation du journal d'audit en continu requiert le rôle <strong className="font-semibold">Super Administrateur (Ousmane Diallo)</strong> pour garantir la clause absolue de confidentialité.
            </p>
          </div>
        )}

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="font-bold text-gray-550">Module :</label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="bg-white border border-gray-200 rounded p-1 text-[11px] font-bold outline-hidden cursor-pointer"
            >
              <option value="Tous">Tous les modules</option>
              {modulesList.map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Chercher par action, auteur, ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-8 pr-3 py-1 rounded text-[11px] outline-hidden focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Chronological events list */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-[11px] italic text-gray-400 text-center py-12">Aucun log correspondant aux filtres actifs</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-3.5 bg-slate-50 border rounded-xl flex items-start gap-3 transition-colors hover:border-gray-300">
                <Terminal className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                
                <div className="flex-1 text-left space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-gray-400 text-[9px] font-extrabold">{log.id}</span>
                    <span className="p-0.5 px-2 bg-slate-200 border rounded font-mono font-bold text-[9px] text-gray-600 uppercase">
                      {log.module}
                    </span>
                    <span className="text-[10px] text-sky-800 font-extrabold font-mono">{log.action}</span>
                    <span className="text-gray-400 text-[10px] font-mono flex items-center gap-0.5 font-semibold">
                      <Clock className="w-3.5 h-3.5" /> {log.date} — {log.heure} GMT
                    </span>
                  </div>

                  <p className="text-xs text-gray-900 leading-relaxed font-medium">
                    {log.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[10px] text-gray-400 font-mono font-bold">
                    <span>Opérateur: <strong className="font-semibold text-gray-700">{log.utilisateur}</strong></span>
                    <span>•</span>
                    <span>IP Client: {log.adresseIp}</span>
                    <span>•</span>
                    <span>Device: {log.posteUtilise}</span>
                  </div>

                  {log.ancienneValeur && (
                    <details className="mt-2 text-[10px] bg-white border rounded p-1.5">
                      <summary className="cursor-pointer font-bold font-mono text-gray-500 select-none">Variations de données (JSON)</summary>
                      <div className="grid grid-cols-2 gap-2 mt-1.5 font-mono bg-slate-50 p-2 rounded border divide-x divide-gray-200 text-gray-700 overflow-x-auto">
                        <div>
                          <span className="block text-[8px] font-bold text-rose-700 uppercase mb-1">Ancienne Valeur</span>
                          <pre>{JSON.stringify(JSON.parse(log.ancienneValeur), null, 2)}</pre>
                        </div>
                        <div className="pl-2">
                          <span className="block text-[8px] font-bold text-emerald-700 uppercase mb-1">Nouvelle Valeur</span>
                          <pre>{JSON.stringify(JSON.parse(log.nouvelleValeur), null, 2)}</pre>
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
