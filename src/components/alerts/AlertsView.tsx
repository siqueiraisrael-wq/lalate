import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  TrendingDown, 
  Radar, 
  ShieldAlert,
  ArrowRight,
  Send,
  Mail,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AlertType, AlertNotification } from '../../types';
import { formatDate } from '../../utils/formatters';

export const AlertsView: React.FC = () => {
  const { 
    alerts, 
    markAlertRead, 
    markAllAlertsRead, 
    unreadAlertsCount,
    setSelectedLot,
    setSelectedAuction,
    setCurrentPage,
    lots,
    auctions,
    settings
  } = useApp();

  const [filterType, setFilterType] = useState<string>('TODOS');

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'ENCERRAMENTO_24H':
      case 'ENCERRAMENTO_48H':
        return <Clock className="w-4 h-4 text-rose-400" />;
      case 'REGRA_MONITORAMENTO':
        return <Radar className="w-4 h-4 text-blue-400" />;
      case 'ALTERACAO_PRECO':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      case 'ERRATA':
      case 'EDITAL_ATUALIZADO':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'NOVO_EDITAL':
      case 'NOVO_LOTE':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredAlerts = filterType === 'TODOS'
    ? alerts
    : alerts.filter(a => a.type === filterType);

  const handleOpenItem = (alert: AlertNotification) => {
    markAlertRead(alert.id);
    if (alert.entityType === 'LOTE') {
      const lot = lots.find(l => l.id === alert.entityId);
      if (lot) {
        setSelectedLot(lot);
        setCurrentPage('lots');
      }
    } else {
      const auction = auctions.find(a => a.id === alert.entityId || a.number === alert.editalNumber);
      if (auction) {
        setSelectedAuction(auction);
        setCurrentPage('auctions');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Central de Alertas & Notificações de Oportunidades
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro cronológico de retificações, erratas, reduções de preço e encerramentos críticos.
          </p>
        </div>

        {unreadAlertsCount > 0 && (
          <button
            onClick={markAllAlertsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Marcar Todas como Lidas ({unreadAlertsCount})</span>
          </button>
        )}
      </div>

      {/* Integration channels status bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Canal Telegram Bot</div>
              <div className="text-[11px] text-slate-400">
                {settings.telegramEnabled ? `Ativo: Chat ID ${settings.telegramChatId}` : 'Aguardando configuração de Token/Chat ID'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('settings')}
            className="text-xs text-blue-400 hover:underline font-medium"
          >
            Configurar
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Canal E-mail (SMTP)</div>
              <div className="text-[11px] text-slate-400">
                {settings.emailNotifications ? `Ativo: ${settings.emailAddress}` : 'Desativado'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('settings')}
            className="text-xs text-blue-400 hover:underline font-medium"
          >
            Configurar
          </button>
        </div>
      </div>

      {/* Filters by Alert Type */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase shrink-0">Filtrar por:</span>
        {[
          { id: 'TODOS', label: 'Todos os Alertas' },
          { id: 'ENCERRAMENTO_24H', label: 'Encerramento 24h' },
          { id: 'REGRA_MONITORAMENTO', label: 'Regras de Monitoramento' },
          { id: 'ALTERACAO_PRECO', label: 'Alteração de Preço' },
          { id: 'ERRATA', label: 'Erratas & Editais' },
          { id: 'NOVO_EDITAL', label: 'Novos Editais' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterType(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
              filterType === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-[#0f172a] border border-slate-800 rounded-xl space-y-2">
            <Bell className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">Nenhum alerta nesta categoria</h3>
            <p className="text-xs text-slate-400">Você receberá notificações automáticas conforme novos editais forem capturados.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => handleOpenItem(alert)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                !alert.read
                  ? 'bg-[#101b33] border-blue-500/40 hover:border-blue-400 shadow-md shadow-blue-500/5'
                  : 'bg-[#0f172a] border-slate-800 hover:border-slate-700 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  alert.type === 'ENCERRAMENTO_24H'
                    ? 'bg-rose-500/20 text-rose-300'
                    : alert.type === 'ERRATA'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {getAlertIcon(alert.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {alert.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-500 text-[10px]">•</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDate(alert.timestamp)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-1">
                    {alert.title}
                  </h4>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {alert.description}
                  </p>

                  {alert.editalNumber && (
                    <div className="mt-2 text-[11px] text-slate-400 font-mono">
                      Ref: Edital <strong>{alert.editalNumber}</strong>
                      {alert.lotNumber && ` • Lote ${alert.lotNumber}`}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <span className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Examinar Ocorrência</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
