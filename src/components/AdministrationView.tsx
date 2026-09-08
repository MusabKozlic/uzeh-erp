import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Store,
  CreditCard,
  Receipt,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from './ui/PageHeader';
import { StatusBadge } from './ui/StatusBadge';
import { DataTable } from './ui/DataTable';
import { FormDialog } from './ui/FormDialog';
import { INITIAL_USERS, INITIAL_ROLES } from '../data/seedDatabase';

export type AdminTab = 'users' | 'roles' | 'warehouses' | 'payments' | 'vat';

interface AdministrationViewProps {
  initialTab?: AdminTab;
}

export const AdministrationView: React.FC<AdministrationViewProps> = ({
  initialTab = 'users',
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const { warehouses, taxRates } = useERP();
  const toast = useToast();

  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('MANAGER');

  // Payment methods mock list
  const [paymentMethods] = useState([
    { id: 'pay-1', code: 'CASH', name: 'Gotovina (Novčanice & Kovanice)', active: true, fiscal: true },
    { id: 'pay-2', code: 'CARD', name: 'Platna kartica (POS Terminal)', active: true, fiscal: true },
    { id: 'pay-3', code: 'WIRE', name: 'Virman / Žiralno plaćanje', active: true, fiscal: false },
    { id: 'pay-4', code: 'VOUCHER', name: 'Poklon bon / Vaučer', active: true, fiscal: true },
    { id: 'pay-5', code: 'ORDER', name: 'Pouzećem (Brza pošta)', active: true, fiscal: true },
  ]);

  const handleCreateUser = () => {
    if (!newUserName || !newUserEmail) {
      toast.error('Molimo popunite sva obavezna polja.');
      return;
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      email: newUserEmail,
      full_name: newUserName,
      role: newUserRole as any,
      active: true,
      created_at: new Date().toISOString(),
    };
    setUsersList((prev) => [...prev, newUser]);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    toast.success(`Korisnik ${newUserName} je uspješno kreiran.`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
    toast.info('Status korisničkog naloga je promijenjen.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistemska administracija i šifarnici"
        subtitle="Upravljanje korisnicima, bezbjednosnim ulogama, skladištima, porezima i načinima plaćanja"
        breadcrumbs={[
          { label: 'Administracija' },
          {
            label:
              activeTab === 'users'
                ? 'Korisnici'
                : activeTab === 'roles'
                ? 'Uloge i prava'
                : activeTab === 'warehouses'
                ? 'Skladišta'
                : activeTab === 'payments'
                ? 'Načini plaćanja'
                : 'PDV stope',
            active: true,
          },
        ]}
        actions={
          activeTab === 'users' ? (
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Novi korisnik</span>
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 gap-2 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Korisnici ({usersList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Uloge i matrica prava</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warehouses')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'warehouses'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Skladišta ({warehouses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Načini plaćanja</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vat')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'vat'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>PDV stope (17%)</span>
        </button>
      </div>

      {/* 1. USERS */}
      {activeTab === 'users' && (
        <DataTable
          columns={[
            {
              id: 'name',
              header: 'Ime i prezime',
              accessor: (u: any) => (
                <div>
                  <div className="font-semibold text-slate-900">{u.full_name}</div>
                  <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                </div>
              ),
              sortable: true,
            },
            {
              id: 'role',
              header: 'Uloga (Role)',
              accessor: (u: any) => (
                <span className="font-mono text-[11px] rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-semibold text-slate-700">
                  {u.role}
                </span>
              ),
              sortable: true,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (u: any) => (
                <StatusBadge status={u.active ? 'AKTIVAN' : 'NEAKTIVAN'} />
              ),
              sortable: true,
            },
            {
              id: 'created',
              header: 'Registrovan',
              accessor: (u: any) => (
                <span className="font-mono text-slate-500 text-[11px]">
                  {u.created_at ? u.created_at.split('T')[0] : '2026-01-01'}
                </span>
              ),
            },
            {
              id: 'actions',
              header: 'Akcije',
              align: 'right',
              accessor: (u: any) => (
                <button
                  type="button"
                  onClick={() => handleToggleUserStatus(u.id)}
                  className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {u.active ? 'Deaktiviraj' : 'Aktiviraj'}
                </button>
              ),
            },
          ]}
          data={usersList}
          keyExtractor={(u: any) => u.id}
        />
      )}

      {/* 2. ROLES & PERMISSION MATRIX */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Matrica dozvola po ulogama (Role-Based Access Control)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Konfiguracija prava pristupa operacijama: Čitanje, Kreiranje, Izmjena, Brisanje i
              Knjiženje
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-3">Uloga (Role)</th>
                    <th className="p-3">Opis odgovornosti</th>
                    <th className="p-3 text-center w-20">Read</th>
                    <th className="p-3 text-center w-20">Create</th>
                    <th className="p-3 text-center w-20">Update</th>
                    <th className="p-3 text-center w-20">Delete</th>
                    <th className="p-3 text-center w-20">Post</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {INITIAL_ROLES.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {role.name}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-sm">{role.description}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-3 w-3" />
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {(role.name as string) !== 'VIEWER' ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <X className="h-3 w-3" />
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {['ADMIN', 'MANAGER', 'WAREHOUSE'].includes(role.name) ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <X className="h-3 w-3" />
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {role.name === 'ADMIN' ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <X className="h-3 w-3" />
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {['ADMIN', 'MANAGER'].includes(role.name) ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <X className="h-3 w-3" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. WAREHOUSES */}
      {activeTab === 'warehouses' && (
        <DataTable
          columns={[
            {
              id: 'code',
              header: 'Šifra',
              accessor: (w: any) => <span className="font-mono font-bold text-slate-800">{w.code}</span>,
              sortable: true,
            },
            {
              id: 'name',
              header: 'Naziv objekta',
              accessor: (w: any) => <span className="font-semibold text-slate-900">{w.name}</span>,
              sortable: true,
            },
            {
              id: 'address',
              header: 'Lokacija / Adresa',
              accessor: (w: any) => <span className="text-slate-600">{w.address}</span>,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (w: any) => (
                <StatusBadge status={w.active ? 'AKTIVAN' : 'NEAKTIVAN'} />
              ),
            },
          ]}
          data={warehouses}
          keyExtractor={(w: any) => w.id}
        />
      )}

      {/* 4. PAYMENTS */}
      {activeTab === 'payments' && (
        <DataTable
          columns={[
            {
              id: 'code',
              header: 'Kod',
              accessor: (p: any) => <span className="font-mono font-bold text-slate-800">{p.code}</span>,
            },
            {
              id: 'name',
              header: 'Naziv načina plaćanja',
              accessor: (p: any) => <span className="font-medium text-slate-900">{p.name}</span>,
            },
            {
              id: 'fiscal',
              header: 'Fiskalizira se',
              accessor: (p: any) => (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono ${
                    p.fiscal ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p.fiscal ? 'DA' : 'NE'}
                </span>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (p: any) => (
                <StatusBadge status={p.active ? 'AKTIVAN' : 'NEAKTIVAN'} />
              ),
            },
          ]}
          data={paymentMethods}
          keyExtractor={(p: any) => p.id}
        />
      )}

      {/* 5. VAT */}
      {activeTab === 'vat' && (
        <DataTable
          columns={[
            {
              id: 'name',
              header: 'Naziv porezne stope',
              accessor: (t: any) => <span className="font-semibold text-slate-900">{t.name}</span>,
            },
            {
              id: 'rate',
              header: 'Stopa (%)',
              accessor: (t: any) => (
                <span className="font-mono font-bold text-emerald-800 text-sm">{t.rate}%</span>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (t: any) => (
                <StatusBadge status={t.active ? 'AKTIVAN' : 'NEAKTIVAN'} />
              ),
            },
          ]}
          data={taxRates}
          keyExtractor={(t: any) => t.id}
        />
      )}

      {/* Modal for adding a user */}
      <FormDialog
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Kreiranje novog korisničkog naloga"
        subtitle="Dodijelite pristup i ulogu za rad u Uzeh ERP sistemu"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Ime i prezime *</label>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="npr. Haris Dedić"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">E-mail adresa *</label>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="ime.prezime@uzeh.ba"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Sistemska uloga</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ADMIN">ADMIN (Puni pristup)</option>
              <option value="MANAGER">MANAGER (Voditelj poslovanja)</option>
              <option value="WAREHOUSE">WAREHOUSE (Skladištar)</option>
              <option value="SALES">SALES (Kasa / Prodaja)</option>
              <option value="VIEWER">VIEWER (Samo pregled)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Odustani
            </button>
            <button
              type="button"
              onClick={handleCreateUser}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 font-semibold text-white hover:bg-emerald-700 shadow-xs"
            >
              Kreiraj nalog
            </button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};
