/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Users,
  FileCheck,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Gavel,
  Check,
  X,

  PackageCheck,
  SearchCheck,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { NavigationTab, ModerationItem, AppStats, ContactMessage } from '../types';
import { api } from '../api';
import { Breadcrumb } from './Breadcrumb';

interface AdminDashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  moderationItems: ModerationItem[];
  onApproveModeration: (id: string) => void;
  onRejectModeration: (id: string) => void;
  stats: AppStats | null;
}

export function AdminDashboardView({
  onNavigate,
  moderationItems,
  onApproveModeration,
  onRejectModeration,
  stats,
}: AdminDashboardViewProps) {
  const [chartData, setChartData]         = useState<{ name: string; volumen: number }[]>([]);
  const [notification, setNotification]   = useState('');
  const [solicitudes, setSolicitudes]     = useState<ContactMessage[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.stats.monthly()
      .then(data => setChartData(data.map(d => ({ name: d.month, volumen: d.volumen }))))
      .catch(console.error);
    api.contact.list()
      .then(msgs => setSolicitudes(msgs.filter(m => !!m.item_id && m.status === 'pending')))
      .catch(console.error);
  }, []);

  const handleApproveSol = async (msg: ContactMessage) => {
    setActionLoading(true);
    try {
      await api.contact.approve(msg.id);
      setSolicitudes(prev => prev.filter(m => m.id !== msg.id));
      setNotification('¡Entrega aprobada! El objeto fue marcado como devuelto.');
    } catch { alert('Error al aprobar.'); }
    finally { setActionLoading(false); setTimeout(() => setNotification(''), 2500); }
  };

  const handleRejectSol = async (msg: ContactMessage) => {
    setActionLoading(true);
    try {
      await api.contact.reject(msg.id);
      setSolicitudes(prev => prev.filter(m => m.id !== msg.id));
      setNotification('Solicitud rechazada.');
    } catch { alert('Error al rechazar.'); }
    finally { setActionLoading(false); setTimeout(() => setNotification(''), 2500); }
  };

  const isClaim       = (msg: ContactMessage) => msg.subject?.startsWith('Solicitud de devolución');
  const isFoundReport = (msg: ContactMessage) => msg.subject?.startsWith('Reporte de hallazgo');

  const handleExportPDF = () => {
    const fecha = new Date().toLocaleString('es-MX');
    const modRows = moderationItems.length
      ? moderationItems.map(m => `<tr><td>${m.name}</td><td>${m.category}</td><td>${m.date}</td><td>${m.location}</td></tr>`).join('')
      : '<tr><td colspan="4" style="text-align:center;color:#94a3b8">Sin elementos pendientes</td></tr>';

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
      <title>Reporte Admin FindIt</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;font-size:13px}
        h1{font-size:22px;color:#004ac6;margin:0 0 4px}
        .sub{font-size:11px;color:#64748b;margin-bottom:28px}
        .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
        .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px}
        .kpi-val{font-size:24px;font-weight:900;color:#1e293b}
        .kpi-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-top:4px}
        h2{font-size:14px;font-weight:700;color:#004ac6;margin:0 0 12px;text-transform:uppercase;letter-spacing:.05em}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th{background:#004ac6;color:#fff;padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.06em}
        td{padding:8px 12px;border-bottom:1px solid #e2e8f0}
        @media print{body{padding:16px}}
      </style></head><body>
      <h1>Reporte de Administración — FindIt</h1>
      <p class="sub">Generado el ${fecha}</p>
      <div class="kpis">
        <div class="kpi"><div class="kpi-val">${stats?.totalUsers ?? '—'}</div><div class="kpi-label">Total Usuarios</div></div>
        <div class="kpi"><div class="kpi-val">${stats?.totalItems ?? '—'}</div><div class="kpi-label">Reportes Totales</div></div>
        <div class="kpi"><div class="kpi-val">${stats ? stats.recoveryRate + '%' : '—'}</div><div class="kpi-label">Tasa Recuperación</div></div>
        <div class="kpi"><div class="kpi-val">${moderationItems.length}</div><div class="kpi-label">Pendientes Moderación</div></div>
      </div>
      <h2>Cola de Moderación Pendiente</h2>
      <table>
        <thead><tr><th>Nombre</th><th>Categoría</th><th>Fecha</th><th>Ubicación</th></tr></thead>
        <tbody>${modRows}</tbody>
      </table>
      <script>window.onload=()=>{window.print()}<\/script>
      </body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  };

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      onApproveModeration(id);
      setNotification('¡Objeto aprobado y publicado con éxito!');
    } else {
      onRejectModeration(id);
      setNotification('Objeto rechazado y eliminado permanentemente.');
    }
    setTimeout(() => setNotification(''), 2500);
  };

  return (
    <div className="flex flex-col gap-6 text-left pb-16 animate-fadeIn">
      <Breadcrumb />

      {/* Admin Title Banner */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Consola de Administración
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Portal administrativo global para la auditoría de reportes, métricas estadísticas y moderación activa.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-1.5 px-4 h-11 bg-[#004ac6] text-white rounded-lg text-xs font-bold hover:bg-[#004ac6]/90 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Datos</span>
        </button>
      </section>

      {notification && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-[#004ac6] text-xs font-semibold rounded-lg animate-bounce">
          {notification}
        </div>
      )}

      {/* KPI Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 text-[#004ac6] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Usuarios</p>
            <h3 className="text-2xl font-black text-slate-950 mt-0.5 leading-none">
              {stats ? stats.totalUsers.toLocaleString() : '—'}
            </h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 text-[#004ac6] rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +5%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reportes Totales</p>
            <h3 className="text-2xl font-black text-slate-950 mt-0.5 leading-none">
              {stats ? stats.totalItems.toLocaleString() : '—'}
            </h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa de Recuperación</p>
            <h3 className="text-2xl font-black text-slate-950 mt-0.5 leading-none">
              {stats ? `${stats.recoveryRate}%` : '—'}
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-200">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${stats?.recoveryRate ?? 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-rose-50 text-[#ba1a1a] rounded-lg">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items en Moderación</p>
            <h3 className="text-2xl font-black text-[#ba1a1a] mt-0.5 leading-none">{moderationItems.length}</h3>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <PackageCheck className="w-5 h-5" />
            </div>
            {solicitudes.length > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                Acción requerida
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solicitudes Pendientes</p>
            <h3 className={`text-2xl font-black mt-0.5 leading-none ${solicitudes.length > 0 ? 'text-amber-600' : 'text-slate-950'}`}>
              {solicitudes.length}
            </h3>
          </div>
        </div>
      </section>

      {/* Main Administrative Layout Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Analytics Section (Left pane, spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h2 className="text-base font-extrabold text-slate-900">Volumen Reciente de Reportes</h2>
            <select className="bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 p-2 focus:ring-[#004ac6] outline-none">
              <option>Últimos 6 Meses</option>
              <option>Últimos 12 Meses</option>
            </select>
          </div>

          {/* Interactive Recharts Graph */}
          <div className="h-72 w-full mt-2 font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '11px',
                  }}
                />
                <Bar 
                  dataKey="volumen" 
                  fill="#004ac6" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Moderation Queue Quick Review */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <Gavel className="w-5 h-5 text-[#004ac6]" />
              <span>Cola de Moderación</span>
            </h2>
            <button
              onClick={() => onNavigate(NavigationTab.MODERATION)}
              className="text-xs font-semibold text-[#004ac6] hover:underline cursor-pointer"
            >
              Ver Todo ({moderationItems.length})
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-1">
            {moderationItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                ¡Cola despejada! Excelente trabajo.
              </div>
            ) : (
              moderationItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl hover:border-[#004ac6]/30 transition-all flex flex-col gap-2.5 text-xs text-left"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-200/60 font-bold uppercase tracking-wider text-[8px] text-slate-500 truncate max-w-[150px]">
                      {item.category}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold shrink-0">{item.date}</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleAction(item.id, 'approve')}
                      className="flex-1 bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Aprobar
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'reject')}
                      className="flex-1 bg-rose-50 text-rose-800 border border-rose-100 font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Solicitudes de Entrega Pendientes */}
      {solicitudes.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <PackageCheck className="w-5 h-5 text-amber-600" />
              <span>Solicitudes de Entrega Pendientes</span>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200">
                {solicitudes.length}
              </span>
            </h2>
            <button
              onClick={() => onNavigate(NavigationTab.MODERATION)}
              className="text-xs font-semibold text-[#004ac6] hover:underline cursor-pointer"
            >
              Ver en Moderación
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {solicitudes.map(msg => (
              <div key={msg.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  {isClaim(msg) ? (
                    <span className="flex items-center gap-1 text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      <PackageCheck className="w-2.5 h-2.5" /> Devolución
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-extrabold bg-blue-50 text-[#004ac6] border border-blue-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      <SearchCheck className="w-2.5 h-2.5" /> Hallazgo
                    </span>
                  )}
                  <span className="text-[9px] text-slate-400 font-mono">{msg.created_at}</span>
                </div>

                <div>
                  <p className="font-extrabold text-slate-900 truncate">
                    {msg.subject?.replace('Solicitud de devolución: ', '').replace('Reporte de hallazgo: ', '') || 'Sin asunto'}
                  </p>
                  <p className="text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{msg.message}</p>
                </div>

                <div className="flex flex-col gap-1 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-300" /> {msg.email}</span>
                  {msg.finder_email && (
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-emerald-400" /> {msg.finder_email}</span>
                  )}
                </div>

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleApproveSol(msg)}
                    disabled={actionLoading}
                    className="flex-1 bg-emerald-600 text-white font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleRejectSol(msg)}
                    disabled={actionLoading}
                    className="flex-1 bg-white border border-rose-200 text-rose-600 font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
