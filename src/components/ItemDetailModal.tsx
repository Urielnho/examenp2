/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import {
  X, MapPin, Clock, User, MessageCircle,
  PackageCheck, CheckCircle2, Loader2, SearchCheck
} from 'lucide-react';
import { LostOrFoundItem, ItemStatus } from '../types';
import { api } from '../api';
import { hasRealContent, isRepetitive, isGibberish } from '../utils/validation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface ItemDetailProps {
  item: LostOrFoundItem;
  onClose: () => void;
  onContactReporter: () => void;
  userName?: string;
  userEmail?: string;
}

type FormMode = 'claim' | 'found_report' | null;

export function ItemDetailModal({
  item,
  onClose,
  onContactReporter,
  userName = '',
  userEmail = '',
}: ItemDetailProps) {
  const isFound  = item.status === ItemStatus.FOUND;
  const isLost   = item.status === ItemStatus.LOST;
  const isMyItem = !!userEmail && item.reportedEmail === userEmail;

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [name, setName]         = useState(userName);
  const [email, setEmail]       = useState(userEmail);
  const [reason, setReason]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const toggleForm = (mode: FormMode) => {
    setFormMode(prev => prev === mode ? null : mode);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim())
      return setError('El nombre es obligatorio.');
    if (!hasRealContent(name) || isRepetitive(name))
      return setError('El nombre debe contener palabras reales, sin símbolos ni repeticiones.');

    if (!email.trim())
      return setError('El correo es obligatorio.');
    if (!EMAIL_RE.test(email.trim()))
      return setError('El correo no tiene un formato válido (ej. usuario@dominio.com).');

    if (!reason.trim())
      return setError('Este campo es obligatorio.');
    if (wordCount(reason) < 5)
      return setError('Por favor escribe al menos 5 palabras describiendo el hallazgo.');
    if (!hasRealContent(reason) || isRepetitive(reason) || isGibberish(reason))
      return setError('La descripción debe contener palabras reales en español o inglés.');
    setLoading(true);
    try {
      if (formMode === 'claim') {
        await api.contact.send({
          name: name.trim(),
          email: email.trim(),
          subject: `Solicitud de devolución: ${item.name}`,
          message: `${name.trim()} solicita la devolución del objeto "${item.name}".\n\nMotivo:\n${reason.trim()}\n\nUbicación del reporte: ${item.location}`,
          item_id: item.id,
          finder_email: item.reportedEmail || '',
        });
      } else {
        await api.contact.send({
          name: name.trim(),
          email: email.trim(),
          subject: `Reporte de hallazgo: ${item.name}`,
          message: `${name.trim()} reporta haber encontrado el objeto "${item.name}".\n\nDónde/cómo lo encontró:\n${reason.trim()}\n\nUbicación original del reporte: ${item.location}`,
          item_id: item.id,
          finder_email: item.reportedEmail || '',
        });
      }
      setSuccess(true);
    } catch {
      setError('Hubo un error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formConfig = formMode === 'claim'
    ? {
        title: 'Solicitar Devolución',
        placeholder: 'Describe algún detalle único del objeto que solo tú conocerías...',
        label: '¿Por qué crees que es tuyo?',
        successMsg: '¡Solicitud enviada! Un coordinador revisará los detalles y te contactará para coordinar la entrega segura.',
      }
    : {
        title: 'Reportar Hallazgo',
        placeholder: 'Describe dónde lo encontraste, en qué condiciones está, dónde está guardado ahora...',
        label: '¿Dónde y cómo lo encontraste?',
        successMsg: '¡Reporte enviado! Un coordinador contactará al dueño y te avisará para coordinar la entrega.',
      };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-left font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden flex flex-col relative animate-scaleUp max-h-[90vh]">

        {/* Imagen superior */}
        <div className="h-56 bg-slate-100 relative shrink-0">
          <img alt={item.name} className="w-full h-full object-cover" src={item.imageUrl} />
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full cursor-pointer shadow-md transition-all border border-slate-200">
            <X className="w-4 h-4" />
          </button>
          <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-md border ${
            isLost ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            <span>REPORTE DE {isLost ? 'EXTRAVÍO' : 'HALLAZGO'}</span>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">{item.categoryLabel}</span>
            <h2 className="text-xl font-black text-slate-950 leading-tight">{item.name}</h2>
          </div>

          <div>
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">Descripción y Rasgos Distintivos</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">{item.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3 text-xs">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5 font-mono">Color Principal</span>
              <span className="text-slate-800 uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold font-mono inline-block mt-0.5 border border-slate-200/50">{item.primaryColor}</span>
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5 font-mono">Marca / Fabricante</span>
              <span className="text-slate-800 font-bold block mt-1">{item.brand}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5 font-mono">Ubicación del Reporte</span>
              <span className="text-slate-800 text-xs font-semibold flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-[#004ac6] shrink-0" />
                <span>{item.location}{item.locationContext ? ` (${item.locationContext})` : ''}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-50 pb-2">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-300" /><span>Fecha: {item.date}</span></span>
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-300" /><span>Por: {item.reportedBy || 'Coordinador FindIt'}</span></span>
          </div>

          {/* Botones de acción */}
          {!success && (
            <div className="flex gap-2.5 pt-1">
              {isMyItem ? (
                <div className="flex-1 bg-slate-100 text-slate-500 font-bold text-xs h-11 rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-wider select-none">
                  <PackageCheck className="w-4 h-4" /> Tu reporte
                </div>
              ) : (
                <>
                  {isFound && (
                    <button
                      onClick={() => toggleForm('claim')}
                      className={`flex-1 font-extrabold text-xs h-11 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider ${
                        formMode === 'claim' ? 'bg-[#004ac6]/10 text-[#004ac6] border-2 border-[#004ac6]' : 'bg-[#004ac6] hover:bg-[#004ac6]/90 text-white shadow-md'
                      }`}
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Solicitar Devolución</span>
                    </button>
                  )}
                  {isLost && (
                    <button
                      onClick={() => toggleForm('found_report')}
                      className={`flex-1 font-extrabold text-xs h-11 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider ${
                        formMode === 'found_report' ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                      }`}
                    >
                      <SearchCheck className="w-4 h-4" />
                      <span>Encontré este Objeto</span>
                    </button>
                  )}
                  <button
                    onClick={onContactReporter}
                    className="px-4 border border-slate-200 text-slate-700 font-bold text-xs h-11 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <MessageCircle className="w-4 h-4 text-[#004ac6]" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Formulario */}
          {formMode && !success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200 animate-fadeIn">
              <p className="text-xs font-bold text-slate-600">{formConfig.title}</p>

              {error && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">{error}</p>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Tu nombre</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo"
                  maxLength={80}
                  className="h-9 px-3 border border-slate-200 rounded-lg text-xs focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Tu correo</label>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com"
                  maxLength={100}
                  className="h-9 px-3 border border-slate-200 rounded-lg text-xs focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">{formConfig.label}</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder={formConfig.placeholder}
                  rows={3} maxLength={500}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-xs resize-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{reason.trim() ? `${wordCount(reason)} palabra${wordCount(reason) !== 1 ? 's' : ''} (mín. 5)` : 'Mín. 5 palabras'}</span>
                  <span>{reason.length}/500</span>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className={`h-10 text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer transition-all ${
                  formMode === 'found_report' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#004ac6] hover:bg-[#004ac6]/90'
                }`}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Enviando...' : formConfig.title}
              </button>
            </form>
          )}

          {/* Éxito */}
          {success && (
            <div className="flex flex-col items-center gap-3 py-6 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <h3 className="font-extrabold text-slate-900 text-base">¡Enviado!</h3>
              <p className="text-slate-500 text-xs text-center leading-relaxed max-w-xs">{formConfig?.successMsg}</p>
              <button onClick={onClose} className="mt-2 px-6 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer">
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
