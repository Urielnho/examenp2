/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Activity,
  FolderHeart,
  Percent,
  Download,
  Terminal
} from 'lucide-react';
import { AppStats } from '../types';
import { api } from '../api';
import { Breadcrumb } from './Breadcrumb';

const CATEGORY_COLORS: Record<string, string> = {
  electronics: '#3b82f6',
  wallets:     '#10b981',
  keys:        '#f59e0b',
  pets:        '#ef4444',
  bags:        '#6366f1',
  clothing:    '#ec4899',
  other:       '#a855f7',
};

interface AnalyticsProps {
  stats: AppStats | null;
}

export function AnalyticsOverviewView({ stats }: AnalyticsProps) {
  const [weeklyActivitiesData, setWeeklyActivitiesData] = useState<
    { week: string; reportes: number; recuperados: number }[]
  >([]);

  const [categorySplitData, setCategorySplitData] = useState<
    { name: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    api.stats.weekly()
      .then(data => setWeeklyActivitiesData(data))
      .catch(console.error);

    api.stats.category()
      .then(data =>
        setCategorySplitData(
          data.map((d, i) => ({
            name:  d.name,
            value: d.value,
            color: CATEGORY_COLORS[d.name] ?? `hsl(${i * 55}, 65%, 55%)`,
          }))
        )
      )
      .catch(console.error);
  }, []);

  const [recentAuditsData, setRecentAuditsData] = useState<
    { id: string; operation: string; user: string; time: string; status: string }[]
  >([]);

  useEffect(() => {
    api.logs.list()
      .then(logs =>
        setRecentAuditsData(
          logs.slice(0, 50).map(l => ({
            id:        l.id,
            operation: l.action,
            user:      l.user,
            time:      l.time,
            status:    l.status === 'Matched' || l.status === 'Verified' ? 'Éxito' : l.status,
          }))
        )
      )
      .catch(console.error);
  }, []);

  const handleExportPDF = () => {
    if (!recentAuditsData.length) return;
    const fecha = new Date().toLocaleString('es-MX');
    const rows = recentAuditsData.map(a => `
      <tr>
        <td>${a.operation}</td>
        <td>${a.user}</td>
        <td>${a.time}</td>
        <td><span class="${a.status === 'Éxito' || a.status === 'Verified' || a.status === 'Matched' ? 'ok' : 'pending'}">${a.status}</span></td>
      </tr>`).join('');
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
      <title>Bitácora FindIt</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;font-size:13px}
        h1{font-size:22px;color:#004ac6;margin:0 0 4px}
        .sub{font-size:11px;color:#64748b;margin-bottom:24px}
        table{width:100%;border-collapse:collapse}
        th{background:#004ac6;color:#fff;padding:9px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.06em}
        td{padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:12px}
        tr:nth-child(even) td{background:#f8fafc}
        .ok{background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700}
        .pending{background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700}
        @media print{body{padding:16px}}
      </style></head><body>
      <h1>Bitácora de Auditoría — FindIt</h1>
      <p class="sub">Exportado el ${fecha} · ${recentAuditsData.length} registros</p>
      <table>
        <thead><tr><th>Operación Registrada</th><th>Usuario</th><th>Tiempo</th><th>Estado</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.onload=()=>{window.print()}<\/script>
      </body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  };

  return (
    <div className="flex flex-col gap-6 text-left pb-16 animate-fadeIn font-sans">
      <Breadcrumb />

      {/* Intro section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#011B33] tracking-tight animate-slideUp">
            Analítica de Red FindIt
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Audita el rendimiento geocodificado de reportes, distribución de categorías, métricas de recuperación y huellas de auditoría de seguridad.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-1.5 px-4 h-11 bg-[#004ac6] text-white rounded-lg text-xs font-bold hover:bg-[#004ac6]/90 transition-colors shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download className="w-4.5 h-4.5" />
          <span>Exportar Bitácora Completa</span>
        </button>
      </div>

      {/* Stats KPI cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/65 shadow-xs flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004ac6] flex items-center justify-center">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              {stats ? stats.totalItems.toLocaleString() : '—'}
            </p>
            <p className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase mt-1 font-mono">Total Registros</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/65 shadow-xs flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              {stats ? stats.lostItems.toLocaleString() : '—'}
            </p>
            <p className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase mt-1 font-mono">Objetos Perdidos</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/65 shadow-xs flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FolderHeart className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              {stats ? (stats.foundItems + stats.returnedItems).toLocaleString() : '—'}
            </p>
            <p className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase mt-1 font-mono">Total Recuperados</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/65 shadow-xs flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Percent className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              {stats ? `${stats.recoveryRate}%` : '—'}
            </p>
            <p className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase mt-1 font-mono">Tasa de Recuperación</p>
          </div>
        </div>
      </section>

      {/* Main Analytical Chart Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Area weekly volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-gray-100 pb-2.5">Flujo Semanal de Reportes y Entregas</h3>
          
          <div className="h-64 w-full font-mono text-xs mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivitiesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReportes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorRecuperados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="reportes" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReportes)" name="Reportes Recibidos" />
                <Area type="monotone" dataKey="recuperados" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRecuperados)" name="Objetos Devueltos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution Pie */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs flex flex-col gap-3 text-center sm:text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-gray-100 pb-2.5">Distribución de Categorías en el Inventario</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center h-64 mt-2">
            <div className="h-44 w-44 shrink-0 font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySplitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categorySplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom color legends */}
            <div className="flex flex-col gap-2.5 text-xs text-left grow font-semibold">
              {categorySplitData.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 truncate">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-400">({item.value} registros)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security System Audit Logs */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs text-left">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
          <Terminal className="w-5 h-5 text-[#004ac6]" />
          <span>Bitácora de Auditoría de Sistemas y Seguridad</span>
        </h3>

        <div className="flex flex-col gap-3 mt-4 overflow-x-auto pb-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-widest text-[10px] font-mono">
                <th className="py-2.5 text-left">Operación Registrada</th>
                <th className="py-2.5 text-left">Perfil Responsable</th>
                <th className="py-2.5 text-left">Intervalo de Registro</th>
                <th className="py-2.5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
              {recentAuditsData.map((audit) => {
                const isBlocked = audit.status === 'Bloqueado';
                return (
                  <tr key={audit.id} className="hover:bg-slate-50/40">
                    <td className="py-3 text-left font-bold text-slate-800">{audit.operation}</td>
                    <td className="py-3 text-left text-slate-400 font-medium">{audit.user}</td>
                    <td className="py-3 text-left text-slate-400 font-light">{audit.time}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                        isBlocked
                          ? 'bg-rose-50 text-rose-700 font-mono'
                          : 'bg-emerald-50 text-emerald-700 font-mono'
                      }`}>
                        {audit.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
