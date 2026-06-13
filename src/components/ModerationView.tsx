/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Check, X, MapPin, Clock, User, FileCheck,
  PackageCheck, SearchCheck, Mail, CheckCircle2, XCircle,
  Loader2, Inbox, Image
} from 'lucide-react';
import { ModerationItem, ItemStatus, NavigationTab, ContactMessage } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { api } from '../api';

interface ModerationViewProps {
  onNavigate: (tab: NavigationTab) => void;
  moderationItems: ModerationItem[];
  onApproveModeration: (id: string) => void;
  onRejectModeration: (id: string) => void;
}

type QueueEntry =
  | { type: 'item';      data: ModerationItem }
  | { type: 'solicitud'; data: ContactMessage  };

const STATUS_LABELS = {
  pending:  { label: 'Pendiente',        color: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Entrega Aprobada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rechazada',        color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function ModerationView({
  onNavigate,
  moderationItems,
  onApproveModeration,
  onRejectModeration,
}: ModerationViewProps) {
  const [solicitudes, setSolicitudes]     = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [feedback, setFeedback]           = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter]               = useState<'todos' | 'items' | 'solicitudes'>('todos');

  useEffect(() => {
    api.contact.list()
      .then(msgs => setSolicitudes(msgs.filter(m => !!m.item_id)))
      .catch(console.error);
  }, []);

  const toast = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

  const handleItemAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') { onApproveModeration(id); toast('¡Objeto aprobado y publicado!'); }
    else                      { onRejectModeration(id);  toast('Reporte rechazado.'); }
    setSelectedId(null);
  };

  const handleSolApprove = async (msg: ContactMessage) => {
    setActionLoading(true);
    try {
      await api.contact.approve(msg.id);
      const updated = { ...msg, status: 'approved' as const };
      setSolicitudes(prev => prev.map(m => m.id === msg.id ? updated : m));
      setSelectedId(msg.id);
      toast('¡Entrega aprobada! El objeto fue marcado como devuelto.');
    } catch { alert('Error al aprobar.'); }
    finally { setActionLoading(false); }
  };

  const handleSolReject = async (msg: ContactMessage) => {
    setActionLoading(true);
    try {
      await api.contact.reject(msg.id);
      const updated = { ...msg, status: 'rejected' as const };
      setSolicitudes(prev => prev.map(m => m.id === msg.id ? updated : m));
      setSelectedId(msg.id);
      toast('Solicitud rechazada.');
    } catch { alert('Error al rechazar.'); }
    finally { setActionLoading(false); }
  };

  const isClaim       = (msg: ContactMessage) => msg.subject?.startsWith('Solicitud de devolución');
  const isFoundReport = (msg: ContactMessage) => msg.subject?.startsWith('Reporte de hallazgo');

  const allEntries: QueueEntry[] = [
    ...moderationItems.map(d => ({ type: 'item' as const, data: d })),
    ...solicitudes.map(d => ({ type: 'solicitud' as const, data: d })),
  ];

  const filtered = allEntries.filter(e => {
    if (filter === 'items')      return e.type === 'item';
    if (filter === 'solicitudes') return e.type === 'solicitud';
    return true;
  });

  const pendingCount = allEntries.filter(e =>
    e.type === 'item'
      ? (e.data as ModerationItem).status === ItemStatus.PENDING
      : (e.data as ContactMessage).status === 'pending'
  ).length;

  const selected = allEntries.find(e => {
    const id = e.type === 'item' ? (e.data as ModerationItem).id : (e.data as ContactMessage).id;
    return id === selectedId;
  }) ?? null;

  return (
    <div className="flex flex-col gap-6 text-left pb-16 animate-fadeIn font-sans">
      <Breadcrumb />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#011B33] tracking-tight">
            Centro de Moderación
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Cola unificada de reportes nuevos y solicitudes de entrega pendientes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full font-mono">
              {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
            </span>
          )}
          <div className="flex bg-slate-100/80 border border-slate-200 p-1 rounded-xl gap-1">
            {(['todos', 'items', 'solicitudes'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === f ? 'bg-white text-[#004ac6] shadow-md border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {f === 'todos' ? 'Todos' : f === 'items' ? 'Reportes' : 'Solicitudes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
          {feedback}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Inbox className="w-10 h-10 opacity-30" />
          <p className="text-sm font-semibold">Cola vacía — todo al día.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Lista unificada */}
          <div className="flex flex-col gap-2">
            {filtered.map(entry => {
              const isItem = entry.type === 'item';
              const item   = isItem ? (entry.data as ModerationItem) : null;
              const msg    = isItem ? null : (entry.data as ContactMessage);
              const entryId = isItem ? item!.id : msg!.id;
              const isSelected = selectedId === entryId;

              if (isItem) {
                return (
                  <button key={entryId} onClick={() => setSelectedId(isSelected ? null : entryId)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected ? 'border-[#004ac6] bg-[#e5eeff]' : 'border-slate-200 bg-white hover:border-[#004ac6]/40 hover:bg-slate-50'
                    }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <Image className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{item!.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item!.reportedBy}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide bg-amber-50 text-amber-700 border-amber-200">
                          Reporte nuevo
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item!.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{item!.description}</p>
                  </button>
                );
              }

              const st = STATUS_LABELS[msg!.status ?? 'pending'];
              const claim = isClaim(msg!);
              return (
                <button key={entryId} onClick={() => setSelectedId(isSelected ? null : entryId)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected ? 'border-[#004ac6] bg-[#e5eeff]' : 'border-slate-200 bg-white hover:border-[#004ac6]/40 hover:bg-slate-50'
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${claim ? 'bg-emerald-600' : 'bg-[#004ac6]'}`}>
                        {claim ? <PackageCheck className="w-4 h-4" /> : <SearchCheck className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{msg!.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{msg!.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg!.created_at}</span>
                    </div>
                  </div>
                  {msg!.subject && (
                    <p className="text-xs font-semibold text-slate-700 mt-2 truncate">{msg!.subject}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{msg!.message}</p>
                </button>
              );
            })}
          </div>

          {/* Panel de detalle */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 sticky top-24">

              {selected.type === 'item' ? (() => {
                const item = selected.data as ModerationItem;
                return (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Reporte Nuevo
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide bg-amber-50 text-amber-700 border-amber-200">
                        {item.status}
                      </span>
                    </div>

                    <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1">{item.category}</p>
                      <h3 className="font-extrabold text-slate-900 text-base">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
                      <span className="flex items-center gap-2 text-slate-700 font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {item.reportedBy}
                      </span>
                      <span className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {item.location}
                      </span>
                      <span className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> {item.date}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleItemAction(item.id, 'approve')}
                        className="flex-1 h-10 bg-[#004ac6] hover:bg-[#004ac6]/90 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                        <Check className="w-3.5 h-3.5" /> Aprobar
                      </button>
                      <button onClick={() => handleItemAction(item.id, 'reject')}
                        className="flex-1 h-10 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-50 flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                        <X className="w-3.5 h-3.5" /> Rechazar
                      </button>
                    </div>
                  </>
                );
              })() : (() => {
                const msg = selected.data as ContactMessage;
                const claim = isClaim(msg);
                const st = STATUS_LABELS[msg.status ?? 'pending'];
                return (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      {claim ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <PackageCheck className="w-3 h-3" /> Solicitud de Devolución
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-extrabold bg-blue-50 text-[#004ac6] border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <SearchCheck className="w-3 h-3" /> Reporte de Hallazgo
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${st.color}`}>
                        {st.label}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                        {claim ? 'Reclamante' : 'Quien lo Encontró'}
                      </p>
                      <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
                        <span className="flex items-center gap-2 text-slate-700 font-semibold">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {msg.name}
                        </span>
                        <span className="flex items-center gap-2 text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {msg.email}
                        </span>
                        <span className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> {msg.created_at}
                        </span>
                      </div>
                    </div>

                    {msg.finder_email && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                          {isFoundReport(msg) ? 'Dueño del Objeto' : 'Quien Encontró el Objeto'}
                        </p>
                        <div className="bg-emerald-50 rounded-xl p-3 text-xs border border-emerald-100">
                          <span className="flex items-center gap-2 text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {msg.finder_email}
                          </span>
                        </div>
                      </div>
                    )}

                    {msg.subject && (
                      <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Asunto</p>
                        <p className="text-xs font-semibold text-slate-800">{msg.subject}</p>
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-lg px-3 py-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mensaje</p>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      {msg.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleSolApprove(msg)} disabled={actionLoading}
                            className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer transition-all">
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Aprobar Entrega
                          </button>
                          <button onClick={() => handleSolReject(msg)} disabled={actionLoading}
                            className="flex-1 h-10 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-50 flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer transition-all">
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            Rechazar
                          </button>
                        </div>
                      )}

                      {msg.status === 'approved' && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          Entrega aprobada — el objeto fue marcado como devuelto.
                        </div>
                      )}

                      {msg.status === 'rejected' && (
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-700">
                          <XCircle className="w-4 h-4 shrink-0" />
                          Solicitud rechazada.
                        </div>
                      )}

                      <div className="flex gap-2">
                        <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Tu solicitud en FindIt')}&body=${encodeURIComponent('Hola,\n\nNos comunicamos desde FindIt respecto a tu solicitud.\n\n')}`}
                          className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-[#004ac6] text-white text-xs font-bold rounded-xl hover:bg-[#004ac6]/90 transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                          {claim ? 'Email al Reclamante' : 'Email al Encontrador'}
                        </a>
                        {msg.finder_email && (
                          <a href={`mailto:${msg.finder_email}?subject=${encodeURIComponent('Coordinación de entrega - FindIt')}&body=${encodeURIComponent('Hola,\n\nHay una solicitud relacionada al objeto que reportaste. Nos ponemos en contacto para coordinar.\n\n')}`}
                            className="flex-1 flex items-center justify-center gap-1.5 h-10 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-50 transition-colors">
                            <Mail className="w-3.5 h-3.5" />
                            {isFoundReport(msg) ? 'Email al Dueño' : 'Email al Encontrador'}
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-48 text-slate-300 gap-2">
              <FileCheck className="w-8 h-8" />
              <p className="text-xs font-semibold">Selecciona un elemento para gestionar</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
