import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ShieldCheck, 
  Clock, 
  Database, 
  Activity, 
  FileText, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

export const HistoryView: React.FC = () => {
  const { lots, collectionLogs, setSelectedLot, setCurrentPage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Lots that have historical mutations
  const lotsWithHistory = lots.filter(l => l.history && l.history.length > 0);

  const filteredLots = lots.filter(l => 
    l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.auctionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.lotNumber.toString() === searchTerm.trim()
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Histórico, Auditoria & Rastreabilidade de Dados
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Trilha de auditoria das coletas oficiais, preservação cronológica de retificações e carimbo temporal de verificação.
        </p>
      </div>

      {/* Collector Health & Synchronization Logs */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Registro de Auditoria de Coletas (Robô SLE Receita Federal)
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Última Verificação: 100% íntegra
          </span>
        </div>

        <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60 text-xs">
          {collectionLogs.map(log => (
            <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold text-[10px] border border-emerald-500/25">
                    {log.status}
                  </span>
                  <span className="font-mono text-slate-300 font-medium">{log.sourceUrl}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {log.details}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 shrink-0">
                <div>
                  Editais: <span className="text-white font-bold">{log.auctionsProcessed}</span> • Lotes: <span className="text-white font-bold">{log.lotsExtracted}</span>
                </div>
                <div>
                  Latência: <span className="text-blue-400">{log.latencyMs} ms</span>
                </div>
                <div>
                  {formatDate(log.completedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lots Audit Trail */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Rastreabilidade de Ciclo de Vida dos Lotes ({lots.length})
            </h3>
            <p className="text-xs text-slate-400">
              Diferenciação clara entre publicação oficial, primeira coleta pelo robô e última verificação.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar lote no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121929] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">Lote / Edital</th>
                <th className="p-3.5">Primeira Coleta</th>
                <th className="p-3.5">Última Verificação</th>
                <th className="p-3.5">Alterações Históricas</th>
                <th className="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLots.map(lot => {
                const hasChanges = lot.history && lot.history.length > 0;
                return (
                  <tr key={lot.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white">Lote {lot.lotNumber}: {lot.description}</div>
                      <div className="font-mono text-[10px] text-slate-400">Edital {lot.auctionNumber} • {lot.city}/{lot.state}</div>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-300">
                      {formatDate(lot.collectedAt)}
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-emerald-400">
                      {formatDate(lot.lastVerifiedAt)}
                    </td>

                    <td className="p-3.5">
                      {hasChanges ? (
                        <div className="space-y-1">
                          {lot.history.map(h => (
                            <span key={h.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 mr-1.5 mb-1">
                              {h.fieldChanged}: {h.oldValue} &rarr; {h.newValue}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">
                          Sem alterações desde a publicação oficial.
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedLot(lot);
                          setCurrentPage('lots');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium text-xs transition"
                      >
                        Abrir Dossiê
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
