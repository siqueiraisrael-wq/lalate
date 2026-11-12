import React from 'react';
import { AuctionStatus, LotStatus, ParticipantType } from '../../types';

export const StatusBadge: React.FC<{ status: AuctionStatus | LotStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'PROPOSTAS_ABERTAS':
    case 'ABERTO':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Propostas Abertas
        </span>
      );
    case 'AGENDADO':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Agendado
        </span>
      );
    case 'EM_DISPUTA':
    case 'EM_LEILAO':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Sessão em Andamento
        </span>
      );
    case 'ENCERRADO':
    case 'ARREMATADO':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 ${className}`}>
          Encerrado
        </span>
      );
    case 'SUSPENSO':
    case 'CANCELADO':
    case 'NAO_ARREMATADO':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 ${className}`}>
          {status === 'SUSPENSO' ? 'Suspenso' : status === 'CANCELADO' ? 'Cancelado' : 'Não Arrematado'}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 ${className}`}>
          {status}
        </span>
      );
  }
};

export const ParticipantBadge: React.FC<{ type: ParticipantType; className?: string }> = ({ type, className = '' }) => {
  if (type === 'AMBOS') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 ${className}`}>
        PF e PJ
      </span>
    );
  }
  if (type === 'APENAS_PF') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 ${className}`}>
        Apenas Pessoa Física
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 ${className}`}>
      Apenas PJ
    </span>
  );
};
