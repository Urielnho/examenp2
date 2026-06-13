/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogIn, Shield, LayoutDashboard, LogOut, ChevronDown, Gavel, Users, LineChart, MessageSquare, BarChart2 } from 'lucide-react';
import { NavigationTab, ActivityLog } from '../types';

interface NavbarProps {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  onLogout: () => void;
  onOpenMenu: () => void;
  userName: string;
  logs: ActivityLog[];
}

export function Navbar({
  activeTab,
  onNavigate,
  isAdmin,
  isLoggedIn,
  onLogout,
  onOpenMenu,
  userName,
  logs,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const adminSections = [
    { tab: NavigationTab.ADMIN_DASHBOARD, label: 'Control General',     icon: BarChart2 },
    { tab: NavigationTab.MODERATION,      label: 'Cola de Moderación',  icon: Gavel },
    { tab: NavigationTab.USERS,           label: 'Gestión de Usuarios', icon: Users },
    { tab: NavigationTab.ANALYTICS,       label: 'Analíticas de Red',   icon: LineChart },
    { tab: NavigationTab.MESSAGES,        label: 'Mensajes de Soporte', icon: MessageSquare },
  ];

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  const recentLogs = logs.slice(0, 3);
  const badgeCount = recentLogs.length;

  const getLogColor = (action: string) => {
    if (action.includes('Encontrado')) return 'text-emerald-600';
    if (action.includes('Perdido'))    return 'text-slate-700';
    if (action.includes('Reclamó'))    return 'text-emerald-600';
    return 'text-[#004ac6]';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 shadow-sm flex items-center justify-between px-4 md:px-6 h-16 w-full">
      {/* Brand & Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          aria-label="Menú"
          className="text-primary hover:bg-slate-100 transition-colors duration-200 p-2 rounded-full cursor-pointer md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div
          onClick={() => onNavigate(NavigationTab.HOME)}
          className="text-2xl font-bold text-[#004ac6] cursor-pointer tracking-tight select-none flex items-center gap-1.5"
        >
          <span>FindIt</span>
        </div>

        {/* Admin badge (solo si está logueado como admin) */}
        {isLoggedIn && isAdmin && (
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border bg-[#004ac6]/10 text-[#004ac6] border-[#004ac6]/30 ml-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Modo Admin</span>
          </span>
        )}
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-6">
        <button
          onClick={() => onNavigate(NavigationTab.HOME)}
          className={`font-medium text-sm transition-colors py-5 ${
            activeTab === NavigationTab.HOME
              ? 'text-[#004ac6] border-b-2 border-[#004ac6] mt-[2px]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Inicio
        </button>
        {isLoggedIn && !isAdmin && (
          <button
            onClick={() => onNavigate(NavigationTab.DASHBOARD)}
            className={`font-medium text-sm transition-colors py-5 ${
              activeTab === NavigationTab.DASHBOARD
                ? 'text-[#004ac6] border-b-2 border-[#004ac6] mt-[2px]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Mi Panel
          </button>
        )}
        <button
          onClick={() => onNavigate(NavigationTab.SEARCH)}
          className={`font-medium text-sm transition-colors py-5 ${
            activeTab === NavigationTab.SEARCH
              ? 'text-[#004ac6] border-b-2 border-[#004ac6] mt-[2px]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Búsqueda
        </button>
        <button
          onClick={() => onNavigate(NavigationTab.ABOUT)}
          className={`font-medium text-sm transition-colors py-5 ${
            activeTab === NavigationTab.ABOUT
              ? 'text-[#004ac6] border-b-2 border-[#004ac6] mt-[2px]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Nosotros
        </button>
        <button
          onClick={() => onNavigate(NavigationTab.CONTACT)}
          className={`font-medium text-sm transition-colors py-5 ${
            activeTab === NavigationTab.CONTACT
              ? 'text-[#004ac6] border-b-2 border-[#004ac6] mt-[2px]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Soporte
        </button>
        {isLoggedIn && isAdmin && (
          <div className="relative" ref={adminMenuRef}>
            <button
              onClick={() => { setShowAdminMenu(!showAdminMenu); setShowNotifications(false); setShowUserMenu(false); }}
              className={`font-medium text-sm transition-colors py-5 flex items-center gap-1 ${
                adminSections.some(s => s.tab === activeTab)
                  ? 'text-[#004ac6] border-b-2 border-[#004ac6] mt-[2px]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Admin
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdminMenu ? 'rotate-180' : ''}`} />
            </button>
            {showAdminMenu && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {adminSections.map(({ tab, label, icon: Icon }) => (
                  <button
                    key={tab}
                    onClick={() => { onNavigate(tab); setShowAdminMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-colors text-left ${
                      activeTab === tab
                        ? 'bg-[#e5eeff] text-[#004ac6]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="p-2 text-gray-500 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {badgeCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 font-semibold text-xs text-gray-400 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
                    <span>ACTIVIDAD RECIENTE</span>
                    {badgeCount > 0 && (
                      <span className="text-[#004ac6] rounded-full px-1.5 bg-[#004ac6]/10 text-[10px]">{badgeCount} registros</span>
                    )}
                  </div>
                  <div className="flex flex-col text-sm max-h-60 overflow-y-auto divide-y divide-gray-50">
                    {recentLogs.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 text-center">Sin actividad reciente.</p>
                    ) : (
                      recentLogs.map(log => (
                        <div
                          key={log.id}
                          onClick={() => { onNavigate(NavigationTab.DASHBOARD); setShowNotifications(false); }}
                          className="p-3 hover:bg-slate-50 cursor-pointer text-left"
                        >
                          <p className={`font-semibold text-xs ${getLogColor(log.action)}`}>{log.action}</p>
                          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{log.user} · {log.itemCategory}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block font-mono">{log.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="h-10 w-10 rounded-full bg-[#004ac6] flex items-center justify-center text-white font-bold text-xs hover:ring-2 hover:ring-[#004ac6]/50 transition-all cursor-pointer border border-[#004ac6]/30"
              >
                {isAdmin ? <LayoutDashboard className="w-4 h-4" /> : initials}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 bg-slate-50">
                    <p className="font-bold text-slate-800 text-xs truncate">{userName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{isAdmin ? 'Administrador' : 'Usuario'}</p>
                  </div>
                  <button
                    onClick={() => { onLogout(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => onNavigate(NavigationTab.LOGIN)}
            className="flex items-center gap-1.5 px-4 h-9 bg-[#004ac6] text-white rounded-lg text-xs font-bold hover:bg-[#004ac6]/90 transition-colors shadow-sm cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>
        )}
      </div>
    </header>
  );
}
