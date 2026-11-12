import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Radar, 
  Bookmark, 
  Bell, 
  TrendingUp, 
  History, 
  Settings, 
  ShieldAlert,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useApp, NavigationPage } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    unreadAlertsCount, 
    matches, 
    favorites,
    isSyncing 
  } = useApp();

  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'auctions', label: 'Editais', icon: <FileText className="w-5 h-5" /> },
    { id: 'lots', label: 'Todos os Lotes', icon: <Package className="w-5 h-5" /> },
    { 
      id: 'monitoring', 
      label: 'Monitoramento', 
      icon: <Radar className="w-5 h-5" />, 
      badge: matches.length > 0 ? matches.length : undefined, 
      badgeColor: 'bg-blue-600 text-white' 
    },
    { 
      id: 'favorites', 
      label: 'Favoritos', 
      icon: <Bookmark className="w-5 h-5" />, 
      badge: favorites.length > 0 ? favorites.length : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    { 
      id: 'alerts', 
      label: 'Alertas', 
      icon: <Bell className="w-5 h-5" />, 
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeColor: 'bg-rose-600 text-white animate-pulse'
    },
    { id: 'financial', label: 'Análise de Oportunidades', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'history', label: 'Histórico & Rastreabilidade', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-[#0d1424] border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10">
            <Radar className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0d1424] animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0d1424]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">Lance</span>
              <span className="font-extrabold text-lg tracking-tight text-blue-400">Radar</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">M1</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">Leilões Receita Federal</p>
          </div>
        </div>

        {/* Slogan pill */}
        <p className="mt-3 text-[11px] text-slate-400 italic font-normal leading-relaxed border-l-2 border-blue-500/50 pl-2">
          &ldquo;Encontre oportunidades antes que elas desapareçam.&rdquo;
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Módulos da Plataforma
        </div>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Status & Official RFB Portal Reference */}
      <div className="p-3 border-t border-slate-800 bg-[#090e1a]/60 space-y-2">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-spin' : 'bg-emerald-400'}`} />
              Conexão SLE
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">200 OK</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            portal/sle-sociedade
          </p>
          <a 
            href="https://www25.receita.fazenda.gov.br/sle-sociedade/portal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <span>Acessar portal oficial</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Demo notification banner */}
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 leading-snug flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span><strong>Marco 1:</strong> Dados demonstrativos identificados para validação da arquitetura e fluxos.</span>
        </div>
      </div>
    </aside>
  );
};
