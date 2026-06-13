/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { api } from '../api';
import { hasRealContent, isRepetitive, isGibberish } from '../utils/validation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface LoginViewProps {
  onLoginSuccess: (name: string, email: string, isAdmin: boolean) => void;
}

export function LoginView({
  onLoginSuccess,
}: LoginViewProps) {
  const location  = useLocation();
  const navigate  = useNavigate();
  // Destination the router saved before redirecting to /login
  const from: string = (location.state as { from?: string })?.from ?? '/';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError('');

    if (isSignUp) {
      const trimName = name.trim();
      if (!trimName || trimName.length < 2)
        return setError('El nombre debe tener al menos 2 caracteres.');
      if (!hasRealContent(trimName) || isRepetitive(trimName) || isGibberish(trimName))
        return setError('El nombre debe contener palabras reales.');
      if (!EMAIL_RE.test(email.trim()))
        return setError('El correo no tiene un formato válido.');

      setLoading(true);
      try {
        const user = await api.auth.register(
          trimName,
          email.trim(),
          password.trim()
        );
        setFeedback('¡Cuenta creada correctamente! Iniciando sesión...');
        setTimeout(() => {
          onLoginSuccess(user.name, user.email, false);
          navigate(from === '/login' ? '/panel' : from);
        }, 800);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al crear la cuenta.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const user = await api.auth.login(email.trim(), password.trim());
      const isAdmin = user.role === 'admin';
      setFeedback(`¡Bienvenido de vuelta, ${user.name}!`);
      setTimeout(() => {
        onLoginSuccess(user.name, user.email, isAdmin);
        const dest = from === '/login' ? (isAdmin ? '/admin' : '/panel') : from;
        navigate(dest);
      }, 800);
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left pb-16 items-center justify-center min-h-[500px] animate-fadeIn font-sans">
      <Breadcrumb className="self-start" />

      {/* Main double-sided login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden text-left">
        {/* Top visual flag */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#004ac6]"></div>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? 'Crear Cuenta FindIt' : 'Ingreso Seguro a la Red'}
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-semibold">
            {isSignUp 
              ? 'Únete a la red inteligente de localización y recuperación de objetos.' 
              : 'Accede a tus paneles de control, reportes activos y coordenadas de entrega.'}
          </p>
        </div>

        {feedback && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-[#004ac6] text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
            <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-ping"></span>
            <span>{feedback}</span>
          </div>
        )}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                maxLength={80}
                className="h-11 px-3.5 border border-slate-200 bg-slate-50/55 focus:bg-white rounded-xl text-sm text-slate-800 outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej. juan.perez@ejemplo.com"
                className="w-full h-11 pl-10 pr-4 border border-slate-200 bg-slate-50/55 focus:bg-white rounded-xl text-sm text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">Contraseña de Acceso</label>
              {!isSignUp && (
                <button type="button" className="text-[10px] text-[#004ac6] font-bold hover:underline cursor-pointer">¿La olvidaste?</button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-10 pr-10 border border-slate-200 bg-slate-50/55 focus:bg-white rounded-xl text-sm text-slate-800 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 bg-[#004ac6] hover:bg-[#004ac6]/90 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase font-mono tracking-wider"
          >
            {isSignUp ? <UserPlus className="w-4.5 h-4.5" /> : <LogIn className="w-4.5 h-4.5" />}
            <span>{loading ? 'Verificando...' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        {/* Toggle signin mode */}
        <div className="text-center text-xs font-semibold text-slate-400 mt-2">
          <span>{isSignUp ? '¿Ya estás registrado?' : '¿No tienes cuenta todavía?'}</span>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#004ac6] font-extrabold ml-1 hover:underline cursor-pointer"
          >
            {isSignUp ? 'Inicia Sesión' : 'Regístrate aquí'}
          </button>
        </div>

      </div>
    </div>
  );
}
