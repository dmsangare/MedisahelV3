/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PharmacieProduct, PharmacieStockMove, User, ClinicSettings } from '../types';
import { 
  Pill, 
  RotateCcw, 
  Plus, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  FileCheck2, 
  Activity, 
  Truck,
  Layers,
  Inbox,
  BadgeAlert,
  Search,
  ChevronDown
} from 'lucide-react';

interface PharmacieModuleProps {
  inventory: PharmacieProduct[];
  moves: PharmacieStockMove[];
  currentUser: User;
  settings: ClinicSettings;
  onAddProduct: (prod: any) => Promise<any>;
  onAddMove: (move: any) => Promise<any>;
}

export default function PharmacieModule({
  inventory,
  moves,
  currentUser,
  settings,
  onAddProduct,
  onAddMove
}: PharmacieModuleProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'movement'>('inventory');
  
  // Saisie product form
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [forme, setForme] = useState('Comprimé');
  const [stockActuel, setStockActuel] = useState(250);
  const [seuilCritique, setSeuilCritique] = useState(100);
  const [prixVente, setPrixVente] = useState(150);
  const [datePeremption, setDatePeremption] = useState('');
  const [fournisseurNom, setFournisseurNom] = useState('Ubipharm Mali');

  // Adjust stock movement form
  const [selectedProductId, setSelectedProductId] = useState('');
  const [moveType, setMoveType] = useState<'Entrée' | 'Sortie'>('Entrée');
  const [moveQty, setMoveQty] = useState(50);
  const [moveMotif, setMoveMotif] = useState('Approvisionnement de réserve');

  // Search filter
  const [productQuery, setProductQuery] = useState('');

  const canWrite = currentUser.permissions.includes('PHARMACIE.WRITE') || currentUser.role === 'Super Administrateur';

  // Submissions
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !code) return;

    await onAddProduct({
      code,
      nom,
      forme,
      stockActuel,
      seuilCritique,
      prixVente,
      datePeremption,
      fournisseurNom
    });

    setCode('');
    setNom('');
    setDatePeremption('');
  };

  const handleCreateMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    await onAddMove({
      productId: selectedProductId,
      type: moveType,
      quantite: moveQty,
      motif: moveMotif
    });

    setSelectedProductId('');
  };

  // Logic lists filters
  const filteredProducts = inventory.filter(p => {
    const term = productQuery.toLowerCase();
    return p.nom.toLowerCase().includes(term) || p.code.toLowerCase().includes(term);
  });

  // Calculate stats
  const lowStockProducts = inventory.filter(p => p.stockActuel <= p.seuilCritique);
  
  // check if expired or expiring within 60 days
  const isExpiringSoon = (dateStr: string) => {
    if (!dateStr) return false;
    const exp = new Date(dateStr);
    const now = new Date();
    const diff = exp.getTime() - now.getTime();
    const days = diff / (1000 * 3600 * 24);
    return days >= 0 && days <= 60; // 60 days limits
  };
  
  const expiringProducts = inventory.filter(p => isExpiringSoon(p.datePeremption));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Pharmacie & Officine Intégrée</h2>
          <p className="text-xs text-gray-400">Suivi d'ordonnances, stock critique et inventaire de péremption du Sahel</p>
        </div>

        {/* Local pharmacie navbar tab */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Dépôt & Stocks ({inventory.length} réf)
          </button>
          <button
            onClick={() => setActiveTab('movement')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'movement' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Mouvements ({moves.length})
          </button>
        </div>
      </div>

      {/* WARNING HUD PANEL */}
      {(lowStockProducts.length > 0 || expiringProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-20 duration-150">
          {/* Low Stock warn */}
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900">Alerte Stocks Critiques ({lowStockProducts.length})</h4>
                <p className="text-amber-800 mt-1">Les étagères ci-dessous requièrent un bon de commande Logox immédiat :</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {lowStockProducts.map(p => (
                    <span key={p.id} className="p-0.5 px-2 bg-amber-100 border border-amber-250 text-amber-900 font-mono font-bold text-[9px] rounded">
                      {p.nom} (Réserve: {p.stockActuel})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expire soon Alert */}
          {expiringProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-xs">
              <BadgeAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900">Alerte Péremption Proche ({expiringProducts.length})</h4>
                <p className="text-red-800 mt-1">Produits approchant d'une date limite critique en officine (sous 60 jours) :</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {expiringProducts.map(p => (
                    <span key={p.id} className="p-0.5 px-2 bg-red-100 border border-red-250 text-red-900 font-mono font-bold text-[9px] rounded">
                      {p.nom} ({new Date(p.datePeremption).toLocaleDateString()})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* NEW PRODUCT REGISTER FORM & QUICK ADYUST */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border p-5 rounded-2xl shadow-xs relative">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b pb-2">
                AJOUTER UN PRODUIT / MEDICAMENT
              </span>

              {!canWrite && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                  <h4 className="font-bold text-xs text-gray-950">Accés Officine Restreint</h4>
                  <p className="text-[10.5px] text-gray-450 max-w-xs">
                    Veuillez basculer vers le profil <strong className="font-semibold">Pharmacien (Amadou Coulibaly)</strong> pour enregistrer des molécules.
                  </p>
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-medium text-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold block">Code Interne *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PAR-500"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full border rounded-lg p-2 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold block">Type *</label>
                    <select
                      value={forme}
                      onChange={(e) => setForme(e.target.value)}
                      className="w-full border rounded-lg p-2 bg-white"
                    >
                      <option value="Comprimé">Comprimé</option>
                      <option value="Gélule">Gélule</option>
                      <option value="Sirop (Flacon)">Sirop (Flacon)</option>
                      <option value="Injection IV/IM">Injection IV/IM</option>
                      <option value="Consommable">Consommable</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold block">Désignation Scientifique *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracétamol Sahel 500mg"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full border rounded-lg p-2 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold block text-[10px] text-gray-500">Stock Initial *</label>
                    <input
                      type="number"
                      required
                      value={stockActuel}
                      onChange={(e) => setStockActuel(parseInt(e.target.value) || 0)}
                      className="w-full border rounded px-1.5 py-1 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold block text-[10px] text-gray-500 font-sans">Seuil Alerte *</label>
                    <input
                      type="number"
                      required
                      value={seuilCritique}
                      onChange={(e) => setSeuilCritique(parseInt(e.target.value) || 0)}
                      className="w-full border rounded px-1.5 py-1 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold block text-[10px] text-gray-500">Prix de vente *</label>
                    <input
                      type="number"
                      required
                      value={prixVente}
                      onChange={(e) => setPrixVente(parseFloat(e.target.value) || 0)}
                      className="w-full border rounded px-1.5 py-1 text-center font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold block text-gray-600">Pérèmption *</label>
                    <input
                      type="date"
                      required
                      value={datePeremption}
                      onChange={(e) => setDatePeremption(e.target.value)}
                      className="w-full border rounded px-2 py-1.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold block text-gray-650">Fournisseur d'Origine</label>
                    <input
                      type="text"
                      value={fournisseurNom}
                      onChange={(e) => setFournisseurNom(e.target.value)}
                      className="w-full border rounded px-2 py-1.5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-lg cursor-pointer font-sans"
                >
                  Ajouter à l'Officine d'Admission
                </button>
              </form>
            </div>

            {/* MANUAL ADJUST COUPLINGS */}
            {inventory.length > 0 && (
              <div className="bg-white border p-5 rounded-2xl shadow-xs relative">
                <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b pb-2">
                  AJUSTEMENTS MANUELS SPECULATIFS
                </span>

                {!canWrite && (
                  <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-10" />
                )}

                <form onSubmit={handleCreateMove} className="space-y-3.5 text-xs text-gray-700">
                  <div className="space-y-1">
                    <label className="font-semibold block">Choisir Produit *</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full border rounded px-2 py-1.5 bg-white"
                    >
                      <option value="">-- Choisir --</option>
                      {inventory.map(p => (
                        <option key={p.id} value={p.id}>{p.nom} (Dispo : {p.stockActuel})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold block">Type Mouvement</label>
                      <select
                        value={moveType}
                        onChange={(e) => setMoveType(e.target.value as any)}
                        className="w-full border rounded p-1.5 bg-white text-xs"
                      >
                        <option value="Entrée">Entrée (Réappro.)</option>
                        <option value="Sortie">Sortie (Ajust./Casse)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold block">Quantité *</label>
                      <input
                        type="number"
                        min={1}
                        value={moveQty}
                        onChange={(e) => setMoveQty(parseInt(e.target.value) || 0)}
                        className="w-full border rounded p-1.5 text-center font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold block">Motif d'action *</label>
                    <input
                      type="text"
                      placeholder="e.g. Vol d'inventaire, don humanitaire..."
                      value={moveMotif}
                      onChange={(e) => setMoveMotif(e.target.value)}
                      className="w-full border rounded p-2 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold p-2 rounded-lg cursor-pointer"
                  >
                    Valider le Mouvement
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* TABLE OF INVENTORY ON SHELVES */}
          <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4 gap-4 flex-wrap">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                MATRICE DES PRODUITS DE STOCK({filteredProducts.length})
              </span>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrer par molécule..."
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  className="w-full bg-slate-55 border border-gray-150 pl-9 pr-4 py-1.5 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto text-xs font-sans">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b text-[10px] uppercase font-bold text-gray-400">
                    <th className="p-3">Ref Code</th>
                    <th className="p-3">Désignation</th>
                    <th className="p-3">Forme</th>
                    <th className="p-3">Stock Dispo</th>
                    <th className="p-3">Tarif Unitaire</th>
                    <th className="p-3">Pérèmption</th>
                    <th className="p-3 text-right">Alerte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredProducts.map((p) => {
                    const isMin = p.stockActuel <= p.seuilCritique;
                    const isExp = isExpiringSoon(p.datePeremption);

                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 ${isMin ? 'bg-amber-50/20' : ''} ${isExp ? 'bg-red-50/30' : ''}`}>
                        <td className="p-3 font-mono font-bold text-[11px] text-gray-900">{p.code}</td>
                        <td className="p-3">
                          <span className="block font-bold text-gray-850">{p.nom}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{p.fournisseurNom}</span>
                        </td>
                        <td className="p-3 text-gray-550 font-semibold">{p.forme}</td>
                        <td className="p-3">
                          <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            isMin ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-gray-900'
                          }`}>
                            {p.stockActuel}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-gray-900">{p.prixVente} {settings.devise}</td>
                        <td className="p-3 font-mono font-medium text-gray-500">
                          {p.datePeremption ? new Date(p.datePeremption).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3 text-right">
                          {isMin ? (
                            <span className="text-[10px] bg-red-105 text-red-700 px-2 py-0.5 border border-red-200 rounded font-bold">CRITIQUE</span>
                          ) : isExp ? (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">PEREMPTION</span>
                          ) : (
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold font-mono">CONFORME</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* TABLE OF MOVEMENTS HISTORY (LIVRER HISTORIES COULONNE) */
        <div className="bg-white border rounded-2xl p-5 shadow-xs">
          <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b pb-2">
            GRAND LIVRE DE TRAÇABILITÉ DES ROTATIONS DE STOCKS ({moves.length} ACTIONS)
          </span>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] uppercase font-bold text-gray-400">
                  <th className="p-3">ID Mouvement</th>
                  <th className="p-3">Molécule</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Quantité</th>
                  <th className="p-3">Motif Historique</th>
                  <th className="p-3">Opérateur</th>
                  <th className="p-3 text-right">Date/Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 font-medium">
                {moves.slice().reverse().map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-gray-500">{m.id}</td>
                    <td className="p-3 font-bold text-gray-905">{m.productNom}</td>
                    <td className="p-3">
                      <span className={`inline-block font-mono font-black text-[10px] p-0.5 px-2.5 rounded-full ${
                        m.type === 'Entrée' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-gray-800">{m.quantite} units</td>
                    <td className="p-3 text-gray-600 font-sans">{m.motif}</td>
                    <td className="p-3 text-gray-500">{m.utilisateur}</td>
                    <td className="p-3 text-right text-gray-400 font-mono">
                      {new Date(m.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
