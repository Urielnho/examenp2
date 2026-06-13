/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, ShieldCheck, Heart, ArrowRight, PackageCheck, SearchCheck, Handshake } from 'lucide-react';
import { NavigationTab } from '../types';
import { Breadcrumb } from './Breadcrumb';

interface AboutViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export function AboutView({ onNavigate }: AboutViewProps) {
  return (
    <div className="flex flex-col gap-8 text-left pb-16 animate-fadeIn">
      <Breadcrumb />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-2xl p-6 md:p-10 shadow-lg flex flex-col md:flex-row gap-8 items-center border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900 to-slate-950 pointer-events-none"></div>

        <div className="flex-1 flex flex-col gap-4 relative z-10">
          <span className="bg-[#6bff8f]/20 text-[#6bff8f] border border-[#6bff8f]/30 px-3 py-1 rounded-full text-[10px] font-bold self-start uppercase tracking-wider font-mono">
            Sobre FindIt
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Reconectando personas con lo que perdieron.
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
            FindIt es una plataforma de objetos perdidos y encontrados que permite a cualquier persona reportar lo que perdió o lo que encontró. Mediante un sistema de coincidencias automático, moderación de reportes y un flujo de entrega verificado, coordinamos la devolución segura de pertenencias de principio a fin.
          </p>
          <button
            onClick={() => onNavigate(NavigationTab.SEARCH)}
            className="self-start mt-2 px-5 py-2.5 bg-[#004ac6] text-white rounded-lg text-xs font-semibold hover:bg-[#004ac6]/90 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Buscar objetos reportados</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full md:w-[320px] max-w-full aspect-video md:aspect-[4/3] rounded-xl overflow-hidden border border-slate-700 relative shadow-2xl">
          <img
            alt="FindIt plataforma"
            className="w-full h-full object-cover select-none"
            src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=640"
          />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">¿Cómo funciona FindIt?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 text-base font-black">1</div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Reporta</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
                Cualquier usuario registrado puede publicar un objeto perdido o encontrado con descripción, categoría, color, marca y ubicación.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 text-base font-black">2</div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Solicita o reporta hallazgo</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
                Si encontraste algo perdido, presiona "Encontré este Objeto". Si algo que ves es tuyo, presiona "Solicitar Devolución". Un coordinador revisa y aprueba la solicitud.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-base font-black">3</div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Confirma la entrega</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
                Tras coordinar el encuentro, ambas partes confirman la entrega en su panel. El objeto se marca como recuperado y se retira del buscador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Nuestros Valores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#004ac6] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Seguridad y Moderación</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
                Cada reporte pasa por revisión de un administrador antes de publicarse. Las solicitudes de entrega también requieren aprobación para proteger a ambas partes.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Coincidencia Automática</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
                El sistema compara categoría, marca, color y ubicación entre objetos perdidos y encontrados para generar puntuaciones de coincidencia y sugerir posibles matches.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Flujo Completo de Entrega</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
                No terminamos en el reporte. Acompañamos el proceso hasta que el dueño y quien encontró el objeto confirmen la devolución, cerrando el ciclo de forma verificada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col gap-2">
          <PackageCheck className="w-5 h-5 text-emerald-500" />
          <p className="font-bold text-sm text-slate-800">Solicitar devolución</p>
          <p className="text-xs text-slate-400 leading-relaxed">Si ves en el buscador un objeto que es tuyo, envía una solicitud directa al coordinador.</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col gap-2">
          <SearchCheck className="w-5 h-5 text-[#004ac6]" />
          <p className="font-bold text-sm text-slate-800">Reportar hallazgo</p>
          <p className="text-xs text-slate-400 leading-relaxed">Si encontraste algo perdido de otra persona, repórtalo para que el dueño pueda reclamarlo.</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col gap-2">
          <Handshake className="w-5 h-5 text-amber-500" />
          <p className="font-bold text-sm text-slate-800">Confirmar entrega</p>
          <p className="text-xs text-slate-400 leading-relaxed">Ambas partes confirman la entrega en su panel para cerrar el caso y retirarlo del buscador.</p>
        </div>
      </section>
    </div>
  );
}
