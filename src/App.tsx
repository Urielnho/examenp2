/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  NavigationTab,
  LostOrFoundItem,
  ItemStatus,
  ModerationItem,
  AppUser,
  UserRole,
  UserStatus,
  ActivityLog,
  ItemCategory,
  AppStats,
} from './types';

import { api } from './api';

// Modular View Imports
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { DashboardView } from './components/DashboardView';
import { CreateReportView } from './components/CreateReportView';
import { SearchView } from './components/SearchView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ModerationView } from './components/ModerationView';
import { UserManagementView } from './components/UserManagementView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { LoginView } from './components/LoginView';
import { AnalyticsOverviewView } from './components/AnalyticsOverviewView';
import { MessagesView } from './components/MessagesView';
import { ItemDetailModal } from './components/ItemDetailModal';

// Route ↔ NavigationTab mapping
const ROUTE_MAP: Record<NavigationTab, string> = {
  [NavigationTab.HOME]:            '/',
  [NavigationTab.SEARCH]:          '/buscar',
  [NavigationTab.DASHBOARD]:       '/panel',
  [NavigationTab.CREATE_REPORT]:   '/crear',
  [NavigationTab.ABOUT]:           '/nosotros',
  [NavigationTab.CONTACT]:         '/soporte',
  [NavigationTab.LOGIN]:           '/login',
  [NavigationTab.ADMIN_DASHBOARD]: '/admin',
  [NavigationTab.MODERATION]:      '/admin/moderacion',
  [NavigationTab.USERS]:           '/admin/usuarios',
  [NavigationTab.ANALYTICS]:       '/admin/analitica',
  [NavigationTab.MESSAGES]:        '/admin/mensajes',
};

const PATH_TO_TAB: Record<string, NavigationTab> = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([tab, path]) => [path, tab as NavigationTab])
);

export default function App() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const activeTab = PATH_TO_TAB[location.pathname] ?? NavigationTab.HOME;

  // Permissions State
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic Data Lists
  const [items,           setItems]           = useState<LostOrFoundItem[]>([]);
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [users,           setUsers]           = useState<AppUser[]>([]);
  const [logs,            setLogs]            = useState<ActivityLog[]>([]);
  const [stats,           setStats]           = useState<AppStats | null>(null);

  // Active User session
  const [userSession, setUserSession] = useState({ name: '', email: '', role: UserRole.USER });

  useEffect(() => {
    api.items.list().then(setItems).catch(console.error);
    api.moderation.list().then(setModerationItems).catch(console.error);
    api.users.list().then(setUsers).catch(console.error);
    api.logs.list().then(setLogs).catch(console.error);
    api.stats.summary().then(setStats).catch(console.error);
  }, []);

  // Flow state
  const [selectedDetailItem, setSelectedDetailItem] = useState<LostOrFoundItem | null>(null);
