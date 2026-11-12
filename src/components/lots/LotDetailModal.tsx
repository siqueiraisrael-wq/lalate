import React, { useState } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Bookmark, 
  Calculator, 
  ShieldCheck, 
  FileText, 
  Clock, 
  History, 
  Info, 
  AlertTriangle,
  Building,
  Save,
  Check
} from 'lucide-react';
import { Lot } from '../../types';
import { formatCurrency, formatDate, getTimeRemaining } from '../../utils/formatters';
import { StatusBadge, ParticipantBadge } from '../common/Badge';
import { useApp } from '../../context/AppContext';

interface LotDetailModalProps {
  lot: Lot;
  onClose: () => void;
  onOpenFinancialAnalysis: (lot: Lot) => void;
}

export const LotDetailModal: React.FC<LotDetailModalProps> = ({
  lot,
  onClose,
  onOpenFinancialAnalysis
}) => {
  const { isFavorite, toggleFavorite, favorites, updateFavoriteNotes } = useApp();
  const favorite = favorites.find(f => f.lotId === lot.id);
  const isFav = !!favorite;

  const [notes, setNotes] = useState(favorite?.personalNotes || '');
  const [targetBid, setTargetBid] = useState(favorite?.targetBid?.toString() || '');
  const [savedNotesFeedback, setSavedNotesFeedback] = useState(false);

  const { text: timeText, isUrgent } = getTimeRemaining(lot.proposalCloseAt);

  const handleSaveNotes = () => {
    if (!isFav) {
      toggleFavorite(lot.id);
    }
    updateFavoriteNotes(lot.id, notes, targetBid ? parseFloat(targetBid) : undefined);
    setSavedNotesFeedback(true);
    setTimeout(() => setSavedNotesFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#11192e] to-slate-900 flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-blue-600 text-white font-extrabold tracking-wide">
                LOTE {lot.lotNumber}
              </span>
              <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Edital: {lot.auctionNumber}
              </span>
              <StatusBadge status={lot.status} />
              <ParticipantBadge type={lot.allowedParticipant} />
              {isUrgent && (
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-pulse" />
                  {timeText}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">
              {lot.description}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{lot.city} - {lot.state} • Categoria: <strong>{lot.category}</strong></span>
              {lot.itemsCount !== null && (
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {lot.itemsCount} {lot.itemsCount > 1 ? 'itens' : 'item'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(lot.id)}
              className={`p-2.5 rounded-xl border transition ${
                isFav
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
              }`}
              title={isFav ? 'Remover dos favoritos' : 'Favoritar este lote'}
            >
              <Bookmark className={`w-5 h-5 ${isFav ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Price & Primary Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="text-xs text-slate-400 font-medium">Preço Mínimo Oficial</div>
              <div className="text-2xl font-black text-emerald-400 my-1">
                {formatCurrency(lot.minimumBid)}
              </div>
              <div className="text-[11px] text-slate-400">
                Valor homologado pela comissão de leilão
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Encerramento de Propostas
              </div>
              <div className="text-sm font-bold text-white my-1">
                {formatDate(lot.proposalCloseAt)}
              </div>
              <div className="text-xs text-amber-400 font-semibold">
                {timeText}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex flex-col justify-between">
              <div className="text-xs text-blue-300 font-semibold flex items-center gap-1">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Análise Financeira Rápida
              </div>
              <div className="text-xs text-slate-300 my-1">
                Calcule ROI, custos de frete, impostos e lucro líquido antes de lançar.
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenFinancialAnalysis(lot);
                }}
                className="mt-2 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Abrir na Calculadora</span>
              </button>
            </div>
          </div>

          {/* Descrição Completa */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              Descrição Detalhada do Lote
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {lot.fullDescription || lot.description}
            </p>
            {lot.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {lot.tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Logistics: Armazenamento, Visitação, Retirada e Destinação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-400" />
                Local de Armazenagem & Visitação
              </div>
              <p className="text-slate-300">{lot.storageLocation}</p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <strong>Horário para visitação:</strong> {lot.visitationSchedule}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Condições de Retirada & Destinação
              </div>
              <p className="text-slate-300">{lot.pickupConditions}</p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <strong className="text-amber-300">Restrições legais:</strong> {lot.destinationRestrictions}
              </div>
            </div>
          </div>

          {/* Histórico e Auditoria do Lote */}
          {lot.history && lot.history.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-400" />
                Rastreabilidade de Alterações Detectadas ({lot.history.length})
              </h3>
              <div className="space-y-2">
                {lot.history.map(hist => (
                  <div key={hist.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-blue-300">
                        Alteração em: {hist.fieldChanged}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        De: <span className="line-through text-slate-400">{hist.oldValue}</span> &rarr; Para: <span className="text-emerald-300 font-medium">{hist.newValue}</span>
                      </div>
                      {hist.reason && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">{hist.reason}</div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {formatDate(hist.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal User Notes & Target Bid */}
          <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                Anotações Estratégicas Pessoais do Usuário
              </h3>
              {savedNotesFeedback && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Salvo com sucesso!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-[11px] text-slate-400 mb-1 block">
                  Anotações sobre este lote (análise de risco, detalhes mecânicos, estratégia de lance):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Verificar custo do frete no porto de Santos; conferir tabela FIPE..."
                  rows={2}
                  className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">
                  Lance Máximo Planejado (R$):
                </label>
                <input
                  type="number"
                  value={targetBid}
                  onChange={(e) => setTargetBid(e.target.value)}
                  placeholder="Ex: 5500"
                  className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-2"
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Anotações</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Verification Stamp */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Coletado em: {formatDate(lot.collectedAt)} • Verificado: {formatDate(lot.lastVerifiedAt)}</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={lot.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <span>Ver no Portal SLE Oficial</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
