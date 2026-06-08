/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Appointment, Patient, User } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User as UserIcon, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  X, 
  UserCheck, 
  FileText, 
  Play, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  RefreshCw,
  Phone,
  Briefcase
} from 'lucide-react';

interface RendezvousModuleProps {
  appointments: Appointment[];
  patients: Patient[];
  employees: User[];
  currentUser: User;
  onAddAppointment: (appointment: any) => Promise<void>;
  onUpdateAppointment: (id: string, updatedData: any) => Promise<void>;
  onNavigateToTab: (tab: any, patientId?: string) => void;
}

export default function RendezvousModule({
  appointments,
  patients,
  employees,
  currentUser,
  onAddAppointment,
  onUpdateAppointment,
  onNavigateToTab
}: RendezvousModuleProps) {
  // Current active date context - Default to 2026-06-08 (Our clinic local timeline match)
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-06-08'));
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month' | 'agenda' | 'doctor'>('week');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDossier, setSearchDossier] = useState('');
  const [searchMedecin, setSearchMedecin] = useState('');
  const [searchService, setSearchService] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<Appointment | null>(null);
  
  // Create / Edit Form State
  const [newPatientId, setNewPatientId] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newMedecinId, setNewMedecinId] = useState('');
  const [newMedecinName, setNewMedecinName] = useState('');
  const [newDate, setNewDate] = useState('2026-06-08');
  const [newHeure, setNewHeure] = useState('09:00');
  const [newMotif, setNewMotif] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('Médecine Générale');

  // Available list of doctors
  const doctorsList = useMemo(() => {
    return employees.filter(emp => emp.role === 'Médecin' || emp.role === 'Super Administrateur');
  }, [employees]);

  // Handle patient autocomplete selection
  const handleSelectPatient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setNewPatientId(pId);
    const pat = patients.find(p => p.id === pId);
    if (pat) {
      setNewPatientName(`${pat.prenom} ${pat.nom}`);
      setNewPatientPhone(pat.telephone || '');
    } else {
      setNewPatientName('');
      setNewPatientPhone('');
    }
  };

  // Handle doctor selection
  const handleSelectDoctor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const medId = e.target.value;
    setNewMedecinId(medId);
    const doc = doctorsList.find(d => d.id === medId);
    if (doc) {
      setNewMedecinName(`Dr ${doc.prenom} ${doc.nom}`);
      setNewSpecialty(doc.service || 'Médecine Générale');
    } else {
      setNewMedecinName('');
    }
  };

  // Stats Counters
  const counters = useMemo(() => {
    const todayStr = '2026-06-08';
    
    let total = appointments.length;
    let today = appointments.filter(a => a.date === todayStr).length;
    let confirmed = appointments.filter(a => a.status === 'Confirmé').length;
    let pending = appointments.filter(a => a.status === 'Programmé').length;
    let cancelled = appointments.filter(a => a.status === 'Annulé').length;
    let finished = appointments.filter(a => a.status === 'Terminé').length;
    
    // Simulating doctors available/busy based on schedules
    let medecinsSchedules = new Set(appointments.filter(a => a.date === todayStr && a.status !== 'Annulé').map(a => a.medecinId));
    let docDispo = Math.max(1, doctorsList.length - medecinsSchedules.size);
    let docOccupe = medecinsSchedules.size;

    return { total, today, confirmed, pending, cancelled, finished, docDispo, docOccupe };
  }, [appointments, doctorsList]);

  // Date Check Helpers for Filtering
  const isSameWeek = (d1: Date, d2: Date) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diff = Math.abs(d1.getTime() - d2.getTime());
    return diff < 7 * oneDay && d1.getDay() <= d2.getDay();
  };

  // Filtered Appointments list
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // 1. Time Filters
      if (timeFilter === 'today') {
        if (apt.date !== '2026-06-08') return false;
      } else if (timeFilter === 'week') {
        const aptDateParts = apt.date.split('-');
        const aptDate = new Date(parseInt(aptDateParts[0]), parseInt(aptDateParts[1]) - 1, parseInt(aptDateParts[2]));
        if (!isSameWeek(aptDate, currentDate)) return false;
      } else if (timeFilter === 'month') {
        if (!apt.date.startsWith('2026-06')) return false;
      } else if (timeFilter === 'year') {
        if (!apt.date.startsWith('2026')) return false;
      }

      // 2. Search box Filters
      if (searchQuery && !apt.patientName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (searchDossier && !apt.patientId.toLowerCase().includes(searchDossier.toLowerCase())) {
        return false;
      }
      if (searchMedecin && !apt.medecinName.toLowerCase().includes(searchMedecin.toLowerCase())) {
        return false;
      }
      if (searchService && apt.motif && !apt.motif.toLowerCase().includes(searchService.toLowerCase())) {
        return false;
      }

      // 3. Status Filters
      if (searchStatus !== 'all') {
        if (searchStatus === 'Confirmé' && apt.status !== 'Confirmé') return false;
        if (searchStatus === 'Programmé' && apt.status !== 'Programmé') return false;
        if (searchStatus === 'Annulé' && apt.status !== 'Annulé') return false;
        if (searchStatus === 'Terminé' && apt.status !== 'Terminé') return false;
        if (searchStatus === 'En cours' && apt.status !== 'En cours') return false;
      }

      return true;
    });
  }, [appointments, timeFilter, searchQuery, searchDossier, searchMedecin, searchService, searchStatus, currentDate]);

  // Format statuses standard Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return 'bg-emerald-50 text-emerald-800 border-emerald-250';
      case 'Programmé':
        return 'bg-amber-50 text-amber-800 border-amber-250';
      case 'Annulé':
        return 'bg-rose-50 text-rose-800 border-rose-250';
      case 'Terminé':
        return 'bg-blue-50 text-blue-800 border-blue-250';
      case 'En cours':
        return 'bg-purple-50 text-purple-800 border-purple-250';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-250';
    }
  };

  // Submit appointment Handler
  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientId || !newMedecinId) {
      alert("Veuillez sélectionner un patient et un médecin.");
      return;
    }

    const appPayload = {
      patientId: newPatientId,
      patientName: newPatientName,
      medecinId: newMedecinId,
      medecinName: newMedecinName,
      date: newDate,
      heure: newHeure,
      motif: `${newSpecialty} - ${newMotif}`,
      status: 'Programmé',
      notes: newNotes
    };

    await onAddAppointment(appPayload);
    setShowCreateModal(false);
    
    // Clear state
    setNewPatientId('');
    setNewPatientName('');
    setNewMedecinId('');
    setNewMedecinName('');
    setNewMotif('');
    setNewNotes('');
  };

  // Status Action triggers
  const handleActionStatus = async (aptId: string, targetStatus: string) => {
    await onUpdateAppointment(aptId, { status: targetStatus });
    if (showDetailModal && showDetailModal.id === aptId) {
      setShowDetailModal(prev => prev ? { ...prev, status: targetStatus as any } : null);
    }
  };

  // Navigation utilities
  const moveDate = (days: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    setCurrentDate(next);
  };

  const getWeekDays = (date: Date) => {
    const currentWeekDay = date.getDay(); // 0 is Sunday
    const startDayOffset = currentWeekDay === 0 ? -6 : 1 - currentWeekDay; // Monday start
    const result: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() + startDayOffset + i);
      result.push(d);
    }
    return result;
  };

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  return (
    <div id="clinic-rendezvous-workspace" className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-serif">Planification Clinique & Rendez-vous</h1>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Gestion de l'agenda médical partagé, régulation des files d'attente d'admission et synchronisation avec les DME.
          </p>
        </div>
        
        <button
          id="btn-open-create-rdv"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-slate-900 border border-slate-950 font-bold text-white px-4 py-2.5 rounded-xl text-xs cursor-pointer hover:bg-slate-800 transition-all font-sans"
        >
          <Plus className="w-4 h-4" />
          Planifier un Rendez-vous
        </button>
      </div>

      {/* 2. Stats Counters Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className="bg-white border p-3 rounded-2xl flex flex-col justify-between shadow-xxs">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Total Global</span>
          <span className="text-lg font-black text-slate-800 font-mono mt-1">{counters.total} RDV</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest font-mono">Aujourd'hui</span>
          <span className="text-lg font-black text-emerald-900 font-mono mt-1">{counters.today} RDV</span>
        </div>
        <div className="bg-teal-50 border border-teal-150 p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-teal-800 uppercase tracking-widest font-mono">Confirmés</span>
          <span className="text-lg font-black text-teal-900 font-mono mt-1">{counters.confirmed}</span>
        </div>
        <div className="bg-amber-50 border border-amber-150 p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-amber-800 uppercase tracking-widest font-mono">En attente</span>
          <span className="text-lg font-black text-amber-900 font-mono mt-1">{counters.pending}</span>
        </div>
        <div className="bg-rose-50 border border-rose-150 p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-rose-800 uppercase tracking-widest font-mono">Annulés</span>
          <span className="text-lg font-black text-rose-900 font-mono mt-1">{counters.cancelled}</span>
        </div>
        <div className="bg-blue-50 border border-blue-150 p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-blue-800 uppercase tracking-widest font-mono">Terminés</span>
          <span className="text-lg font-black text-blue-900 font-mono mt-1">{counters.finished}</span>
        </div>
        <div className="bg-slate-50 border p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Médecins Libres</span>
          <span className="text-lg font-black text-slate-800 font-mono mt-1 text-emerald-600">{counters.docDispo}</span>
        </div>
        <div className="bg-slate-50 border p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Médecins Occupés</span>
          <span className="text-lg font-black text-slate-800 font-mono mt-1 text-amber-600">{counters.docOccupe}</span>
        </div>
      </div>

      {/* 3. Filter and Advanced Search Component */}
      <div className="bg-white border rounded-2xl p-4 md:p-5 shadow-xxs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Filter className="w-4 h-4 text-gray-400" />
            <span>Filtres Temporels :</span>
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border gap-0.5 font-sans">
              {(['today', 'week', 'month', 'year', 'all'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimeFilter(mode)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                    timeFilter === mode 
                      ? 'bg-white text-slate-900 shadow-xxs' 
                      : 'text-gray-500 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {mode === 'today' ? "Aujourd'hui" : mode === 'week' ? 'Cette Semaine' : mode === 'month' ? 'Ce Mois' : mode === 'year' ? 'Cette Année' : 'Tous'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="bg-gray-50 border border-gray-250 text-gray-700 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">Sélecteur de statut: Tous</option>
              <option value="Programmé">Programmé</option>
              <option value="Confirmé">Confirmé</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
        </div>

        {/* Search fields group */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">Nom Patient</span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom..."
                className="w-full bg-gray-50 pl-9 pr-3 py-1.5 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">Dossier Clinique ID</span>
            <input
              type="text"
              value={searchDossier}
              onChange={(e) => setSearchDossier(e.target.value)}
              placeholder="Ex: PAT-2026-0001"
              className="w-full bg-gray-50 px-3 py-1.5 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 font-mono text-xs"
            />
          </div>

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">Médecin Consultant</span>
            <input
              type="text"
              value={searchMedecin}
              onChange={(e) => setSearchMedecin(e.target.value)}
              placeholder="Nom du praticien..."
              className="w-full bg-gray-50 px-3 py-1.5 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">Service Médical / Service</span>
            <input
              type="text"
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              placeholder="Ex: Cardiologie, Pédiatrie..."
              className="w-full bg-gray-50 px-3 py-1.5 border border-gray-250 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 4. Calendar Controls & Views Changer */}
      <div className="bg-white border rounded-2xl shadow-xxs overflow-hidden">
        
        {/* Subheader Toolbar */}
        <div className="bg-slate-50 border-b p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-800 font-serif">
              {calendarView === 'day' && currentDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {calendarView === 'week' && `Semaine du ${weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              {calendarView === 'month' && currentDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
              {calendarView === 'agenda' && "Agenda Simplifié de Planification"}
              {calendarView === 'doctor' && "Planning par Praticien Clinique"}
            </span>
            
            <div className="flex items-center bg-white border rounded-lg p-0.5 gap-0.5">
              <button 
                onClick={() => moveDate(calendarView === 'day' ? -1 : calendarView === 'week' ? -7 : -30)}
                className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date('2026-06-08'))}
                className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase hover:bg-gray-100 rounded text-gray-700 font-mono cursor-pointer"
              >
                Aujourd'hui
              </button>
              <button 
                onClick={() => moveDate(calendarView === 'day' ? 1 : calendarView === 'week' ? 7 : 30)}
                className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center bg-white p-0.5 rounded-lg border gap-0.5 font-sans">
            {(['day', 'week', 'month', 'agenda', 'doctor'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-all uppercase tracking-wider cursor-pointer ${
                  calendarView === view ? 'bg-slate-900 text-white shadow-xxs' : 'text-gray-500 hover:text-slate-900 hover:bg-gray-100'
                }`}
              >
                {view === 'day' ? 'Jour' : view === 'week' ? 'Semaine' : view === 'month' ? 'Mois' : view === 'agenda' ? 'Agenda List' : 'Par Médecin'}
              </button>
            ))}
          </div>

        </div>

        {/* 5. Calendar Dynamic rendering grids */}
        <div className="p-4 overflow-x-auto min-h-[350px]">
          
          {/* VIEW: WEEKLY PLANNING (FullCalendar styled interactive responsive grid) */}
          {calendarView === 'week' && (
            <div className="min-w-[800px] select-none text-xs">
              
              {/* Header Days label */}
              <div className="grid grid-cols-8 border-b pb-2 font-bold text-center text-gray-500 uppercase tracking-widest font-mono text-[10px] bg-slate-50 py-2.5 rounded-t-xl">
                <div className="border-r border-gray-150">Heure</div>
                {weekDays.map((day, idx) => {
                  const isCurrentToday = day.toISOString().split('T')[0] === '2026-06-08';
                  return (
                    <div key={idx} className={`p-1 ${isCurrentToday ? 'bg-slate-900 text-white rounded-lg font-black' : ''}`}>
                      {day.toLocaleDateString('fr-FR', { weekday: 'short' })} {day.getDate()}
                    </div>
                  );
                })}
              </div>

              {/* Weekly Time slots (row from 08h to 17h) */}
              <div className="divide-y divide-gray-100 border rounded-b-xl overflow-hidden font-sans">
                {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((timeSlot) => (
                  <div key={timeSlot} className="grid grid-cols-8 hover:bg-slate-50/20 items-stretch min-h-[75px]">
                    
                    {/* Time cell */}
                    <div className="bg-slate-50/50 p-2 border-r border-gray-100 font-mono text-center flex items-center justify-center font-bold text-gray-500 text-[10px]">
                      {timeSlot}
                    </div>

                    {/* Day cells calendar items mapping */}
                    {weekDays.map((day, dIdx) => {
                      const dayStr = day.toISOString().split('T')[0];
                      const hourPrefix = timeSlot.substring(0, 2);
                      
                      // Match appointments in this slot
                      const slotAppointments = filteredAppointments.filter(
                        a => a.date === dayStr && a.heure.startsWith(hourPrefix)
                      );

                      return (
                        <div key={dIdx} className="border-r border-gray-100 p-1 bg-white relative flex flex-col gap-1 overflow-hidden group min-h-[75px]">
                          {slotAppointments.map((idxA) => (
                            <div
                              key={idxA.id}
                              onClick={() => setShowDetailModal(idxA)}
                              className={`p-1.5 rounded-lg border text-[9px] font-medium leading-normal cursor-pointer hover:shadow-sm transition-all text-left ${getStatusBadge(idxA.status)}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold block text-[10px] break-words">{idxA.heure}</span>
                                <span className="text-[10px] inline-block font-mono font-bold uppercase">{idxA.id}</span>
                              </div>
                              <div className="font-black truncate text-gray-900 mt-1">{idxA.patientName}</div>
                              <div className="text-gray-600 font-mono text-[9px] mt-0.5 truncate">{idxA.medecinName}</div>
                              <div className="text-[9px] scale-90 -translate-x-1 font-bold text-slate-500 truncate">{idxA.motif}</div>
                            </div>
                          ))}
                          
                          {/* Quick Add slot highlight */}
                          <button
                            onClick={() => {
                              setNewDate(dayStr);
                              setNewHeure(timeSlot);
                              setShowCreateModal(true);
                            }}
                            className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-slate-900 cursor-pointer"
                            title="Planifier un rendez-vous à ce créneau"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* VIEW: DAY VIEW */}
          {calendarView === 'day' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <span className="block text-[10px] font-bold text-gray-500 font-mono uppercase tracking-widest text-center">Fiches Horaires Cliniques</span>
              <div className="divide-y border rounded-2xl overflow-hidden shadow-xxs">
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => {
                  const dayStr = currentDate.toISOString().split('T')[0];
                  const hourPrefix = time.substring(0, 2);
                  const matched = filteredAppointments.filter(
                    a => a.date === dayStr && a.heure.startsWith(hourPrefix)
                  );

                  return (
                    <div key={time} className="flex hover:bg-slate-50/40 p-3 items-center justify-between gap-4">
                      <div className="w-20 font-mono font-black text-slate-500 text-sm">{time}</div>
                      <div className="flex-1 space-y-2 text-left">
                        {matched.length === 0 ? (
                          <span className="text-gray-300 text-xs italic">Aucun patient programmé</span>
                        ) : (
                          matched.map(apt => (
                            <div 
                              key={apt.id} 
                              onClick={() => setShowDetailModal(apt)}
                              className={`p-2.5 border rounded-xl flex justify-between items-center cursor-pointer hover:bg-white transition-all shadow-xxs ${getStatusBadge(apt.status)}`}
                            >
                              <div className="space-y-0.5">
                                <div className="font-extrabold text-gray-900 text-xs">{apt.patientName} <span className="text-[10px] font-mono text-gray-400">({apt.patientId})</span></div>
                                <div className="text-[10px] text-gray-600 inline-flex items-center gap-1.5">
                                  <Briefcase className="w-3 h-3" />
                                  <span>{apt.medecinName} — {apt.motif}</span>
                                </div>
                              </div>
                              <span className="font-mono text-xs font-bold">{apt.heure}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setNewDate(dayStr);
                          setNewHeure(time);
                          setShowCreateModal(true);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-lg text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: MONTH GRID */}
          {calendarView === 'month' && (
            <div className="grid grid-cols-7 gap-1.5 text-center min-w-[500px]">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                <div key={d} className="font-bold text-gray-400 font-mono uppercase text-[9px] py-2 tracking-widest">{d}</div>
              ))}
              
              {/* Monthly Calendar 30 simulation slots around June 2026 */}
              {Array.from({ length: 30 }).map((_, dIdx) => {
                const dayNum = dIdx + 1;
                const formattedDay = dayNum.toString().padStart(2, '0');
                const dayStr = `2026-06-${formattedDay}`;
                
                // Count day elements
                const countDay = filteredAppointments.filter(a => a.date === dayStr).length;
                const isSelected = currentDate.getDate() === dayNum;

                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      const updatedDate = new Date(currentDate);
                      updatedDate.setDate(dayNum);
                      setCurrentDate(updatedDate);
                    }}
                    className={`p-3 min-h-[75px] border rounded-xl flex flex-col justify-between items-start text-left cursor-pointer transition-all ${
                      isSelected ? 'bg-slate-900 border-slate-950 text-white' : 'bg-slate-50/50 hover:bg-slate-100/60 text-gray-700'
                    }`}
                  >
                    <span className="font-bold font-mono text-xs text-right w-full block">{dayNum}</span>
                    
                    {countDay > 0 && (
                      <div className="w-full mt-2">
                        <span className={`block text-center rounded text-[9px] font-extrabold font-mono p-0.5 ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {countDay} Patients
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW: AGENDA & DOCTORS PLAN VIEW */}
          {(calendarView === 'agenda' || calendarView === 'doctor') && (
            <div className="space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs italic font-mono bg-slate-50 border rounded-2xl">
                  Aucun rendez-vous planifié ne correspond aux critères de filtres actuels.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-100 uppercase text-[9px] text-gray-400 font-bold p-3">
                        <th className="p-3">Référence</th>
                        <th className="p-3">Date & Heure</th>
                        <th className="p-3">Patient DME</th>
                        <th className="p-3">Médecin Consultant</th>
                        <th className="p-3">Motif Clinique</th>
                        <th className="p-3">Téléphone</th>
                        <th className="p-3 text-center">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/60 font-medium">
                          <td className="p-3 font-mono font-bold text-gray-500">{apt.id}</td>
                          <td className="p-3 font-semibold font-mono">
                            <span className="block text-gray-900">{new Date(apt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                            <span className="text-[10px] text-gray-400 font-bold">{apt.heure}</span>
                          </td>
                          <td className="p-3">
                            <div className="font-extrabold text-gray-900">{apt.patientName}</div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">{apt.patientId}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-700">{apt.medecinName}</td>
                          <td className="p-3 text-slate-500 italic max-w-xs truncate">{apt.motif}</td>
                          <td className="p-3 font-mono text-gray-500">76 00 22 99</td>
                          <td className="p-3 text-center">
                            <span className={`p-1 px-2.5 text-[9px] rounded font-mono font-black border ${getStatusBadge(apt.status)}`}>
                              {apt.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setShowDetailModal(apt)}
                                className="bg-white hover:bg-gray-100 border text-gray-700 font-bold px-2.5 py-1 rounded text-[10px] transition-all cursor-pointer"
                              >
                                Gérer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 6. MODAL: DETAILED WORKSPACE ACTION SHEET FOR APPOINTMENTS */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border shadow-xl max-w-xl w-full p-6 text-left relative overflow-hidden font-sans">
            
            <button 
              onClick={() => setShowDetailModal(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border">
              FICHE RDV • {showDetailModal.id}
            </span>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">{showDetailModal.patientName}</h3>
                  <span className="font-mono text-xs text-gray-400">UUID Dossier DME Séquence : {showDetailModal.patientId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 border p-4 rounded-2xl font-sans text-xs">
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest block">Jour de Consultation</span>
                  <span className="font-mono font-bold text-gray-800">{showDetailModal.date}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest block">Heure Précise</span>
                  <span className="font-mono font-bold text-gray-800">{showDetailModal.heure}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest block">Médecin Référent</span>
                  <span className="font-bold text-gray-800">{showDetailModal.medecinName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest block">Motif d'Admission</span>
                  <span className="text-gray-800 italic">{showDetailModal.motif}</span>
                </div>
              </div>

              {showDetailModal.notes && (
                <div className="bg-slate-50/50 p-3 rounded-xl border text-xs text-gray-600">
                  <span className="block font-bold text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">Notes Additionnelles</span>
                  <p>{showDetailModal.notes}</p>
                </div>
              )}

              {/* Patient Phone Display */}
              <div className="flex items-center gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <Phone className="w-4 h-4 text-amber-600" />
                <span className="font-bold">Téléphone Patient :</span>
                <span className="font-mono font-bold">76 00 22 99 (Polyclinique Sahel Bamako Intranet Alert Engine)</span>
              </div>

              {/* Status display & Trigger list */}
              <div className="border-t pt-4 space-y-3">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Changer le statut clinique :</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => handleActionStatus(showDetailModal.id, 'Confirmé')}
                    className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-200 border px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Confirmer RDV
                  </button>
                  <button
                    onClick={() => handleActionStatus(showDetailModal.id, 'En cours')}
                    className="flex items-center gap-1.5 bg-purple-50 text-purple-800 border-purple-200 border px-3 py-1.5 rounded-lg font-bold hover:bg-purple-100 cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-purple-600" /> Valider Arrivée Patient
                  </button>
                  <button
                    onClick={() => handleActionStatus(showDetailModal.id, 'Terminé')}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border-blue-200 border px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-blue-600" /> Terminer (Consultation OK)
                  </button>
                  <button
                    onClick={() => handleActionStatus(showDetailModal.id, 'Annulé')}
                    className="flex items-center gap-1.5 bg-rose-50 text-rose-800 border-rose-200 border px-3 py-1.5 rounded-lg font-bold hover:bg-rose-100 cursor-pointer"
                  >
                    <X className="w-4 h-4 text-rose-600" /> Annuler / Refuser
                  </button>
                </div>
              </div>

              {/* Lateral shortcuts to related modules for nursing/clinical actions */}
              <div className="border-t pt-4 grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setShowDetailModal(null);
                    onNavigateToTab('dme', showDetailModal.patientId);
                  }}
                  className="flex items-center justify-center gap-2 border bg-gray-50 hover:bg-gray-100 text-gray-700 font-extrabold py-2 px-3 rounded-xl cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-gray-500" /> Ouvrir Dossier Patient
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(null);
                    onNavigateToTab('consultation');
                  }}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2 px-3 rounded-xl cursor-pointer shadow-xs"
                >
                  <Play className="w-4 h-4" /> Démarrer Consultation
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 7. MODAL: APPOINTMENT CREATION FORM PANEL */}
      {showCreateModal && (
        <div id="modal-create-rdv" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border shadow-xl max-w-xl w-full p-6 text-left relative overflow-hidden font-sans">
            
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-base text-gray-900 font-serif border-b pb-2 mb-4 uppercase tracking-normal">
              Planification de Consultation SIH
            </h3>

            <form onSubmit={handleSaveAppointment} className="space-y-4 text-xs font-sans">
              
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Sélectionner le Patient DME</label>
                <select
                  required
                  value={newPatientId}
                  onChange={handleSelectPatient}
                  className="w-full bg-gray-50 border border-gray-250 text-gray-800 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="">-- Choisir Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.prenom} {p.nom} ({p.telephone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Médecin Référent</label>
                  <select
                    required
                    value={newMedecinId}
                    onChange={handleSelectDoctor}
                    className="w-full bg-gray-50 border border-gray-250 text-gray-800 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">-- Choisir Praticien --</option>
                    {doctorsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.role} — Dr {d.prenom} {d.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Service Spécialisé</label>
                  <input
                    type="text"
                    disabled
                    value={newSpecialty}
                    className="w-full bg-gray-100 border border-gray-250 text-gray-500 font-bold text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Date Prévue</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-250 text-gray-800 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Créneau Horaire</label>
                  <input
                    type="time"
                    required
                    value={newHeure}
                    onChange={(e) => setNewHeure(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-250 text-gray-800 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Motif / Symptômes Directeurs</label>
                <input
                  type="text"
                  required
                  value={newMotif}
                  onChange={(e) => setNewMotif(e.target.value)}
                  placeholder="Ex : Examen de routine, poussée d'hypertension, contrôle labo..."
                  className="w-full bg-gray-50 border border-gray-250 text-gray-800 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase text-[9px] font-mono tracking-widest mb-1.5">Notes Additionnelles</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes de pointage secrétaire, allergies potentielles, conditions particulières..."
                  className="w-full bg-gray-50 border border-gray-250 text-gray-800 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-150 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 font-bold text-white px-5 py-2 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Enregistrer et Planifier
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
