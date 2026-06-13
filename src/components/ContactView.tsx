/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { api } from '../api';
import { hasRealContent, isRepetitive, isGibberish } from '../utils/validation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactView() {
  // Collapsible FAQ states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const faqList = [
    {
      q: '¿Cómo reporto un objeto perdido o encontrado?',
      a: 'Inicia sesión, ve a "Reportar Objeto" en el menú lateral y llena el formulario con el nombre, categoría, color, marca, descripción y ubicación. Tu reporte queda en revisión hasta que un administrador lo apruebe y se publique en el buscador público.'
    },
    {
      q: '¿Cómo solicito la devolución de un objeto que es mío?',
      a: 'Busca el objeto en el buscador, abre su ficha y presiona "Solicitar Devolución". Llena el formulario explicando por qué es tuyo. Un coordinador revisará la solicitud, la aprobará y se pondrán en contacto contigo y con quien lo encontró para coordinar la entrega.'
    },
    {
      q: '¿Qué hago si encontré un objeto perdido de alguien más?',
      a: 'Busca el objeto en el buscador. Si aparece reportado como perdido, abre su ficha y presiona "Encontré este Objeto". Si no aparece, créa un nuevo reporte con estado "Encontrado". En ambos casos un coordinador gestionará la devolución al dueño.'
    },
    {
      q: '¿Qué pasa después de que el admin aprueba la entrega?',
      a: 'Ambas partes recibirán el correo del otro para coordinar el encuentro. Una vez realizada la entrega, cada quien entra a su Panel y presiona el botón de confirmación ("Ya entregué el objeto" / "Ya recibí mi objeto"). Cuando ambos confirman, el objeto se marca como recuperado y desaparece del buscador.'
    },
    {
      q: '¿Tiene algún costo utilizar FindIt?',
      a: 'No, el uso de FindIt es completamente gratuito para todos los usuarios. Solo necesitas registrarte con tu correo para poder reportar objetos, hacer solicitudes y hacer seguimiento desde tu panel.'
    },
  ];

  const handleMessageSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim())
      return setError('El nombre es obligatorio.');
    if (!hasRealContent(name) || isRepetitive(name))
      return setError('El nombre debe contener palabras reales.');

    if (!email.trim())
      return setError('El correo es obligatorio.');
    if (!EMAIL_RE.test(email.trim()))
      return setError('El correo no tiene un formato válido.');

    if (subject.trim() && (!hasRealContent(subject) || isRepetitive(subject)))
      return setError('El asunto debe contener texto real.');

    if (!message.trim())
      return setError('El mensaje es obligatorio.');
    if (message.trim().split(/\s+/).filter(Boolean).length < 5)
      return setError('El mensaje debe tener al menos 5 palabras.');
    if (!hasRealContent(message) || isRepetitive(message) || isGibberish(message))
      return setError('El mensaje debe contener palabras reales en español o inglés.');

    setLoading(true);
    try {
      await api.contact.send({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError('No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-6 text-left pb-16 animate-fadeIn font-sans">
      <Breadcrumb />

      {/* Intro Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#011B33] tracking-tight">
          Soporte y FAQs
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
          Ponte en contacto directo con nuestros coordinadores o revisa de inmediato las preguntas técnicas más frecuentes.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Tu mensaje ha sido enviado! Un agente de soporte técnico te responderá por correo dentro de las siguientes 24 horas.</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
          <span>{error}</span>
        </div>
      )}

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left pane: Details and Collapsible FAQs */}
        <div className="flex flex-col gap-6">
          {/* Quick contact Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Datos de Contacto</h2>
            
            <div className="flex flex-col gap-3 text-xs font-medium text-slate-600">
              <a
                href="mailto:soporte@findit.mx"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 hover:text-[#004ac6] transition-colors"
              >
                <Mail className="w-4.5 h-4.5 text-[#004ac6] shrink-0" />
                <span>soporte@findit.mx</span>
              </a>
              <a
                href="tel:+521212121212"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 hover:text-[#004ac6] transition-colors"
              >
                <Phone className="w-4.5 h-4.5 text-[#004ac6] shrink-0" />
                <span>+52 (121) 212-1212</span>
              </a>
              <div className="flex items-center gap-3 p-2.5 rounded-lg text-slate-500">
                <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <span>Calle Pendiente #100, Col. Centro, Ciudad, Estado</span>
              </div>
            </div>
          </div>

          {/* Collapsible FAQ sections */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4.5 h-4.5 text-[#004ac6]" />
              <span>Preguntas Frecuentes</span>
            </h2>

            <div className="flex flex-col divide-y divide-slate-100">
              {faqList.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between gap-3 text-left font-bold text-xs sm:text-sm text-slate-800 hover:text-[#004ac6] transition-colors cursor-pointer outline-none"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <p className="text-slate-500 text-xs sm:text-sm mt-2 sm:mt-2.5 leading-relaxed font-normal transition-all duration-300">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right pane: Elegant Interactive Message Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs flex flex-col gap-4 text-left">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Contacto Directo</h2>
          
          <form onSubmit={handleMessageSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="contactName">Nombre Completo *</label>
              <input
                id="contactName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                maxLength={80}
                className="h-10 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="contactEmail">Correo Electrónico *</label>
              <input
                id="contactEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan.perez@ejemplo.com"
                maxLength={100}
                className="h-10 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="contactSubject">Asunto</label>
              <input
                id="contactSubject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej. Pregunta sobre mi coincidencia de llaves"
                maxLength={120}
                className="h-10 px-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="contactMessage">Tu Mensaje *</label>
              <textarea
                id="contactMessage"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe los detalles de tu pregunta, reporte o reclamación aquí..."
                maxLength={1000}
                className="p-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-lg text-sm text-slate-800 outline-none resize-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Mín. 5 palabras</span>
                <span>{message.length}/1000</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full h-11 bg-[#004ac6] hover:bg-[#004ac6]/90 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Enviando...' : 'Enviar Mensaje de Soporte'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
