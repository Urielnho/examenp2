/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import {
  Search,
  Megaphone,
  HeartHandshake,
  Archive,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,

  FileText,
  Workflow,
  Handshake
} from 'lucide-react';
import { LostOrFoundItem, NavigationTab, ItemStatus, AppStats } from '../types';
import { Breadcrumb } from './Breadcrumb';

interface HomeViewProps {
  items: LostOrFoundItem[];
  stats: AppStats | null;
  onNavigate: (tab: NavigationTab) => void;
  onSetReportType: (status: ItemStatus) => void;
  onSearchQuery: (query: string) => void;
  onViewItemDetail: (item: LostOrFoundItem) => void;
}

export function HomeView({
  items,
  stats,
  onNavigate,
  onSetReportType,
  onSearchQuery,
  onViewItemDetail,
}: HomeViewProps) {
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchQuery(query);
    onNavigate(NavigationTab.SEARCH);
  };

  const handleReportAction = (status: ItemStatus) => {
    onSetReportType(status);
    onNavigate(NavigationTab.CREATE_REPORT);
  };

  // Filter recently added (take up to 6 items)
  const recentItems = items.slice(0, 6);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fadeIn font-sans">
      <Breadcrumb />

      {/* Hero Section Container */}
      <section className="relative overflow-hidden bg-[#eff4ff] rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col gap-6 md:gap-8">
        {/* Decorative Ambient Background blur */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Hero Copy */}
        <div className="flex flex-col gap-2 relative z-10 max-w-2xl text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-1.1">
            Encuentra lo que perdiste. <br />
            <span className="text-[#004ac6]">Devuelve lo que encontraste.</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg mt-2 font-medium leading-relaxed">
            La plataforma líder y segura que conecta reportes de objetos extraviados con sus dueños legítimos de forma transparente.
          </p>
        </div>

        {/* High-Fidelity Custom Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative z-10 w-full max-w-2xl">
          <div className="relative flex items-center w-full bg-white rounded-xl shadow-md border border-slate-200 focus-within:border-[#004ac6] focus-within:ring-2 focus-within:ring-[#004ac6]/15 transition-all">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none animate-pulse" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-28 bg-transparent text-sm text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
              placeholder="Buscar por nombre, palabras clave, color o lugar..."
              type="text"
            />
            <button 
              type="submit"
              className="absolute right-2 px-5 h-10 bg-[#004ac6] text-white rounded-lg text-xs font-semibold hover:bg-[#004ac6]/90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Action Buttons CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 w-full max-w-2xl mt-2">
          <button
            onClick={() => handleReportAction(ItemStatus.LOST)}
            className="w-full h-12 bg-[#004ac6] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4.5 h-4.5" />
            <span>Perdí un Objeto</span>
          </button>
          <button
            onClick={() => handleReportAction(ItemStatus.FOUND)}
            className="w-full h-12 bg-white border border-slate-200 text-slate-800 rounded-xl font-semibold text-sm shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <HeartHandshake className="w-4.5 h-4.5 text-emerald-600 animate-bounce" />
            <span>Encontré un Objeto</span>
          </button>
        </div>
      </section>

      {/* Stats Bento Grid Panel */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <Archive className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl text-slate-900 leading-tight">
              {stats ? stats.totalItems.toLocaleString() : '—'}
            </span>
            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Objetos Registrados</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-lg bg-[#e5eeff] text-[#004ac6] flex items-center justify-center shadow-xs">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl text-slate-900 leading-tight">
              {stats ? `${stats.recoveryRate}%` : '—'}
            </span>
            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Tasa de Recuperación Total</span>
          </div>
        </div>
      </section>

      {/* Horizontal Recent Additions Carousel */}
      <section className="flex flex-col gap-4 mt-2">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Agregados Recientemente al Registro</h2>
          <button
            onClick={() => onNavigate(NavigationTab.SEARCH)}
            className="text-xs font-semibold text-[#004ac6] flex items-center gap-1 hover:text-[#004ac6]/80 cursor-pointer"
          >
            <span>Ver Todo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Carousel Scroller Container */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x scroll-smooth">
          {recentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onViewItemDetail(item)}
              className="min-w-[260px] max-w-[260px] bg-white rounded-xl shadow-xs hover:shadow-md border border-slate-200/50 overflow-hidden flex flex-col snap-start shrink-0 cursor-pointer hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card Image Cover */}
              <div className="h-36 bg-slate-100 relative">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover"
                  src={item.imageUrl}
                />
                
                {/* Visual Type Badge */}
                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1 ${
                  item.status === ItemStatus.LOST
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span>{item.status === ItemStatus.LOST ? 'Perdido' : 'Encontrado'}</span>
                </div>
              </div>

              {/* Card details body */}
              <div className="p-4 flex flex-col gap-2.5 flex-grow text-left">
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#004ac6] line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex flex-col gap-1.5 text-xs text-slate-500 mt-auto">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works info timeline */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm mt-4 text-left">
        <div className="text-center mb-8">
          <h2 className="text-xl font-extrabold text-slate-900">¿Cómo Funciona FindIt?</h2>
          <p className="text-slate-400 text-xs mt-1 uppercase font-semibold tracking-widest font-mono">Cuatro pasos del reporte a la entrega</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm mb-4 border border-emerald-100/50">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">1. Reporta</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed font-normal">
              Crea un reporte con nombre, categoría, color, marca, descripción y ubicación. El admin lo revisa antes de publicarlo.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-[#eff4ff] text-[#004ac6] flex items-center justify-center shadow-sm mb-4 border border-[#eff4ff]">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">2. Encuentra o reclama</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed font-normal">
              Si ves un objeto que es tuyo presiona "Solicitar Devolución". Si encontraste algo de alguien más presiona "Encontré este Objeto".
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm mb-4 border border-amber-100/50">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">3. Admin coordina</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed font-normal">
              Un coordinador revisa la solicitud, la aprueba y comparte los correos de ambas partes para que coordinen el encuentro.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center p-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm mb-4 border border-indigo-100/50">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">4. Confirman entrega</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed font-normal">
              Ambas partes confirman la entrega desde su panel. El objeto se marca como recuperado y se retira del buscador.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
