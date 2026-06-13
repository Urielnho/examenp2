/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Home,
  LayoutDashboard,
  FilePlus,
  Search,
  Info,
  PhoneCall,
  LogIn,
  LogOut,
  Settings,
  Gavel,
  Users,
  LineChart,
  X,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function Sidebar({
  activeTab,
  onNavigate,
  isAdmin,
  isLoggedIn,
  isOpen,
  onClose,
  onLogout,
}: SidebarProps) {
  const getTabClass = (tab: NavigationTab) => {
    return activeTab === tab
      ? 'flex items-center gap-3 px-4 py-3 bg-[#e5eeff] text-[#004ac6] rounded-lg font-semibold text-sm transition-all duration-200'
      : 'flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-sm transition-all duration-200';
  };

  const navigate = (tab: NavigationTab) => {
    onNavigate(tab);
    onClose();
  };

  const publicTabs = [
    { tab: NavigationTab.HOME,    label: 'Página de Inicio',   icon: Home },
    { tab: NavigationTab.SEARCH,  label: 'Búsqueda General',   icon: Search },
    { tab: NavigationTab.ABOUT,   label: 'Acerca de Nosotros', icon: Info },
    { tab: NavigationTab.CONTACT, label: 'Soporte y FAQs',     icon: PhoneCall },
  ];

  const userTabs = [
    { tab: NavigationTab.DASHBOARD,     label: 'Mi Panel de Control', icon: LayoutDashboard },
    { tab: NavigationTab.CREATE_REPORT, label: 'Reportar Objeto',     icon: FilePlus },
  ];

  const adminTabs = [
    { tab: NavigationTab.ADMIN_DASHBOARD, label: 'Control General',      icon: LineChart },
    { tab: NavigationTab.MODERATION,      label: 'Cola de Moderación',   icon: Gavel },
    { tab: NavigationTab.USERS,           label: 'Gestión de Usuarios',  icon: Users },
    { tab: NavigationTab.ANALYTICS,       label: 'Analíticas de Red',    icon: ShieldAlert },
    { tab: NavigationTab.MESSAGES,        label: 'Mensajes de Soporte',  icon: MessageSquare },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity duration-300 md:hidden"
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 h-full w-[280px] bg-white border-r border-gray-200/80 shadow-xl flex flex-col gap-2 p-4 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-1 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Navegación</span>
            <span className="text-lg font-bold text-[#004ac6]">FindIt Central</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-slate-900 rounded-full p-1.5 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {/* Tabs públicos */}
          {publicTabs.map(({ tab, label, icon: Icon }) => (
            <button key={tab} onClick={() => navigate(tab)} className={`${getTabClass(tab)} w-full text-left cursor-pointer`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          {/* Tabs de usuario (solo si hay sesión y NO es admin) */}
          {isLoggedIn && !isAdmin && (
            <>
              <div className="pt-4 pb-1 border-t border-slate-100 mt-4">
                <span className="px-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">Mi Cuenta</span>
              </div>
              {userTabs.map(({ tab, label, icon: Icon }) => (
                <button key={tab} onClick={() => navigate(tab)} className={`${getTabClass(tab)} w-full text-left cursor-pointer`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </>
          )}

          {/* Tabs de admin (solo si hay sesión y es admin) */}
          {isLoggedIn && isAdmin && (
            <>
              <div className="pt-4 pb-1 border-t border-slate-100 mt-4">
                <span className="px-4 text-[10px] uppercase font-bold tracking-widest text-[#004ac6]">🛡️ Administración</span>
              </div>
              {adminTabs.map(({ tab, label, icon: Icon }) => (
                <button key={tab} onClick={() => navigate(tab)} className={`${getTabClass(tab)} w-full text-left cursor-pointer`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-slate-100 pt-4 flex-shrink-0 space-y-1">
          <button
            onClick={() => { onNavigate(NavigationTab.CONTACT); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-sm w-full text-left"
          >
            <Settings className="w-4 h-4" />
            <span>Soporte Técnico</span>
          </button>

          {isLoggedIn ? (
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-lg text-sm w-full text-left font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(NavigationTab.LOGIN)}
              className="flex items-center gap-3 px-4 py-3 text-[#004ac6] hover:bg-[#e5eeff] rounded-lg text-sm w-full text-left font-semibold cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
