/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import {
  Camera,
  ClipboardCheck,
  AlertCircle,
  Megaphone,
  HeartHandshake,
  Loader2,
  X,
} from 'lucide-react';
import { api } from '../api';
import { ItemCategory, ItemStatus, LostOrFoundItem, NavigationTab } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { hasRealContent, isRepetitive, isGibberish } from '../utils/validation';

const TODAY = new Date().toISOString().split('T')[0];
const MIN_DATE = new Date(Date.now() - 2 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface CreateReportViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onSubmitReport: (item: Partial<LostOrFoundItem>) => Promise<void>;
  initialStatus: ItemStatus;
  userName: string;
  userEmail: string;
}

export function CreateReportView({
  onNavigate,
  onSubmitReport,
  initialStatus,
  userName,
  userEmail,
}: CreateReportViewProps) {
  // Form Core states
  const [status, setStatus] = useState<ItemStatus>(initialStatus || ItemStatus.LOST);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.ELECTRONICS);
  const [primaryColor, setPrimaryColor] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState('');
  const [locationContext, setLocationContext] = useState('');
  
  const [imageUrl, setImageUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX = 1100;
        const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          blob => blob
            ? resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
            : reject(new Error('Error al comprimir la imagen')),
          'image/jpeg', 0.82
        );
      };
      img.onerror = () => reject(new Error('No se pudo leer la imagen'));
      img.src = objectUrl;
    });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024)
      return setUploadError('La imagen no puede pesar más de 15 MB.');
    setUploadError('');
    setUploadLoading(true);
    try {
      const compressed = await compressImage(file);
      const { url } = await api.upload.image(compressed);
      setImageUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  // Pre-fill button helper to make testing easy and fun!
const handlePostReport = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 3)
      return setErrorMsg('El nombre debe tener al menos 3 caracteres.');
    if (name.trim().length > 80)
      return setErrorMsg('El nombre no puede superar 80 caracteres.');
    if (!hasRealContent(name) || isRepetitive(name))
      return setErrorMsg('El nombre debe contener palabras reales, sin símbolos ni repeticiones excesivas.');

    if (!location.trim())
      return setErrorMsg('La ubicación general o edificio es obligatoria.');
    if (!hasRealContent(location) || isRepetitive(location))
      return setErrorMsg('La ubicación debe contener texto real, sin símbolos ni repeticiones.');

    if (date > TODAY)
      return setErrorMsg('La fecha no puede ser en el futuro.');
    if (date < MIN_DATE)
      return setErrorMsg('La fecha no puede ser de hace más de 2 años.');
    if (date === TODAY && time) {
      const nowTime = new Date().toTimeString().slice(0, 5);
      if (time > nowTime)
        return setErrorMsg('La hora no puede ser en el futuro.');
    }

    if (description.trim()) {
      if (wordCount(description) < 5)
        return setErrorMsg('La descripción debe tener al menos 5 palabras.');
      if (!hasRealContent(description) || isRepetitive(description) || isGibberish(description))
        return setErrorMsg('La descripción debe contener palabras reales en español o inglés.');
    }

    for (const [label, val] of [['Color', primaryColor], ['Marca', brand], ['Referencia', locationContext]] as [string, string][]) {
      if (val.trim() && (!hasRealContent(val) || isRepetitive(val)))
        return setErrorMsg(`El campo "${label}" debe contener texto real.`);
    }

    const categoryLabels: Record<ItemCategory, string> = {
      [ItemCategory.ELECTRONICS]: 'Electrónica y Celulares',
      [ItemCategory.WALLETS]: 'Carteras e Identificaciones',
      [ItemCategory.KEYS]: 'Llaves y Accesos',
      [ItemCategory.BAGS]: 'Mochilas y Bolsas',
      [ItemCategory.CLOTHING]: 'Ropa y Accesorios',
      [ItemCategory.PETS]: 'Mascotas y Animales',
      [ItemCategory.OTHER]: 'Otras Categorías'
    };

    const finalImage = imageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400';

    const newItem: Partial<LostOrFoundItem> = {
      name: name.trim(),
      category,
      categoryLabel: categoryLabels[category],
      status,
      primaryColor: primaryColor.trim() || 'Sin especificar',
      brand: brand.trim() || 'Sin especificar',
      description: description.trim() || 'No se proporcionó descripción.',
      date: time ? `${date} ${time}` : date,
      location: location.trim(),
      locationContext: locationContext.trim(),
      imageUrl: finalImage,
      reportedBy: userName,
      reportedEmail: userEmail,
    };

    setSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmitReport(newItem);
      setFeedbackMsg('¡Reporte registrado con éxito! Redirigiendo al catálogo...');
      setTimeout(() => onNavigate(NavigationTab.SEARCH), 1800);
    } catch {
      setErrorMsg('Error al guardar el reporte. Intenta de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left pb-16 animate-fadeIn font-sans">
      <Breadcrumb />

      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reportar Objeto {status === ItemStatus.LOST ? 'Perdido' : 'Encontrado'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Proporciona detalles específicos y referencias de localización concretas para agilizar la coincidencia.
          </p>
        </div>

        {/* Change Report Class Toggle widget */}
        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => setStatus(ItemStatus.LOST)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 leading-none ${
              status === ItemStatus.LOST
                ? 'bg-rose-50 text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Objeto Perdido</span>
          </button>
          <button
            type="button"
            onClick={() => setStatus(ItemStatus.FOUND)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 leading-none ${
              status === ItemStatus.FOUND
                ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Objeto Encontrado</span>
          </button>
        </div>
      </div>

      {feedbackMsg ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
          <ClipboardCheck className="w-5 h-5 text-emerald-600 animate-bounce shrink-0" />
          <span className="font-semibold text-sm">{feedbackMsg}</span>
        </div>
      ) : null}

      {errorMsg ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold text-sm">{errorMsg}</span>
        </div>
      ) : null}

<form onSubmit={handlePostReport} className="flex flex-col gap-6">
        {/* Basic specifications Card container */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/50 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-gray-100 pb-2">Datos Básicos</h2>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700" htmlFor="itemName">Nombre de la Pertenencia *</label>
            <input
              id="itemName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. iPhone 13 Pro Sépia, Cartera de Piel Café, Llaves de casa"
              maxLength={80}
              className="h-11 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
            />
            <span className="text-[10px] text-slate-400 self-end">{name.length}/80</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700" htmlFor="itemCategory">Categoría del Objeto *</label>
            <div className="relative">
              <select
                id="itemCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full h-11 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 outline-none transition-all focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] cursor-pointer"
              >
                <option value={ItemCategory.ELECTRONICS}>Electrónica y Celulares</option>
                <option value={ItemCategory.WALLETS}>Carteras e Identificaciones</option>
                <option value={ItemCategory.KEYS}>Llaves y Accesos</option>
                <option value={ItemCategory.BAGS}>Mochilas y Bolsas</option>
                <option value={ItemCategory.CLOTHING}>Ropa y Accesorios</option>
                <option value={ItemCategory.PETS}>Mascotas y Animales</option>
                <option value={ItemCategory.OTHER}>Otras Categorías</option>
              </select>
            </div>
          </div>
        </div>

        {/* Specific characteristics section */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/50 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-gray-100 pb-2">Características Específicas</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="primaryColor">Color Principal</label>
              <input
                id="primaryColor"
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="Ej. Negro Medianoche, Café, Plateado"
                maxLength={40}
                className="h-11 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="brand">Marca / Fabricante</label>
              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej. Apple, Herschel, Samsonite"
                maxLength={50}
                className="h-11 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700" htmlFor="description">Detalles Adicionales y Rasgos Distintivos</label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe rayones de importancia, adornos, calcomanías, fondos de pantalla, tarjetas interiores..."
              maxLength={500}
              className="p-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{description.trim() ? `${wordCount(description)} palabra${wordCount(description) !== 1 ? 's' : ''} (mín. 5)` : 'Opcional — mín. 5 palabras si describes'}</span>
              <span>{description.length}/500</span>
            </div>
          </div>
        </div>

        {/* Time and location details Card container */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/50 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-gray-100 pb-2">Fecha y Ubicación</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="date">¿Cuándo ocurrió? — Fecha *</label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={MIN_DATE}
                max={TODAY}
                className="h-11 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="time">Hora aproximada</label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                max={date === TODAY ? new Date().toTimeString().slice(0, 5) : undefined}
                className="h-11 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Ubicación General / Lugar *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Plaza San Luis, CETYS, Mercado Hidalgo"
                maxLength={100}
                className="h-11 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Referencia Adicional</label>
              <input
                type="text"
                value={locationContext}
                onChange={(e) => setLocationContext(e.target.value)}
                placeholder="Ej. Cerca de la fuente, en el pasillo norte"
                maxLength={150}
                className="h-11 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Media visual attachments container */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/50 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Archivos Adjuntos</h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase font-mono">Opcional</span>
          </div>

          <div
            onClick={() => !uploadLoading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-[#004ac6] bg-slate-50/20 rounded-xl flex flex-col items-center justify-center py-8 px-4 gap-3 transition-colors cursor-pointer group"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Vista previa" className="max-h-48 rounded-lg object-cover shadow-sm" />
            ) : uploadLoading ? (
              <Loader2 className="w-8 h-8 text-[#004ac6] animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-[#e5eeff] group-hover:text-[#004ac6] transition-colors">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-xs text-slate-800">Haz clic para subir una foto</p>
                  <p className="text-slate-400 text-[10px] mt-1 font-normal">PNG, JPG, WEBP — máx. 5 MB</p>
                </div>
              </>
            )}
          </div>

          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-semibold self-start"
            >
              <X className="w-3 h-3" /> Quitar imagen
            </button>
          )}
          {uploadError && (
            <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#004ac6] hover:bg-[#004ac6]/90 disabled:opacity-60 text-white font-extrabold text-sm h-14 rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4.5 h-4.5" />
            <span>{submitting ? 'Guardando reporte...' : 'Enviar Reporte para Revisión'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
