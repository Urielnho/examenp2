/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent } from 'react';
import { 
  UserPlus,
  Search,
  Edit,
  Ban,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { AppUser, UserRole, UserStatus } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { hasRealContent, isRepetitive, isGibberish } from '../utils/validation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface UserManagementViewProps {
  users: AppUser[];
  onToggleUserStatus: (id: string) => void;
  onAddUser: (user: AppUser) => void;
}

export function UserManagementView({
  users,
  onToggleUserStatus,
  onAddUser,
}: UserManagementViewProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Quick invite mock states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.USER);
  const [inviteError, setInviteError] = useState('');

  // Filters
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (roleFilter !== 'all') {
        if (u.role !== roleFilter) return false;
      }
      if (statusFilter !== 'all') {
        if (u.status !== statusFilter) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleInviteSubmit = (e: FormEvent) => {
    e.preventDefault();
    setInviteError('');

    const trimName = inviteName.trim();
    if (!trimName || trimName.length < 2)
      return setInviteError('El nombre debe tener al menos 2 caracteres.');
    if (!hasRealContent(trimName) || isRepetitive(trimName) || isGibberish(trimName))
      return setInviteError('El nombre debe contener palabras reales.');
    if (!EMAIL_RE.test(inviteEmail.trim()))
      return setInviteError('El correo no tiene un formato válido.');

    const newUser: AppUser = {
      id: `u-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: UserStatus.ACTIVE
    };

    onAddUser(newUser);
    setInviteName('');
    setInviteEmail('');
    setInviteError('');
    setShowInviteModal(false);
  };

  return (
    <div className="flex flex-col gap-6 text-left pb-16 animate-fadeIn font-sans">
      <Breadcrumb />

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 col-span-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#011B33] tracking-tight">
            Gestión General de Usuarios
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Revisa perfiles, audita credenciales de reportes públicos, asigna privilegios de administración y administra de inmediato el estado de accesos.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-[#004ac6] text-white px-4 h-11 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-[#004ac6]/90 transition-all shadow-sm cursor-pointer shrink-0 uppercase tracking-wider font-mono"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>Registrar Nuevo Miembro</span>
        </button>
      </div>

      {/* Invite Modal Popover */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form
            onSubmit={handleInviteSubmit}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200/50 p-6 flex flex-col gap-4 text-left animate-scaleUp font-sans"
          >
            <h3 className="font-extrabold text-slate-900 text-base">Registrar Miembro</h3>

            {inviteError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">{inviteError}</p>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Nombre Completo</label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Ej. Sarah Jenkins"
                maxLength={80}
                className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50/20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Correo Electrónico</label>
              <input
                type="text"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="correo@ejemplo.mx"
                maxLength={100}
                className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50/20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Rango (Nivel de Acceso)</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer"
              >
                <option value={UserRole.USER}>Reportante General</option>
                <option value={UserRole.ADMIN}>Administrador del Sistema</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer font-mono"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#004ac6] text-white rounded-lg text-xs font-bold hover:bg-[#004ac6]/90 transition-colors shadow-xs cursor-pointer font-mono uppercase tracking-wider"
              >
                Registrar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Filter and controls panel container */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/50 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            className="w-full pl-9 pr-4 h-10 border border-slate-200 bg-slate-50/50 rounded-lg text-xs outline-none focus:border-[#004ac6] placeholder:text-slate-400"
            placeholder="Buscar por nombre de usuario o correo electrónico..."
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-2 w-full md:w-auto self-start md:self-auto shrink-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto h-10 px-4 border border-slate-200 rounded-lg text-xs bg-white text-slate-600 outline-none cursor-pointer"
          >
            <option value="all">Todos los Roles de Acceso</option>
            <option value={UserRole.ADMIN}>Administrador</option>
            <option value={UserRole.USER}>Usuario Estándar</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto h-10 px-4 border border-slate-200 rounded-lg text-xs bg-white text-slate-600 outline-none cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value={UserStatus.ACTIVE}>Perfiles Activos</option>
            <option value={UserStatus.SUSPENDED}>Perfiles Suspendidos</option>
          </select>
        </div>
      </div>

      {/* Main SaaS User management table / mobile list */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/50 overflow-hidden col-span-full">
        {/* Desktop Table Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50 font-mono">
          <div className="col-span-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Colaborador / Cuenta</div>
          <div className="col-span-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Permisos Asignados</div>
          <div className="col-span-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Estado del Perfil</div>
          <div className="col-span-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Moderación</div>
        </div>

        {/* Dynamic Card/Row Loop elements */}
        <div className="flex flex-col divide-y divide-slate-100">
          {filteredUsers.map((user) => {
            const isSuspended = user.status === UserStatus.SUSPENDED;
            const fallbackInitials = user.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={user.id}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-5 md:px-6 md:py-4 items-center hover:bg-slate-50/20 transition-all ${
                  isSuspended ? 'opacity-70 bg-slate-50/10' : ''
                }`}
              >
                {/* Visual Avatar detail */}
                <div className="md:col-span-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-[#e5eeff] text-[#004ac6] flex items-center justify-center font-black text-xs font-mono">
                    {user.imageUrl ? (
                      <img
                        alt={user.name}
                        className={`w-full h-full object-cover ${isSuspended ? 'grayscale' : ''}`}
                        src={user.imageUrl}
                      />
                    ) : (
                      <span>{fallbackInitials}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0b1c30] text-sm shrink-0 leading-tight">
                      {user.name}
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5 leading-none font-mono">{user.email}</p>
                  </div>
                </div>

                {/* Scope Role Column */}
                <div className="md:col-span-3 flex items-center justify-between md:justify-center">
                  <span className="md:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Permisos</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono ${
                    user.role === UserRole.ADMIN
                      ? 'bg-blue-50 text-[#004ac6] border border-blue-100'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                    {user.role === UserRole.ADMIN ? 'Administrador' : 'Usuario General'}
                  </span>
                </div>

                {/* Account status check */}
                <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                  <span className="md:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Estado de Acceso</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    isSuspended ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full bg-current ${!isSuspended ? 'animate-pulse' : ''}`}></span>
                    <span>{isSuspended ? 'Suspendido' : 'Activo'}</span>
                  </span>
                </div>

                {/* Controls triggers */}
                <div className="md:col-span-2 flex items-center justify-end gap-1 pt-2 sm:pt-0 border-t border-slate-50 md:border-t-0">
                  <button
                    onClick={() => onToggleUserStatus(user.id)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isSuspended
                        ? 'text-emerald-600 hover:bg-emerald-50'
                        : 'text-rose-600 hover:bg-rose-50'
                    }`}
                    title={isSuspended ? 'Reactivar acceso' : 'Suspender perfil de la red'}
                  >
                    {isSuspended ? <UserCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table footer Pagination controls */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 flex-wrap gap-4 font-mono">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
            Mostrando 1 a {filteredUsers.length} de {users.length} perfiles de auditoría
          </span>
          <div className="flex gap-1.5 shrink-0">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#004ac6] text-white font-bold text-xs shadow-xs">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white font-bold text-xs" disabled>2</button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-201 text-slate-600 hover:bg-white border-slate-200" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
