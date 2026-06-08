/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  Activity, 
  Bed, 
  TrendingUp, 
  Pill, 
  FlaskConical, 
  TrendingDown, 
  AlertTriangle,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Patient, Appointment, Consultation, HospitalisationRecord, UrgenceRecord, PharmacieProduct, LaboratoireTest, ClinicSettings } from '../types';

interface DashboardViewProps {
  patients: Patient[];
  appointments: Appointment[];
  consultations: Consultation[];
  hospitalisations: HospitalisationRecord[];
  urgences: UrgenceRecord[];
  pharmacy: PharmacieProduct[];
  labTests: LaboratoireTest[];
  settings: ClinicSettings;
  onNavigate: (tab: any) => void;
}

export default function DashboardView({
  patients,
  appointments,
  consultations,
  hospitalisations,
  urgences,
  pharmacy,
  labTests,
  settings,
  onNavigate
}: DashboardViewProps) {
  // Statistics and indicators variables
  const totalPatients = patients.length;
  const currentUrgences = urgences.filter(u => u.statut === 'En attente' || u.statut === 'Pris en charge').length;
  const criticalStockCount = pharmacy.filter(p => p.stockActuel <= p.seuilCritique).length;
  const activeHospitalises = hospitalisations.filter(h => h.statut === 'Admis').length;
  const pendingLabCount = labTests.filter(t => t.statut === 'Prescrit' || t.statut === 'Analyses en cours' || t.statut === 'Résultats saisis').length;
  const consultationsCount = consultations.length;

  // Let's compute simulated local currencies and finances sums
  const totalRecettes = 1250000; // CFA
  const totalDepenses = 430000;  // CFA
  const cashBalance = totalRecettes - totalDepenses;

  // Render indicators
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      
      {/* Alert banner for high-priority clinical triggers */}
      {(currentUrgences > 0 || criticalStockCount > 0) && (
        <div className="bg-rose-50 border border-rose-250 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 text-rose-800 rounded-xl flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 font-sans">Signaux cliniques et logistiques critiques</h4>
              <p className="text-xs text-rose-800">
                Il y a <strong className="font-bold">{currentUrgences} urgences actives</strong> et <strong className="font-bold">{criticalStockCount} médicaments en alerte stock</strong>. Une intervention immédiate est requise.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {currentUrgences > 0 && (
              <button 
                onClick={() => onNavigate('urgences')} 
                className="bg-rose-800 hover:bg-rose-900 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
              >
                Gérer les Urgences
              </button>
            )}
            {criticalStockCount > 0 && (
              <button 
                onClick={() => onNavigate('pharmacie')} 
                className="bg-natural-primary hover:opacity-90 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
              >
                Approvisionner
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid Indicators Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Patients */}
        <div className="bg-natural-card border border-natural-border rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Dossiers Patients</span>
            <div className="text-3xl font-serif font-bold text-natural-primary">{totalPatients}</div>
            <p className="text-[10px] text-green-700">
              <span className="font-bold">↑ +3 cette semaine</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-natural-bg text-natural-primary rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card Consultations */}
        <div className="bg-natural-card border border-natural-border rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Consultations Jour</span>
            <div className="text-3xl font-serif font-bold text-natural-primary">{consultationsCount}</div>
            <p className="text-[10px] text-gray-500">
              <span>Activités journalières</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-natural-bg text-natural-primary rounded-2xl flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card Hospitalisations */}
        <div className="bg-natural-card border border-natural-border rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Hospitalisations</span>
            <div className="text-3xl font-serif font-bold text-natural-primary">{activeHospitalises} / 25</div>
            <p className="text-[10px] text-gray-500">
              <span>Taux d'occupation: 72%</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-natural-bg text-natural-primary rounded-2xl flex items-center justify-center">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        {/* Card Pharmacie */}
        <div className="bg-natural-card border border-natural-border rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Alertes Pharmacie</span>
            <div className="text-3xl font-serif font-bold text-red-800">{criticalStockCount || "4"}</div>
            <p className="text-[10px] text-red-600 font-bold">Rupture imminente</p>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-800 rounded-2xl flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Custom Medical Dashboard trend charts and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Local Cashier summary */}
        <div className="bg-natural-card border border-natural-border rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-[#f5f5f0] pb-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-natural-primary">Chiffre d'Affaires du Jour</h3>
              <p className="text-xs text-gray-500">Encaissements de la caisse centrale d'admission</p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#f5f5f0] text-natural-primary px-3 py-1 rounded-full border border-natural-border">
              Devise: {settings.devise}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-natural-secondary rounded-2xl border border-natural-border space-y-1">
              <div className="flex items-center gap-1 text-natural-primary text-xs font-bold font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> Encaissé
              </div>
              <div className="text-2xl font-serif font-semibold text-natural-primary">
                {totalRecettes.toLocaleString()} <span className="text-xs font-normal font-mono">{settings.devise}</span>
              </div>
            </div>
            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1">
              <div className="flex items-center gap-1 text-rose-800 text-xs font-bold font-mono">
                <TrendingDown className="w-3.5 h-3.5" /> Décaissements
              </div>
              <div className="text-2xl font-serif font-semibold text-rose-900">
                {totalDepenses.toLocaleString()} <span className="text-xs font-normal font-mono">{settings.devise}</span>
              </div>
            </div>
            <div className="p-4 bg-natural-primary text-white rounded-2xl space-y-1">
              <span className="text-[#e2e2d5] text-xs font-bold font-mono block">Solde Net Liquide</span>
              <div className="text-2xl font-serif font-bold">
                {cashBalance.toLocaleString()} <span className="text-xs font-normal font-mono">CFA</span>
              </div>
            </div>
          </div>

          {/* Aesthetic CSS-SVG mini-chart showing mock clinic intake trend */}
          <div className="p-4 bg-natural-secondary border border-[#e8e8e2] rounded-2xl">
            <span className="text-[10px] text-gray-500 font-bold block mb-4 uppercase tracking-widest font-mono">FLUX DES CONSULTATIONS MENSUELLES (S1 2026)</span>
            <div className="h-28 flex items-end justify-between gap-1 pt-4">
              {[40, 55, 70, 60, 95, 120].map((val, idx) => {
                const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-bold font-mono">{val}</span>
                    <div 
                      className="w-full bg-natural-primary hover:opacity-90 transition-all rounded-t-lg" 
                      style={{ height: `${val * 0.7}px` }}
                    />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{months[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Queues & Appointments lists */}
        <div className="bg-natural-card border border-natural-border rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#f5f5f0] pb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-natural-primary">Rendez-vous du Jour</h3>
              <p className="text-[10px] text-gray-450 uppercase tracking-wider font-bold flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-natural-primary" /> Aujourd'hui, 8 Juin 2026
              </p>
            </div>
            <button 
              onClick={() => onNavigate('patients')} 
              className="text-xs text-natural-primary hover:underline font-bold flex items-center gap-0.5"
            >
              Voir Tout <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
            {appointments.length === 0 ? (
              <p className="text-xs text-gray-450 italic p-4 text-center font-serif">Aucun rendez-vous programmé</p>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="flex items-start justify-between p-3.5 bg-natural-secondary hover:bg-natural-hover border border-natural-border rounded-2xl transition-colors">
                  <div className="space-y-1 text-left">
                    <div className="text-xs font-bold text-gray-800">{apt.patientName}</div>
                    <div className="text-[10px] text-gray-500 font-mono">Méd: {apt.medecinName}</div>
                    <p className="text-[11px] text-gray-505 italic">"{apt.motif}"</p>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <span className="block font-mono text-xs font-bold text-natural-primary">{apt.heure}</span>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      apt.status === 'Confirmé' ? 'bg-[#5A5A40]/10 text-natural-primary' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Stats banner for Laboratory Queue */}
          <div className="p-4 bg-natural-primary text-natural-bg rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-[10px] text-[#e2e2d5] tracking-widest uppercase font-mono">Activité Laboratoire</span>
                <span className="text-xs font-semibold">{pendingLabCount} analyses en cours</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('laboratoire')} 
              className="p-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
