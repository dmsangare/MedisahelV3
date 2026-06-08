/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Fournisseur, BonCommande, InventaireItem, User, ClinicSettings } from '../types';
import { 
  Building2, 
  Truck, 
  Layers, 
  Plus, 
  Check, 
  Briefcase, 
  Wrench, 
  ClipboardCheck, 
  AlertCircle,
  FolderLock,
  Boxes,
  FileSpreadsheet
} from 'lucide-react';

interface AchatsModuleProps {
  suppliers: Fournisseur[];
  orders: BonCommande[];
  inventoryItems: InventaireItem[];
  currentUser: User;
  settings: ClinicSettings;
  onAddSupplier: (sup: any) => Promise<any>;
  onAddOrder: (order: any) => Promise<any>;
}

export default function AchatsModule({
  suppliers,
  orders,
  inventoryItems,
  currentUser,
  settings,
  onAddSupplier,
  onAddOrder
}: AchatsModuleProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'suppliers'>('inventory');

  // Supplier Form
  const [supNom, setSupNom] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supTel, setSupTel] = useState('');
  const [supProd, setSupProd] = useState('');

  // Purchase Order Form
  const [ordFournisseur, setOrdFournisseur] = useState('Ubipharm Mali');
  const [ordProduct, setOrdProduct] = useState('');
  const [ordQty, setOrdQty] = useState(1);
  const [ordUnitPrice, setOrdUnitPrice] = useState(15000);

  const canManage = currentUser.permissions.includes('ACHATS.MANAGE') || currentUser.role === 'Super Administrateur';

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supNom) return;

    await onAddSupplier({
      nom: supNom,
      contact: supContact,
      telephone: supTel,
      produitsFournis: [supProd]
    });

    setSupNom('');
    setSupContact('');
    setSupTel('');
    setSupProd('');
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordProduct) return;

    const payload = {
      fournisseurNom: ordFournisseur,
      items: [
        { nomProduit: ordProduct, quantite: ordQty, prixUnitaire: ordUnitPrice }
      ]
    };

    await onAddOrder(payload);

    setOrdProduct('');
    setOrdQty(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Logistique & Approvisionnements</h2>
          <p className="text-xs text-gray-400">Suivi d'équipements HP ProLiant, fiches fournisseurs et bons de commandes du Sahel</p>
        </div>

        {/* Local logistis navbar tab */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Inventaire Matériel ({inventoryItems.length} items)
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Bons de Commande ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'suppliers' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Fichier Fournisseurs ({suppliers.length})
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        /* IMMOBILISATIONS CLINIC ASSETS INVENTORY */
        <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2">
            <div>
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                REGISTRE DU PARC MATERIEL & SERVEURS HP PROLIANT
              </span>
              <p className="text-gray-400 text-[11px]">Suivi de maintenance préventive locale et équipement biomédical</p>
            </div>
            <button className="flex items-center gap-1 bg-white border text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Exporter PDF
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b uppercase text-[9px] font-bold text-gray-400">
                  <th className="p-3">Ref Asset</th>
                  <th className="p-3">Désignation Équipement</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Localisation</th>
                  <th className="p-3">Date Maintenance</th>
                  <th className="p-3 text-right">État Fonctionnel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 font-medium">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-gray-500">{item.id}</td>
                    <td className="p-3">
                      <span className="block font-black text-slate-850">{item.nom}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Qte: {item.quantite} unité(s)</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 p-0.5 px-2 rounded font-mono font-bold text-[9px] text-gray-600 uppercase">
                        {item.categorie}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 font-medium">{item.localisation}</td>
                    <td className="p-3 font-mono text-gray-500">{item.derniereMaintenance || "Non programée"}</td>
                    <td className="p-3 text-right">
                      <span className="p-0.5 px-3 bg-emerald-50 text-emerald-850 font-bold border border-emerald-100 rounded-full font-mono text-[9px]">
                        {item.etat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        /* PURCHASE ORDERS FOR SUPPLIES */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 bg-white border border-gray-100 p-5 rounded-2xl shadow-xs relative h-fit">
            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b pb-2">
              DÉPOSER UN BON DE COMMANDE
            </span>

            {!canManage && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                <h4 className="font-bold text-xs text-gray-950">Privilège logistique Restreint</h4>
                <p className="text-[10px] text-gray-450">
                  Habilité Achat / Super Administrateur requis pour émettre des bons officiels.
                </p>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-4 font-medium text-gray-700">
              <div className="space-y-1">
                <label className="font-bold block">Choisir Fournisseur Cible *</label>
                <select
                  value={ordFournisseur}
                  onChange={(e) => setOrdFournisseur(e.target.value)}
                  className="w-full border rounded p-2 bg-white text-xs"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.nom}>{s.nom}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Désignation Molécule / Matériel *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracétamol Flacons d'injection 1000g"
                  value={ordProduct}
                  onChange={(e) => setOrdProduct(e.target.value)}
                  className="w-full border rounded p-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold block">Unités à commander *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={ordQty}
                    onChange={(e) => setOrdQty(parseInt(e.target.value) || 1)}
                    className="w-full border rounded p-1.5 focus:ring-1 focus:ring-sky-500 font-mono text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold block">PU Estimé (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={ordUnitPrice}
                    onChange={(e) => setOrdUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded p-1.5 focus:ring-1 focus:ring-sky-500 font-mono text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold p-2.5 rounded-lg cursor-pointer"
              >
                Générer Bon de Commande
              </button>
            </form>
          </div>

          {/* HISTORICAL PURCHASE ORDERS LIST */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b pb-2">
              RELEVES DES COMMANDES FOURNISSEURS ({orders.length})
            </span>

            <div className="space-y-4">
              {orders.slice().reverse().map((ord, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border rounded-2xl text-xs flex justify-between items-center transition-colors hover:border-gray-300">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="p-0.5 px-2 bg-slate-200 rounded font-mono font-bold text-[9px] text-gray-600">
                        {ord.id || `BC-00${idx + 1}`}
                      </span>
                      <strong className="text-gray-900">{ord.fournisseurNom}</strong>
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                      {ord.items.map((item, idy) => (
                        <div key={idy} className="py-1">
                          ● {item.nomProduit} — <span className="font-bold font-mono text-gray-800">{item.quantite}</span> unités x {item.prixUnitaire.toLocaleString()} FCFA
                        </div>
                      ))}
                    </div>

                    <span className="block text-[10px] text-gray-400 font-mono uppercase">
                      COMMANDÉ LE : {ord.dateCommande} — REÇU LE : {ord.dateReception || "EN ATTENTE"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-sm font-bold font-mono text-slate-800 leading-none">
                      {ord.total.toLocaleString()} FCFA
                    </span>
                    <span className="inline-block mt-2 font-mono text-[9px] font-bold p-0.5 px-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 uppercase">
                      {ord.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* PROVIDERS CATALOGUE DIRECTORY FILE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 bg-white border border-gray-100 p-5 rounded-2xl shadow-xs relative h-fit">
            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-4 border-b pb-2">
              AJOUTER UN FOURNISSEUR
            </span>

            <form onSubmit={handleCreateSupplier} className="space-y-4 font-medium text-gray-700">
              <div className="space-y-1">
                <label className="font-bold block">Nom Organisme *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ubipharm Mali"
                  value={supNom}
                  onChange={(e) => setSupNom(e.target.value)}
                  className="w-full border rounded p-2 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Contact Référent *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marie Sanogo (Gérante)"
                  value={supContact}
                  onChange={(e) => setSupContact(e.target.value)}
                  className="w-full border rounded p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Téléphone *</label>
                <input
                  type="text"
                  required
                  placeholder="+223"
                  value={supTel}
                  onChange={(e) => setSupTel(e.target.value)}
                  className="w-full border rounded p-2 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block">Catégorie Principale Fournie</label>
                <input
                  type="text"
                  placeholder="e.g. Antibiotiques, Seringues"
                  value={supProd}
                  onChange={(e) => setSupProd(e.target.value)}
                  className="w-full border rounded p-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold p-2 px-3 rounded-lg cursor-pointer"
              >
                Inscrire Nouveau Fournisseur
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-4 border-b pb-2">
              FICHER D'IDENTITÉ DES FOURNISSEURS AGRÉES ({suppliers.length})
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((sup) => (
                <div key={sup.id} className="p-4 bg-slate-50 border rounded-2xl flex flex-col justify-between text-xs space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-900 font-extrabold text-sm">
                      <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                      {sup.nom}
                    </div>
                    <p className="text-gray-450 font-medium">Représentant(e) : {sup.contact}</p>
                    <p className="text-gray-400 font-mono font-medium">Tel: {sup.telephone}</p>
                  </div>

                  {sup.produitsFournis && sup.produitsFournis.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sup.produitsFournis.map((p, idx) => (
                        <span key={idx} className="bg-white border rounded p-1 px-2 font-bold font-mono text-[9px] text-gray-600">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
