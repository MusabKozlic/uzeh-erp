import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Tag,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Partner } from '../types/erp';

export const PartnersView: React.FC = () => {
  const { partners, createPartner } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SUPPLIER' | 'CUSTOMER'>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New partner state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'SUPPLIER' | 'CUSTOMER'>('SUPPLIER');
  const [newJib, setNewJib] = useState('');
  const [newPdv, setNewPdv] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.jib && p.jib.includes(searchTerm)) ||
      (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'SUPPLIER' && (p.type === 'SUPPLIER' || p.type === 'BOTH')) ||
      (filterType === 'CUSTOMER' && (p.type === 'CUSTOMER' || p.type === 'BOTH'));

    return matchesSearch && matchesType;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    createPartner({
      name: newName,
      type: newType,
      jib: newJib || undefined,
      pdv_number: newPdv || undefined,
      address: newAddress || undefined,
      city: newCity || undefined,
      country: 'Bosna i Hercegovina',
      phone: newPhone || undefined,
      email: newEmail || undefined,
      is_active: true,
    });

    setIsCreateOpen(false);
    setNewName('');
    setNewJib('');
    setNewPdv('');
    setNewAddress('');
    setNewCity('');
    setNewPhone('');
    setNewEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Poslovni partneri (Dobavljači & Kupci)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Matični podaci o dobavljačima robe za kalkulacije i pravnim licima kupcima za fakturisanje.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>Novi partner</span>
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pretraži po nazivu, JIB-u ili gradu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Svi ({partners.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('SUPPLIER')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              filterType === 'SUPPLIER'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Dobavljači
          </button>
          <button
            type="button"
            onClick={() => setFilterType('CUSTOMER')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
              filterType === 'CUSTOMER'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kupci
          </button>
        </div>
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((p) => {
          const isSupplier = p.type === 'SUPPLIER' || p.type === 'BOTH';
          const isCustomer = p.type === 'CUSTOMER' || p.type === 'BOTH';

          return (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      <div className="flex gap-1 mt-0.5">
                        {isSupplier && (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">
                            Dobavljač
                          </span>
                        )}
                        {isCustomer && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                            Kupac
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  {p.jib && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px] w-12">JIB:</span>
                      <span className="font-mono font-medium text-slate-800">{p.jib}</span>
                    </div>
                  )}
                  {p.pdv_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px] w-12">PDV:</span>
                      <span className="font-mono font-medium text-slate-800">{p.pdv_number}</span>
                    </div>
                  )}
                  {p.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {p.address ? `${p.address}, ` : ''}
                        {p.city}
                      </span>
                    </div>
                  )}
                  {p.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{p.phone}</span>
                    </div>
                  )}
                  {p.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-blue-600">{p.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Status: Aktivan</span>
                <span className="font-mono">ID: {p.id.slice(0, 8)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE PARTNER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Unos novog poslovnog partnera</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 my-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Naziv partnera / firme *</label>
                <input
                  type="text"
                  required
                  placeholder="npr. EDEKA GmbH ili Cvjećara Flamingo d.o.o."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tip partnera</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                  >
                    <option value="SUPPLIER">Dobavljač</option>
                    <option value="CUSTOMER">Kupac (Pravno lice)</option>
                    <option value="BOTH">Oboje (Dobavljač i Kupac)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Grad</label>
                  <input
                    type="text"
                    placeholder="Sarajevo, Banja Luka..."
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">JIB (13 cifara)</label>
                  <input
                    type="text"
                    placeholder="4200000000000"
                    value={newJib}
                    onChange={(e) => setNewJib(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">PDV broj (12 cifara)</label>
                  <input
                    type="text"
                    placeholder="200000000000"
                    value={newPdv}
                    onChange={(e) => setNewPdv(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Adresa</label>
                <input
                  type="text"
                  placeholder="Ulica i broj"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Telefon</label>
                  <input
                    type="text"
                    placeholder="+387 33 000 000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="info@firma.ba"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Odustani
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Sačuvaj partnera
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
