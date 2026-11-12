import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Bell, 
  ShieldCheck, 
  Plus, 
  Calculator, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

export const Header: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    triggerManualSync, 
    isSyncing, 
    lastSyncTime,
    alerts, 
    unreadAlertsCount,
    markAlertRead,
    markAllAlertsRead,
    setSelectedLot,
    lots
  } = useApp();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const filteredLots = searchQuery.trim() ? lots.filter(l => 
    l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.auctionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.state.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) : [];

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard Executivo';
      case 'auctions': return 'Central de Editais Públicos';
      case 'lots': return 'Catálogo e Central de Lotes';
      case 'monitoring': return 'Meu Monitoramento de Oportunidades';
      case 'favorites': return 'Lotes Favoritos & Notas de Arrematação';
      case 'alerts': return 'Central de Alertas & Notificações';
      case 'financial': return 'Análise de Viabilidade & Retorno Financeiro';
      case 'history': return 'Histórico & Rastreabilidade de Dados';
      case 'settings': return 'Configurações do Sistema & Integrações';
      default: return 'LanceRadar';
    }
  };

  return (
    <header className="h-16 bg-[#0b101d] border-b border-slate-800 flex items-center justify-between px-6 z-20 shrink-0">
      {/* Title & Path */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight">
          {getPageTitle()}
        </h1>
        <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          Receita Federal do Brasil
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="relative flex-1 max-w-md mx-6 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar lotes (ex: iPhone, MacBook, Hilux, Santos)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full bg-[#121929] border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-[#0f172a] border border-slate-700 rounded-lg shadow-2xl p-2 z-50 text-xs"
            onMouseLeave={() => setShowSearchResults(false)}
          >
            <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 flex items-center justify-between">
              <span>Resultados rápidos ({filteredLots.length})</span>
              <button 
                onClick={() => {
                  setShowSearchResults(false);
                  setCurrentPage('lots');
                }}
                className="text-blue-400 hover:underline"
              >
                Ver todos
              </button>
            </div>
            {filteredLots.length === 0 ? (
              <p className="p-3 text-slate-400 text-center">Nenhum lote correspondente encontrado.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredLots.map(lot => (
                  <button
                    key={lot.id}
                    onClick={() => {
                      setSelectedLot(lot);
                      setShowSearchResults(false);
                      setCurrentPage('lots');
                    }}
                    className="w-full text-left p-2 hover:bg-slate-800/70 rounded transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-slate-200 group-hover:text-blue-300">
                        Lote {lot.lotNumber}: {lot.description}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lot.auctionNumber} • {lot.city}/{lot.state} • Lance mín: R$ {lot.minimumBid.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sync Button */}
        <button
          onClick={triggerManualSync}
          disabled={isSyncing}
          title={`Última sincronização com SLE: ${formatDate(lastSyncTime)}`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden xl:inline">Sincronizar SLE</span>
        </button>

        {/* Quick Calculator Action */}
        <button
          onClick={() => setCurrentPage('financial')}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 transition-colors"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculadora</span>
        </button>

        {/* Quick New Rule Action */}
        <button
          onClick={() => setCurrentPage('monitoring')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Regra</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Alerts Popover */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white">Notificações do Sistema</span>
                  {unreadAlertsCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                      {unreadAlertsCount} novas
                    </span>
                  )}
                </div>
                {unreadAlertsCount > 0 && (
                  <button
                    onClick={markAllAlertsRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Marcar lidas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {alerts.slice(0, 5).map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      markAlertRead(alert.id);
                      if (alert.entityType === 'LOTE' && alert.entityId) {
                        const targetLot = lots.find(l => l.id === alert.entityId);
                        if (targetLot) setSelectedLot(targetLot);
                        setCurrentPage('lots');
                      } else {
                        setCurrentPage('alerts');
                      }
                      setShowAlertsDropdown(false);
                    }}
                    className={`p-3 cursor-pointer hover:bg-slate-800/50 transition-colors ${!alert.read ? 'bg-blue-950/20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                        <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{alert.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDate(alert.timestamp).split(' ')[1]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowAlertsDropdown(false);
                    setCurrentPage('alerts');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Abrir Central de Alertas Completa &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile avatar badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800">
            IS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">Israel S.</div>
            <div className="text-[10px] text-emerald-400 font-medium leading-tight">Operador Licenciado</div>
          </div>
        </div>
      </div>
    </header>
  );
};
