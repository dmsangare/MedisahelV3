/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, ClinicSettings, InternalNotification } from '../types';
import { 
  Shield, 
  RefreshCw,
  Bell,
  Pill,
  FlaskConical,
  CircleDot,
  Info,
  CheckCheck
} from 'lucide-react';

interface HeaderProps {
  settings: ClinicSettings;
  users: User[];
  currentUser: User;
  onUserChange: (user: User) => void;
  onTriggerBackup: () => void;
  supervisionLiveState: any;
  notifications?: InternalNotification[];
  onReadNotification?: (id: string) => Promise<void>;
  onReadAllNotifications?: () => Promise<void>;
}

export default function Header({ 
  settings, 
  users, 
  currentUser, 
  onUserChange,
  onTriggerBackup,
  supervisionLiveState,
  notifications = [],
  onReadNotification,
  onReadAllNotifications
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter unread notifications
  const unreadCount = notifications.filter(n => !n.lu).length;

  const handleRead = async (id: string) => {
    if (onReadNotification) {
      await onReadNotification(id);
    }
  };

  const handleReadAll = async () => {
    if (onReadAllNotifications) {
      await onReadAllNotifications();
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return <RefreshCw className="w-3.5 h-3.5 text-slate-600" />;
      case 'MEDICAL':
        return <CircleDot className="w-3.5 h-3.5 text-rose-650" />;
      case 'PHARMACIE':
        return <Pill className="w-3.5 h-3.5 text-amber-600" />;
      case 'LABORATOIRE':
        return <FlaskConical className="w-3.5 h-3.5 text-indigo-650" />;
      case 'ADMINISTRATIVE':
        return <Info className="w-3.5 h-3.5 text-sky-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-gray-550" />;
    }
  };

  const getBgClass = (type: string) => {
    switch (type) {
      case 'MEDICAL': return 'bg-rose-50/70 border-rose-100 hover:bg-rose-50';
      case 'PHARMACIE': return 'bg-amber-50/70 border-amber-100 hover:bg-amber-50';
      case 'LABORATOIRE': return 'bg-indigo-50/70 border-indigo-100 hover:bg-indigo-50';
      case 'ADMINISTRATIVE': return 'bg-sky-50/70 border-sky-100 hover:bg-sky-50';
      default: return 'bg-slate-50/70 border-slate-150 hover:bg-slate-50';
    }
  };

  return (
    <header className="bg-white border-b border-natural-border shadow-xs sticky top-0 z-50 transition-all">
      {/* Simulation Banner - Standard Admin Simulator Control */}
      <div className="bg-[#4a4a33] text-natural-bg text-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#3e3e2b]">
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-[#5A5A40] text-[10px] text-white font-extrabold px-2.5 py-0.5 rounded-full tracking-wider animate-pulse font-mono">
            MODE SIMULATEUR SECOURS
          </span>
          <span className="text-[#e2e2d5]">Testez le système d'Information Hospitalier sous différentes identités (RBAC complet) :</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#3d3d2a] px-2 py-1 rounded-lg border border-[#303021]">
            <span className="text-[#c7c7b8] font-semibold text-[10px]">Utilisateur actif :</span>
            <select 
              value={currentUser.id}
              onChange={(e) => {
                const selected = users.find(u => u.id === e.target.value);
                if (selected) onUserChange(selected);
              }}
              className="bg-transparent text-white font-medium border-0 focus:ring-0 focus:outline-hidden text-xs cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.id} className="text-gray-900 bg-white">
                  {u.prenom} {u.nom} — [{u.role}]
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={onTriggerBackup}
            className="flex items-center gap-1 bg-amber-700 hover:bg-amber-600 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sauvegarde 1-Clic
          </button>
        </div>
      </div>

      {/* Main Branding Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-natural-primary text-white flex items-center justify-center font-serif font-black text-xl shadow-xs border-2 border-[#6f6f52]">
            {settings.nomClinique.substring(0, 1) || "M"}
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-natural-primary tracking-tight flex items-center gap-2">
              {settings.nomClinique}
              <span className="text-xs bg-[#f5f5f0] text-[#5A5A40] border border-natural-border font-bold px-2 py-0.5 rounded-md">V3 LOCAL</span>
            </h1>
            <p className="text-xs text-gray-500 tracking-wide font-mono">
              SIH Intranet Sahel • {settings.adresse.split(',')[1] || "Mali"} • GMT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          
          {/* CENTRE DE NOTIFICATIONS INTERNES */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-[#f5f5f0] hover:bg-neutral-100 text-[#5A5A40] rounded-xl cursor-pointer border border-[#dedeb2] transition-all flex items-center justify-center"
              title="Centre d'Alertes Hospitalières"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 border border-white text-[9px] font-bold text-white rounded-full flex items-center justify-center px-0.5 font-mono">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Container */}
            {showNotifications && (
              <div className="absolute right-0 mt-3.5 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 font-sans text-xs text-gray-700">
                <div className="flex items-center justify-between border-b pb-2 mb-2 font-bold text-gray-950">
                  <span className="font-serif text-[13px] tracking-tight text-[#5A5A40]">Alertes Directes</span>
                  {unreadCount > 0 ? (
                    <button 
                      onClick={async () => {
                        await handleReadAll();
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-[#5A5A40] hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" /> Tout marquer lu
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-normal">À jour</span>
                  )}
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 italic">Aucune alerte trouvée</div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={async () => {
                          if (!notif.lu) {
                            await handleRead(notif.id);
                          }
                        }}
                        className={`p-2 rounded-xl border leading-snug text-left transition-colors cursor-pointer relative ${getBgClass(notif.type)} ${
                          !notif.lu ? 'font-semibold border-l-4 border-l-red-550' : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[10px] font-bold text-gray-900 flex items-center gap-1.5 leading-tight">
                            {getAlertIcon(notif.type)}
                            {notif.titre}
                          </span>
                          {!notif.lu && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-650 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[10.5px] text-gray-600 mt-1 leading-snug">{notif.description}</p>
                        <div className="flex justify-between items-center mt-1.5 text-[9px] text-gray-400 font-mono">
                          <span className="font-bold tracking-wide uppercase">{notif.type}</span>
                          <span>{notif.heure} • {notif.date.substring(5)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Profile ID HUD */}
          <div className="flex items-center gap-3 bg-[#f5f5f0] border border-[#e8e8e2] px-4 py-2 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-white text-[#5A5A40] font-bold text-sm flex items-center justify-center border border-[#e8e8e2]">
              {currentUser.prenom[0]}{currentUser.nom[0]}
            </div>
            <div className="text-left">
              <span className="block text-xs font-semibold text-gray-850 leading-3">
                {currentUser.prenom} {currentUser.nom}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-[#5A5A40] font-bold uppercase mt-1 font-mono">
                <Shield className="w-3 h-3" />
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Quick Stats Pillar */}
          <div className="hidden lg:flex flex-col text-right">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">État Serveur</div>
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
              <span className="font-mono text-[11px] font-bold text-gray-700">ONLINE</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono">CPU: {supervisionLiveState?.cpuUsage || 18}% | HMR SAFE</div>
          </div>
        </div>
      </div>
    </header>
  );
}