const [reportStatusPreset,         setReportStatusPreset]         = useState<ItemStatus>(ItemStatus.LOST);
  const [searchQueryPreset,          setSearchQueryPreset]          = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Navigation helper – accepts NavigationTab for backward compat
  const handleNavigate = (tab: NavigationTab) => {
    navigate(ROUTE_MAP[tab] ?? '/');
    setSearchQueryPreset('');
  };

  // --- Action Handlers ---

  const handleAddNewReportSubmit = async (newReport: Partial<LostOrFoundItem>): Promise<void> => {
    const freshItem: LostOrFoundItem = {
      id: `item-${Date.now()}`,
      name: newReport.name || 'Objeto sin Nombre',
      category: newReport.category || ItemCategory.OTHER,
      categoryLabel: newReport.categoryLabel || 'Otra categoría',
      status: newReport.status || ItemStatus.LOST,
      primaryColor: newReport.primaryColor || 'Sin especificar',
      brand: newReport.brand || 'Sin especificar',
      description: newReport.description || 'No se proporcionó descripción.',
      date: newReport.date || new Date().toISOString().split('T')[0],
      location: newReport.location || 'Coordenadas desconocidas',
      locationContext: newReport.locationContext || '',
      imageUrl: newReport.imageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
      reportedBy: userSession.name,
      reportedEmail: userSession.email
    };

    await api.moderation.submit(freshItem);
    setModerationItems([{
      id: freshItem.id,
      name: freshItem.name,
      category: freshItem.categoryLabel,
      status: ItemStatus.PENDING,
      description: freshItem.description,
      date: freshItem.date,
      location: freshItem.location,
      reportedBy: freshItem.reportedBy ?? '',
      reportedEmail: freshItem.reportedEmail ?? '',
      imageUrl: freshItem.imageUrl,
    }, ...moderationItems]);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      user: userSession.name,
      action: freshItem.status === ItemStatus.LOST ? 'Reportó Objeto Perdido' : 'Reportó Objeto Encontrado',
      itemCategory: freshItem.categoryLabel,
      time: new Date().toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };
    setLogs([newLog, ...logs]);
    api.logs.create(newLog).catch(console.error);
  };

  const handleApproveModerationItem = (id: string) => {
    const targetModItem = moderationItems.find(m => m.id === id);
    if (!targetModItem) return;

    const validatedItem: LostOrFoundItem = {
      id: `item-from-mod-${targetModItem.id}`,
      name: targetModItem.name,
      category: ItemCategory.OTHER,
      categoryLabel: targetModItem.category,
      status: targetModItem.status as ItemStatus || ItemStatus.LOST,
      primaryColor: 'Sin especificar',
      brand: 'Sin especificar',
      description: targetModItem.description,
      date: targetModItem.date,
      location: targetModItem.location,
      locationContext: '',
      imageUrl: targetModItem.imageUrl
    };

    setItems([validatedItem, ...items]);
    setModerationItems(moderationItems.filter(m => m.id !== id));
    displayToast(`Aprobado con éxito: "${validatedItem.name}" ya es público.`);
    api.moderation.approve(id).catch(console.error);
  };

  const handleRejectModerationItem = (id: string) => {
    setModerationItems(moderationItems.filter(m => m.id !== id));
    displayToast('Reporte rechazado y eliminado de las listas pendientes.');
    api.moderation.reject(id).catch(console.error);
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
        displayToast(`El estado de la cuenta cambió a ${nextStatus === UserStatus.ACTIVE ? 'Activo' : 'Suspendido'}.`);
        api.users.toggleStatus(id).catch(console.error);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleAddInvitedUser = (newUser: AppUser) => {
    setUsers([...users, newUser]);
    displayToast(`Claves de acceso de invitación enviadas a ${newUser.email}`);
    api.users.create(newUser).catch(console.error);
  };

  const handleAuthLoginSuccess = (name: string, email: string, isAdminStatus: boolean) => {
    setUserSession({ name, email, role: isAdminStatus ? UserRole.ADMIN : UserRole.USER });
    setIsAdmin(isAdminStatus);
    setIsLoggedIn(true);
    displayToast(`Sesión iniciada: Autenticado como ${name}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserSession({ name: '', email: '', role: UserRole.USER });
    displayToast('Sesión cerrada correctamente.');
    navigate('/');
  };

  const handleAuditItemDetails = (item: LostOrFoundItem) => {
    setSelectedDetailItem(item);
  };

  // Shorthand props used in multiple routes
  const adminViews = {
    onNavigate: handleNavigate,
    moderationItems,
    onApproveModeration: handleApproveModerationItem,
    onRejectModeration:  handleRejectModerationItem,
    stats,
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4FC] text-slate-800 font-sans leading-relaxed selection:bg-[#004ac6]/10 selection:text-[#004ac6] relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-slate-800 text-white shadow-2xl rounded-xl text-xs font-bold leading-tight flex items-center gap-2 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        userName={userSession.name}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onOpenMenu={() => setSidebarOpen(true)}
        logs={logs}
      />

      <div className="flex-1 max-w-[1400px] w-full mx-auto flex">
        <Sidebar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0 flex flex-col justify-between overflow-x-hidden relative">
          <div className="w-full">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                <HomeView items={items} stats={stats} onNavigate={handleNavigate}
                  onSetReportType={setReportStatusPreset} onSearchQuery={setSearchQueryPreset}
                  onViewItemDetail={handleAuditItemDetails} />
              } />
              <Route path="/buscar" element={
                <SearchView items={items}
                  onViewItemDetail={handleAuditItemDetails} initialQuery={searchQueryPreset} />
              } />
              <Route path="/nosotros" element={<AboutView onNavigate={handleNavigate} />} />
              <Route path="/soporte" element={<ContactView />} />
              <Route path="/login"   element={
                isLoggedIn
                  ? <Navigate to="/" replace />
                  : <LoginView onLoginSuccess={handleAuthLoginSuccess} />
              } />

              {/* User-protected routes */}
              <Route path="/panel" element={
                !isLoggedIn ? <Navigate to="/login" replace state={{ from: location.pathname }} /> :
                isAdmin
                  ? <AdminDashboardView {...adminViews} />
                  : <DashboardView items={items} userName={userSession.name}
                      userEmail={userSession.email} logs={logs}
                      onNavigate={handleNavigate} onSetReportType={setReportStatusPreset} />
              } />
              <Route path="/crear" element={
                !isLoggedIn ? <Navigate to="/login" replace state={{ from: location.pathname }} /> :
                <CreateReportView onNavigate={handleNavigate} onSubmitReport={handleAddNewReportSubmit}
                  initialStatus={reportStatusPreset} userName={userSession.name}
                  userEmail={userSession.email} />
              } />
              {/* Admin-protected routes */}
              <Route path="/admin" element={
                !isLoggedIn ? <Navigate to="/login" replace state={{ from: location.pathname }} /> :
                !isAdmin    ? <Navigate to="/" replace /> :
                <AdminDashboardView {...adminViews} />
              } />
              <Route path="/admin/moderacion" element={
                !isLoggedIn ? <Navigate to="/login" replace state={{ from: location.pathname }} /> :
                !isAdmin    ? <Navigate to="/" replace /> :
                <ModerationView {...adminViews} />
              } />
              <Route path="/admin/usuarios" element={
                !isLoggedIn ? <Navigate to="/login" replace state={{ from: location.pathname }} /> :
                !isAdmin    ? <Navigate to="/" replace /> :
                <UserManagementView users={users}
                  onToggleUserStatus={handleToggleUserStatus} onAddUser={handleAddInvitedUser} />
              } />
              <Route path="/admin/analitica" element={
                !isLoggedIn ? <Navigate to="/login" replace state={{ from: location.pathname }} /> :
                !isAdmin    ? <Navigate to="/" replace /> :
                <AnalyticsOverviewView stats={stats} />
              } />
              <Route path="/admin/mensajes" element={
                !isLoggedIn ? <Navigate to="/login" replace state={{ from: location.pathname }} /> :
                !isAdmin    ? <Navigate to="/" replace /> :
                <MessagesView />
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <footer className="border-t border-slate-200/50 pt-6 mt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between flex-wrap gap-4 select-none">
            <span>&copy; 2026 FindIt — Proyecto</span>
            <span>Desarrollo Web Profesional</span>
          </footer>
        </main>
      </div>

      {selectedDetailItem && (
        <ItemDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          userName={userSession.name}
          userEmail={userSession.email}
          onContactReporter={() => {
            const email = selectedDetailItem?.reportedEmail;
            const itemName = selectedDetailItem?.name;
            setSelectedDetailItem(null);
            if (email) {
              window.open(
                `mailto:${email}?subject=${encodeURIComponent(`Consulta sobre tu reporte: ${itemName}`)}&body=${encodeURIComponent(`Hola,\n\nMe comunico contigo por el reporte "${itemName}" publicado en FindIt.\n\n`)}`,
                '_blank'
              );
            } else {
              navigate('/soporte');
            }
          }}
        />
      )}
    </div>
  );
}
