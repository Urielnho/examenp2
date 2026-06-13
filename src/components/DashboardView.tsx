/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Bell,
  MessageSquare,
  RefreshCw,
  MessageCircle,
  PlusCircle,

  PackageCheck,
  Clock,
  XCircle,
  Mail,
  SearchCheck,
  Loader2,
  Handshake,
  Megaphone,
  HeartHandshake,
  MapPin
} from 'lucide-react';
import { LostOrFoundItem, ActivityLog, NavigationTab, ItemStatus, ContactMessage } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { api } from '../api';

interface DashboardProps {
  onNavigate: (tab: NavigationTab) => void;
  onSetReportType: (status: ItemStatus) => void;
  items: LostOrFoundItem[];
  userName: string;
  userEmail: string;
  logs: ActivityLog[];
}

export function DashboardView({
  onNavigate,
  onSetReportType,
  items,
  userName,
  userEmail,
  logs,
}: DashboardProps) {

  const [claims, setClaims]             = useState<ContactMessage[]>([]);
  const [foundReports, setFoundReports] = useState<ContactMessage[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (userEmail) {
      api.contact.myClaims(userEmail).then(setClaims).catch(console.error);
      api.contact.foundForMe(userEmail).then(setFoundReports).catch(console.error);
    }
  }, [userEmail]);

  const handleConfirm = async (id: string, role: 'owner' | 'finder', source: 'claims' | 'found') => {
    setConfirmingId(id);
    try {
      const res = await api.contact.confirmDelivery(id, role);
      const patch = (m: ContactMessage) =>
        m.id === id
          ? { ...m, owner_confirmed: role === 'owner' ? true : m.owner_confirmed,
                    finder_confirmed: role === 'finder' ? true : m.finder_confirmed }
          : m;
      if (source === 'claims')  setClaims(prev => prev.map(patch));
      else                      setFoundReports(prev => prev.map(patch));
      if (res.both_confirmed) {
        alert('¡Ambas partes confirmaron la entrega! El objeto fue marcado como recuperado y se quitará del buscador.');
      }
    } catch { alert('Error al confirmar. Intenta de nuevo.'); }
    finally { setConfirmingId(null); }
  };

  const handleReportAction = (status: ItemStatus) => {
    onSetReportType(status);
    onNavigate(NavigationTab.CREATE_REPORT);
  };

  // Stats reales desde items
  const myItems = items.filter(i => i.reportedEmail === userEmail);
  const myLostItems  = myItems.filter(i => i.status === ItemStatus.LOST);
  const activeReports = myLostItems.length;
  const foundCount = items.filter(i => i.status === ItemStatus.FOUND).length;

  // Últimos 3 logs reales
  const recentLogs = logs.slice(0, 3);

  const getLogIcon = (action: string) => {
    if (action.includes('Encontrado')) return <PlusCircle className="w-2.5 h-2.5 animate-bounce" />;
    if (action.includes('Perdido'))    return <PlusCircle className="w-2.5 h-2.5 animate-bounce" />;
    if (action.includes('Reclamó'))    return <MessageCircle className="w-2.5 h-2.5" />;
    return <RefreshCw className="w-2.5 h-2.5 animate-spin" />;
  };

  const getLogColors = (action: string) => {
    if (action.includes('Encontrado')) return 'bg-emerald-100 text-emerald-600';
    if (action.includes('Perdido'))    return 'bg-slate-100 text-slate-500';
    if (action.includes('Reclamó'))    return 'bg-emerald-100 text-emerald-600';
    return 'bg-blue-100 text-[#004ac6]';
  };

  return (
    <div className="flex flex-col gap-6 text-left animate-fadeIn font-sans">
      <Breadcrumb />

      {/* Main Title Section */}
      <section className="flex flex-col gap-1 col-span-full">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          ¡Hola de nuevo, {userName}!
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">
          Aquí tienes un resumen detallado y en tiempo real de tus reportes de pertenencias en la plataforma.
        </p>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col gap-3 hover:translate-y-[-2px] transition-transform duration-200">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none font-mono">{activeReports}</p>
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-1 font-mono">Reportes Activos</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col gap-3 hover:translate-y-[-2px] transition-transform duration-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none font-mono">{foundCount}</p>
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-1 font-mono">Objetos Encontrados</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col gap-3 hover:translate-y-[-2px] transition-transform duration-200 relative">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bell className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none font-mono">{logs.length}</p>
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-1 font-mono">Actividad Total</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col gap-3 hover:translate-y-[-2px] transition-transform duration-200">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MessageSquare className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none font-mono">{items.length}</p>
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-1 font-mono">Total en Plataforma</p>
          </div>
        </div>
      </section>


      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleReportAction(ItemStatus.LOST)}
          className="flex items-center gap-3 bg-[#004ac6] hover:bg-[#004ac6]/90 text-white rounded-xl px-5 py-4 font-semibold text-sm shadow-sm transition-all cursor-pointer"
        >
          <Megaphone className="w-5 h-5 shrink-0" />
          <div className="text-left">
            <p className="font-bold">Perdí un Objeto</p>
            <p className="text-xs text-blue-200 font-normal">Crear nuevo reporte de pérdida</p>
          </div>
        </button>
        <button
          onClick={() => handleReportAction(ItemStatus.FOUND)}
          className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-4 font-semibold text-sm shadow-sm transition-all cursor-pointer"
        >
          <HeartHandshake className="w-5 h-5 shrink-0" />
          <div className="text-left">
            <p className="font-bold">Encontré un Objeto</p>
            <p className="text-xs text-emerald-200 font-normal">Reportar hallazgo de objeto ajeno</p>
          </div>
        </button>
      </section>

      {/* Mis Reportes */}
      {myItems.length > 0 && (
      <section className="flex flex-col gap-4 mt-2">
        <h3 className="text-base font-extrabold text-slate-900">Mis Reportes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {myItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-100"
              />
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                    item.status === ItemStatus.LOST
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {item.status === ItemStatus.LOST ? 'Perdido' : 'Encontrado'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Mis Solicitudes de Devolución */}
      {claims.length > 0 && (
      <section className="flex flex-col gap-4 mt-2">
        <h3 className="text-base font-extrabold text-slate-900">Mis Solicitudes de Entrega</h3>
        <div className="flex flex-col gap-3">
          {claims.map(claim => {
            const isFoundReport = claim.subject?.startsWith('Reporte de hallazgo');
            const isPending  = claim.status === 'pending';
            const isApproved = claim.status === 'approved';
            const isRejected = claim.status === 'rejected';
            // Si es found_report el usuario es el FINDER; si es claim el usuario es el OWNER
            const userRole: 'owner' | 'finder' = isFoundReport ? 'finder' : 'owner';
            const alreadyConfirmed = isFoundReport ? !!claim.finder_confirmed : !!claim.owner_confirmed;
            const otherConfirmed   = isFoundReport ? !!claim.owner_confirmed  : !!claim.finder_confirmed;
            const itemName = claim.subject
              ?.replace('Reporte de hallazgo: ', '')
              .replace('Solicitud de devolución: ', '') || 'Objeto';

            return (
              <div key={claim.id} className={`bg-white rounded-xl border p-4 flex flex-col gap-3 ${
                isApproved ? 'border-emerald-200' : isRejected ? 'border-rose-200' : 'border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isFoundReport
                      ? <SearchCheck className={`w-4 h-4 shrink-0 ${isApproved ? 'text-emerald-500' : 'text-[#004ac6]'}`} />
                      : <PackageCheck className={`w-4 h-4 shrink-0 ${isApproved ? 'text-emerald-500' : isRejected ? 'text-rose-400' : 'text-slate-400'}`} />
                    }
                    <p className="text-xs font-bold text-slate-800 truncate">{itemName}</p>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                    isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isRejected ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {isApproved ? 'Aprobada' : isRejected ? 'Rechazada' : 'Pendiente'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{claim.message}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" /> {claim.created_at}
                </div>

                {isApproved && claim.finder_email && (
                  <a
                    href={`mailto:${claim.finder_email}?subject=${encodeURIComponent('Coordinación de entrega - FindIt')}&body=${encodeURIComponent('Hola,\n\nMe comunico contigo a través de FindIt para coordinar la entrega.\n\n')}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" /> {claim.finder_email}
                  </a>
                )}

                {isApproved && !alreadyConfirmed && (
                  <button
                    onClick={() => handleConfirm(claim.id, userRole, 'claims')}
                    disabled={confirmingId === claim.id}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer transition-all"
                  >
                    {confirmingId === claim.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Handshake className="w-4 h-4" />
                    }
                    {isFoundReport ? 'Ya entregué el objeto' : 'Ya recibí mi objeto'}
                  </button>
                )}

                {isApproved && alreadyConfirmed && !otherConfirmed && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Tu confirmación fue enviada. Esperando confirmación de la otra parte.
                  </div>
                )}

                {isApproved && alreadyConfirmed && otherConfirmed && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ¡Entrega completada y verificada! El objeto fue recuperado.
                  </div>
                )}

                {isRejected && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    Solicitud rechazada por el coordinador.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* Encontraron mis objetos perdidos */}
      {foundReports.length > 0 && (
      <section className="flex flex-col gap-4 mt-2">
        <h3 className="text-base font-extrabold text-slate-900">Encontraron tus Objetos Perdidos</h3>
        <div className="flex flex-col gap-3">
          {foundReports.map(report => {
            const isPending      = report.status === 'pending';
            const isApproved     = report.status === 'approved';
            const isRejected     = report.status === 'rejected';
            const itemName       = report.subject?.replace('Reporte de hallazgo: ', '') || 'Tu objeto';
            const alreadyConfirmed = !!report.owner_confirmed;
            const finderConfirmed  = !!report.finder_confirmed;
            return (
              <div key={report.id} className={`bg-white rounded-xl border p-4 flex flex-col gap-3 ${
                isApproved ? 'border-emerald-300 bg-emerald-50/30' : isRejected ? 'border-rose-200' : 'border-blue-200 bg-blue-50/20'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <SearchCheck className={`w-4 h-4 shrink-0 ${isApproved ? 'text-emerald-500' : isPending ? 'text-[#004ac6]' : 'text-slate-400'}`} />
                    <p className="text-xs font-bold text-slate-800 truncate">{itemName}</p>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                    isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isRejected ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-blue-50 text-[#004ac6] border-blue-200'
                  }`}>
                    {isApproved ? 'Entrega Aprobada' : isRejected ? 'Rechazado' : 'Pendiente revisión'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{report.message}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" /> {report.created_at}
                </div>

                {isApproved && report.finder_contact && (
                  <a
                    href={`mailto:${report.finder_contact}?subject=${encodeURIComponent('Coordinación de entrega - FindIt')}&body=${encodeURIComponent('Hola,\n\nMe comunico contigo a través de FindIt. Me avisaron que encontraste mi objeto y me gustaría coordinar la entrega.\n\n')}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" /> {report.finder_contact}
                  </a>
                )}

                {isApproved && !alreadyConfirmed && (
                  <button
                    onClick={() => handleConfirm(report.id, 'owner', 'found')}
                    disabled={confirmingId === report.id}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer transition-all"
                  >
                    {confirmingId === report.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Handshake className="w-4 h-4" />
                    }
                    Ya recibí mi objeto
                  </button>
                )}

                {isApproved && alreadyConfirmed && !finderConfirmed && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Confirmaste la recepción. Esperando confirmación de quien lo encontró.
                  </div>
                )}

                {isApproved && alreadyConfirmed && finderConfirmed && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ¡Entrega completada y verificada! El objeto fue recuperado.
                  </div>
                )}

                {isPending && (
                  <div className="flex items-center gap-1.5 text-xs text-[#004ac6] font-semibold bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                    <Bell className="w-3.5 h-3.5 shrink-0" />
                    El coordinador está revisando el reporte. Te avisaremos cuando aprueben.
                  </div>
                )}

                {isRejected && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    El coordinador rechazó este reporte de hallazgo.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* Activity Timeline Feed */}
      <section className="flex flex-col gap-4 mt-2">
        <h3 className="text-base font-extrabold text-slate-900">Actividad Reciente en la Plataforma</h3>

        {recentLogs.length === 0 ? (
          <p className="text-slate-400 text-xs font-semibold py-4">No hay actividad registrada aún.</p>
        ) : (
          <div className="flex flex-col relative pl-6 before:absolute before:left-2 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100">
            {recentLogs.map((log, idx) => (
              <div key={log.id} className={idx < recentLogs.length - 1 ? 'mb-6 relative' : 'relative'}>
                <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white ${getLogColors(log.action)}`}>
                  {getLogIcon(log.action)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-[#0b1c30] text-xs">{log.action}</span>
                  <p className="text-slate-500 text-xs font-normal">
                    {log.user} · {log.itemCategory}
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider mt-1 uppercase font-mono">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
