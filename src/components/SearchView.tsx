/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,

  Grid,
  List,
  MapPin,
  Calendar
} from 'lucide-react';
import { LostOrFoundItem, ItemCategory, ItemStatus } from '../types';
import { Breadcrumb } from './Breadcrumb';

interface SearchViewProps {
  items: LostOrFoundItem[];
  onViewItemDetail: (item: LostOrFoundItem) => void;
  initialQuery?: string;
}

export function SearchView({
  items,
  onViewItemDetail,
  initialQuery = '',
}: SearchViewProps) {
  // Navigation query state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  
  // Custom filter selections
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedCategoryStatus] = useState<string>('any');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
const [isGridView, setIsGridView] = useState(true);

  // Categories helper list
  const categoryFilters = [
    { value: 'all', label: 'Todos' },
    { value: ItemCategory.ELECTRONICS, label: 'Electrónica' },
    { value: ItemCategory.KEYS, label: 'Llaves' },
    { value: ItemCategory.WALLETS, label: 'Carteras / Bolsas' },
    { value: ItemCategory.PETS, label: 'Mascotas' },
    { value: ItemCategory.OTHER, label: 'Otros' },
  ];

  // Filters calculation
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search Box matcher
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLoc) {
          return false;
        }
      }

      // Category tab matcher
      if (selectedCategory !== 'all') {
        if (item.category !== selectedCategory) {
          return false;
        }
      }

      // Status selector matcher
      if (selectedStatus !== 'any') {
        if (item.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // Date constraints
      if (dateFrom && item.date < dateFrom) return false;
      if (dateTo && item.date > dateTo) return false;

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedStatus, dateFrom, dateTo]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedCategoryStatus('any');
    setDateFrom('');
    setDateTo('');
setSearchQuery('');
  };

  return (
    <div className="flex flex-col gap-6 text-left pb-16 animate-fadeIn font-sans">
      <Breadcrumb />

      {/* Intro Header */}
      <div className="flex flex-col col-span-full">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Búsqueda Avanzada de Reportes
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
          Filtra, explora y audita de inmediato nuestro catálogo completo de objetos extraviados y encontrados.
        </p>
      </div>

      {/* Sticky top-bar search triggers */}
      <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md py-3 border-y border-slate-100 flex gap-3 shadow-xs">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            placeholder="Buscar objetos, coordenadas reportadas, marcas, colores..."
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 h-11 border rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
            showFilters || selectedCategory !== 'all' || selectedStatus !== 'any'
              ? 'bg-blue-50 border-[#004ac6] text-[#004ac6]'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtros</span>
        </button>
      </div>

      {/* Expandable filters options drawer panel */}
      {showFilters && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5 animate-slideDown text-left">
          {/* Category Filters row */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-3 font-mono">Filtrar por Categoría</span>
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    selectedCategory === cat.value
                      ? 'bg-[#004ac6] border-[#004ac6] text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status selection segment controls */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 block mb-3 uppercase font-mono">Estado del Objeto</span>
              <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl">
                {[
                  { value: 'any', label: 'Cualquiera' },
                  { value: 'lost', label: 'Perdido' },
                  { value: 'found', label: 'Encontrado' }
                ].map((statusOption) => (
                  <button
                    key={statusOption.value}
                    type="button"
                    onClick={() => setSelectedCategoryStatus(statusOption.value)}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      selectedStatus === statusOption.value
                        ? 'bg-[#004ac6] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {statusOption.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Date range pickers */}
          <div>
            <span className="text-[10px] font-extrabold text-[#94a3b8] block mb-3 uppercase font-mono">Rango de Fecha del Reporte</span>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 min-w-[120px] h-10 border border-slate-200 bg-slate-50/50 rounded-lg text-xs text-slate-700 px-3 outline-none cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase font-mono">al</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 min-w-[120px] h-10 border border-slate-200 bg-slate-50/50 rounded-lg text-xs text-slate-700 px-3 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Action CTAs inside filters drawer */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-2">
            <button
              onClick={handleClearFilters}
              className="flex-1 py-2 text-center text-xs font-bold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer uppercase font-mono tracking-wider"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 py-2 text-center text-xs font-bold bg-[#004ac6] text-white rounded-lg hover:bg-[#004ac6]/90 transition-colors shadow-xs cursor-pointer uppercase font-mono tracking-wider"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Results Header row options */}
      <section className="flex justify-between items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none font-mono">
          {filteredItems.length} {filteredItems.length === 1 ? 'Reporte Encontrado' : 'Reportes Encontrados'}
        </span>

        {/* View togglers */}
        <div className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50 flex-shrink-0">
          <button
            onClick={() => setIsGridView(true)}
            className={`p-1.5 rounded-md cursor-pointer transition-all ${
              isGridView
                ? 'bg-white text-[#004ac6] shadow-xs'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsGridView(false)}
            className={`p-1.5 rounded-md cursor-pointer transition-all ${
              !isGridView
                ? 'bg-white text-[#004ac6] shadow-xs'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Main Registry Data grid/list */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6 animate-pulse" />
          </div>
          <div className="max-w-xs">
            <h4 className="font-extrabold text-slate-800 text-sm">Sin Coincidencias Registradas</h4>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-normal">
              No logramos encontrar ningún reporte activo que coincida con tus palabras clave. Intenta de nuevo limpiando filtros.
            </p>
          </div>
          <button 
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 border border-slate-200 hover:border-[#004ac6] text-xs font-bold rounded-lg text-slate-700 mt-2 transition-colors cursor-pointer uppercase font-mono"
          >
            Limpiar Filtros de Búsqueda
          </button>
        </div>
      ) : isGridView ? (
        /* Grid Card Items Layout representation */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onViewItemDetail(item)}
              className="bg-white rounded-2xl border border-slate-200/50 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col text-left cursor-pointer group"
            >
              <div className="h-32 bg-slate-101 bg-slate-100 relative overflow-hidden">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={item.imageUrl}
                />
                
                {/* Visual Status stamp */}
                <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1 shadow-sm font-sans ${
                  item.status === ItemStatus.LOST
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  <span>{item.status === ItemStatus.LOST ? 'Perdido' : 'Encontrado'}</span>
                </div>
              </div>
              <div className="p-3.5 flex flex-col flex-grow gap-2.5">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-[#004ac6]">
                  {item.name}
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 h-8 font-normal">
                  {item.description}
                </p>
                <div className="flex flex-col gap-1 text-[10px] text-slate-400 mt-auto pt-1 font-semibold uppercase tracking-wider border-t border-slate-50 pb-0.5">
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Card Items Layout representation */
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onViewItemDetail(item)}
              className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-xs hover:border-[#004ac6]/30 flex gap-4 text-left cursor-pointer group transition-all"
            >
              {/* Flat thumb */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-lg overflow-hidden shrink-0 relative">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover"
                  src={item.imageUrl}
                />
              </div>

              {/* Detail body */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#004ac6] truncate">
                      {item.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 ${
                      item.status === ItemStatus.LOST
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.status === ItemStatus.LOST ? 'Perdido' : 'Encontrado'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-1 mt-1 font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex-wrap pt-1 border-t border-slate-50">
                  <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" /> {item.location}</span>
                  <span className="flex items-center gap-1 text-slate-500"><Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" /> {item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredItems.length > 0 && (
        <div className="flex justify-center mt-3">
          <button className="px-6 py-2.5 rounded-lg border border-slate-200/60 bg-white text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer uppercase font-mono tracking-wider">
            Cargar más resultados
          </button>
        </div>
      )}
    </div>
  );
}
