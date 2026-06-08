/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Permission } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  FolderHeart, 
  ClipboardList, 
  Bed, 
  AlertOctagon, 
  FlaskConical, 
  Scan, 
  Pill, 
  CheckSquare, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  UserCheck, 
  Truck, 
  Mail, 
  Settings, 
  History,
  Lock,
  Calendar,
  Shield,
  Layers,
  BarChart3,
  MailCheck
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'patients' 
  | 'dme' 
  | 'rendezvous'
  | 'consultation' 
  | 'hospitalisation' 
  | 'urgences' 
  | 'laboratoire' 
  | 'imagerie' 
  | 'pharmacie' 
  | 'facturaton' // facturation & caisse
  | 'comptabilite' 
  | 'rh' 
  | 'assurances'
  | 'logistique' // achats & fournisseurs
  | 'inventaire'
  | 'courrier' // courrier & ged
  | 'emails-groupes'
  | 'rapports'
  | 'parametrage' 
  | 'audit';

interface SidebarProps {
  currentUser: User;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function Sidebar({ currentUser, activeTab, onTabChange }: SidebarProps) {
  // Navigation mapping associating Tabs to Required Permissions & Icons
  const navigationItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, permission: null },
    { id: 'patients', label: 'Patients', icon: Users, permission: 'PATIENT.READ' },
    { id: 'dme', label: 'Dossier Médical (DME)', icon: FolderHeart, permission: 'DME.READ' },
    { id: 'rendezvous', label: 'Rendez-vous', icon: Calendar, permission: null },
    { id: 'consultation', label: 'Consultations', icon: ClipboardList, permission: 'CONSULTATION.READ' },
    { id: 'hospitalisation', label: 'Hospitalisations', icon: Bed, permission: 'HOSPITALISATION.MANAGE' },
    { id: 'urgences', label: 'Urgences', icon: AlertOctagon, permission: 'URGENCES.MANAGE' },
    { id: 'laboratoire', label: 'Laboratoire', icon: FlaskConical, permission: 'LABORATOIRE.READ' },
    { id: 'imagerie', label: 'Imagerie Médicale', icon: Scan, permission: 'IMAGERIE.READ' },
    { id: 'pharmacie', label: 'Pharmacie', icon: Pill, permission: 'PHARMACIE.READ' },
    { id: 'facturaton', label: 'Facturation & Caisse', icon: Receipt, permission: 'FACTURE.READ' },
    { id: 'comptabilite', label: 'Comptabilité', icon: TrendingUp, permission: 'COMPTABILITE.READ' },
    { id: 'rh', label: 'Ressources Humaines', icon: UserCheck, permission: 'RH.MANAGE' },
    { id: 'assurances', label: 'Assurances', icon: Shield, permission: null },
    { id: 'logistique', label: 'Achats & Fournisseurs', icon: Truck, permission: 'ACHATS.MANAGE' },
    { id: 'inventaire', label: 'Inventaire', icon: Layers, permission: 'INVENTAIRE.MANAGE' },
    { id: 'courrier', label: 'Courrier & GED', icon: Mail, permission: 'COURRIER.MANAGE' },
    { id: 'emails-groupes', label: 'Emails Groupés', icon: MailCheck, permission: null },
    { id: 'rapports', label: 'Rapports', icon: BarChart3, permission: null },
    { id: 'parametrage', label: 'Paramétrage', icon: Settings, permission: 'TARIFICATION.MANAGE' },
    { id: 'audit', label: 'Audit & Traçabilité', icon: History, permission: 'AUDIT.READ' },
  ];

  const hasPerm = (perm: string | null) => {
    if (!perm) return true;
    return currentUser.permissions.includes(perm as Permission);
  };

  return (
    <aside className="w-64 bg-natural-card text-gray-750 flex flex-col shrink-0 min-h-[calc(100vh-112px)] border-r border-natural-border transition-all">
      {/* Scope Module navigation header */}
      <div className="p-4 bg-natural-secondary border-b border-natural-border">
        <span className="text-[10px] text-natural-primary font-bold uppercase tracking-wider font-mono">
          Espace Clinique • Modules SIH
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[800px]">
        {navigationItems.map((item) => {
          const authorized = hasPerm(item.permission);
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => authorized && onTabChange(item.id as NavTab)}
              disabled={!authorized && currentUser.role !== 'Super Administrateur'} // Let super admins override is possible or preserve lock
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                !authorized 
                  ? 'opacity-40 bg-transparent text-gray-400 cursor-not-allowed hover:bg-natural-secondary/30' 
                  : isActive 
                    ? 'bg-natural-bg text-natural-primary font-bold shadow-xs' 
                    : 'text-gray-600 hover:bg-natural-hover hover:text-natural-primary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${
                  isActive ? 'bg-natural-primary scale-120' : 'bg-transparent border border-gray-400'
                }`} />
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-natural-primary' : authorized ? 'text-gray-500' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              
              {!authorized && (
                <span className="p-0.5 bg-gray-100 text-gray-400 rounded border border-gray-200" title="Accès contrôlé (Permissions RBAC insuffisantes)">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Details */}
      <div className="p-4 bg-natural-secondary border-t border-natural-border text-[10px] text-gray-500 font-mono space-y-1">
        <div className="font-bold text-natural-primary font-serif">MÉDISAHEL ENTERPRISE • V3.2</div>
        <div className="flex justify-between items-center leading-none text-gray-400">
          <span>Client: INTRANET-CLIENT</span>
          <span className="text-[#5A5A40] font-bold">● LOCAL</span>
        </div>
      </div>
    </aside>
  );
}
