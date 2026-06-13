/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Mail, Inbox, Calendar, User,
  PackageCheck, MessageSquare, CheckCircle2,
  XCircle, Clock, Loader2
} from 'lucide-react';
import { ContactMessage } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { api } from '../api';

const STATUS_LABELS = {
  pending:  { label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Entrega Aprobada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rechazada', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function MessagesView() {
  const [messages, setMessages]   = useState<ContactMessage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<ContactMessage | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    api.contact.list()
      .then(msgs => setMessages(msgs.filter(m => !m.item_id)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return iso; }
  };

  const handleApprove = async (msg: ContactMessage) => {
    setActionLoading(true);
    try {
      await api.contact.approve(msg.id);
      const updated = { ...msg, status: 'approved' as const };
      setMessages(prev => prev.map(m => m.id === msg.id ? updated : m));
      setSelected(updated);
    } catch { alert('Error al aprobar. Intenta de nuevo.'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (msg: ContactMessage) => {
    setActionLoading(true);
    try {
      await api.contact.reject(msg.id);
      const updated = { ...msg, status: 'rejected' as const };
      setMessages(prev => prev.map(m => m.id === msg.id ? updated : m));
      setSelected(updated);
    } catch { alert('Error al rechazar. Intenta de nuevo.'); }
    finally { setActionLoading(false); }
  };

  const isClaim       = (msg: ContactMessage) => !!msg.item_id && msg.subject?.startsWith('Solicitud de devolución');
  const isFoundReport = (msg: ContactMessage) => !!msg.item_id && msg.subject?.startsWith('Reporte de hallazgo');

  const pendingClaims = messages.filter(m => (isClaim(m) || isFoundReport(m)) && m.status === 'pending').length;

  return (
    <div className="flex flex-col gap-6 text-left pb-16 animate-fadeIn">
      <Breadcrumb />

      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mensajes de Soporte
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Mensajes de contacto general enviados desde la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingClaims > 0 && (
            <span className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full font-mono">
              {pendingClaims} solicitud{pendingClaims !== 1 ? 'es' : ''} pendiente{pendingClaims !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs font-bold text-slate-400 font-mono">
            {messages.length} total
          </span>
        </div>
      </section>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs font-semibold">Cargando mensajes...</div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Inbox className="w-10 h-10 opacity-30" />
          <p className="text-sm font-semibold">No hay mensajes recibidos aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Lista */}
          <div className="flex flex-col gap-2">
            {messages.map(msg => {
              const claim = isClaim(msg);
              const st = STATUS_LABELS[msg.status ?? 'pending'];
              return (
                <button
                  key={msg.id}
                  onClick={() => setSelected(selected?.id === msg.id ? null : msg)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?.id === msg.id
                      ? 'border-[#004ac6] bg-[#e5eeff]'
                      : 'border-slate-200 bg-white hover:border-[#004ac6]/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${claim ? 'bg-emerald-600' : 'bg-[#004ac6]'}`}>
                        {claim ? <PackageCheck className="w-4 h-4" /> : msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{msg.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{msg.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(msg.created_at)}</span>
                    </div>
                  </div>
                  {msg.subject && (
                    <p className="text-xs font-semibold text-slate-700 mt-2 truncate">{msg.subject}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{msg.message}</p>
                </button>
              );
            })}
          </div>

          {/* Detalle */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 sticky top-24">

              {/* Encabezado tipo */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {isClaim(selected) ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <PackageCheck className="w-3 h-3" /> Solicitud de Devolución
                    </span>
                  ) : isFoundReport(selected) ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold bg-blue-50 text-[#004ac6] border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <PackageCheck className="w-3 h-3" /> Reporte de Hallazgo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold bg-blue-50 text-[#004ac6] border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <MessageSquare className="w-3 h-3" /> Mensaje General
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${STATUS_LABELS[selected.status ?? 'pending'].color}`}>
                  {STATUS_LABELS[selected.status ?? 'pending'].label}
                </span>
              </div>

              {/* Info reclamante */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  {isClaim(selected) ? 'Reclamante' : isFoundReport(selected) ? 'Quien lo Encontró' : 'Remitente'}
                </p>
                <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
                  <span className="flex items-center gap-2 text-slate-700 font-semibold">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selected.name}
                  </span>
                  <span className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selected.email}
                  </span>
                  <span className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 shrink-0" /> {formatDate(selected.created_at)}
                  </span>
                </div>
              </div>

              {/* Info segunda parte */}
              {(isClaim(selected) || isFoundReport(selected)) && selected.finder_email && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                    {isFoundReport(selected) ? 'Dueño del Objeto' : 'Quien Encontró el Objeto'}
                  </p>
                  <div className="bg-emerald-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs border border-emerald-100">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {selected.finder_email}
                    </span>
                  </div>
                </div>
              )}

              {/* Asunto / Motivo */}
              {selected.subject && (
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Asunto</p>
                  <p className="text-xs font-semibold text-slate-800">{selected.subject}</p>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg px-3 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {isClaim(selected) ? 'Motivo del Reclamo' : 'Mensaje'}
                </p>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 pt-1">
                {(isClaim(selected) || isFoundReport(selected)) && selected.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(selected)}
                      disabled={actionLoading}
                      className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer transition-all"
                    >
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Aprobar Entrega
                    </button>
                    <button
                      onClick={() => handleReject(selected)}
                      disabled={actionLoading}
                      className="flex-1 h-10 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-50 flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer transition-all"
                    >
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Rechazar
                    </button>
                  </div>
                )}

                {(isClaim(selected) || isFoundReport(selected)) && selected.status === 'approved' && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Entrega aprobada — el objeto fue marcado como devuelto en la BD.
                  </div>
                )}

                {(isClaim(selected) || isFoundReport(selected)) && selected.status === 'rejected' && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-700">
                    <XCircle className="w-4 h-4 shrink-0" />
                    Solicitud rechazada.
                  </div>
                )}

                {/* Botones de contacto */}
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Tu solicitud en FindIt')}&body=${encodeURIComponent('Hola,\n\nNos comunicamos desde FindIt respecto a tu solicitud.\n\n')}`}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-[#004ac6] text-white text-xs font-bold rounded-xl hover:bg-[#004ac6]/90 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {isClaim(selected) ? 'Email al Reclamante' : isFoundReport(selected) ? 'Email al Encontrador' : 'Responder'}
                  </a>

                  {(isClaim(selected) || isFoundReport(selected)) && selected.finder_email && (
                    <a
                      href={`mailto:${selected.finder_email}?subject=${encodeURIComponent('Coordinación de entrega - FindIt')}&body=${encodeURIComponent('Hola,\n\nHay una persona reclamando el objeto que reportaste como encontrado. Nos ponemos en contacto para coordinar la entrega segura.\n\n')}`}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {isFoundReport(selected) ? 'Email al Dueño' : 'Email al Encontrador'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-48 text-slate-300 gap-2">
              <Clock className="w-8 h-8" />
              <p className="text-xs font-semibold">Selecciona un mensaje para gestionar</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
