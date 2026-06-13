import { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '/':                     'Portal Principal',
  '/buscar':               'Buscar Reportes',
  '/panel':                'Panel de Control',
  '/crear':                'Nuevo Reporte',
  '/nosotros':             'Nosotros',
  '/soporte':              'Soporte',
  '/login':                'Iniciar Sesión',
  '/admin':                'Admin',
  '/admin/moderacion':     'Moderación',
  '/admin/usuarios':       'Usuarios',
  '/admin/analitica':      'Métricas de Red',
  '/admin/mensajes':       'Mensajes de Soporte',
};

const PARENT: Record<string, string> = {
  '/crear':               '/panel',
  '/admin/moderacion':    '/admin',
  '/admin/usuarios':      '/admin',
  '/admin/analitica':     '/admin',
  '/admin/mensajes':      '/admin',
};

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const crumbs: Array<{ label: string; path: string }> = [
    { label: 'Inicio', path: '/' },
  ];

  const parent = PARENT[path];
  if (parent && parent !== '/') {
    crumbs.push({ label: ROUTE_LABELS[parent] ?? parent, path: parent });
  }

  if (path !== '/') {
    crumbs.push({ label: ROUTE_LABELS[path] ?? path, path });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`px-1 py-1 mt-1 font-mono${className ? ` ${className}` : ''}`}
    >
      <ol className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={crumb.path}>
              {index > 0 && (
                <li className="text-slate-300" aria-hidden="true">/</li>
              )}
              <li>
                {!isLast ? (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="hover:text-[#004ac6] flex items-center gap-1 cursor-pointer"
                  >
                    {index === 0 && <Home className="w-3.5 h-3.5" />}
                    <span>{crumb.label}</span>
                  </button>
                ) : (
                  <span className="text-[#004ac6] font-bold flex items-center gap-1" aria-current="page">
                    {index === 0 && <Home className="w-3.5 h-3.5" />}
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
