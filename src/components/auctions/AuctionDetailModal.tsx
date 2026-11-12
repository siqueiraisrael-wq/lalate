import React from 'react';
import { 
  X, 
  FileText, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Building2, 
  Download, 
  Package, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { Auction, Lot } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { StatusBadge, ParticipantBadge } from '../common/Badge';

interface AuctionDetailModalProps {
  auction: Auction;
  relatedLots: Lot[];
  onClose: () => void;
  onSelectLot: (lot: Lot) => void;
}

export const AuctionDetailModal: React.FC<AuctionDetailModalProps> = ({
  auction,
  relatedLots,
  onClose,
  onSelectLot
}) => {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-slate-900 to-[#131c31]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                EDITAL OFICIAL
              </span>
              <StatusBadge status={auction.status} />
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Edital nº {auction.number}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{auction.organ} • {auction.rfUnit}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div>
              <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Localização / UF
              </div>
              <div className="font-semibold text-slate-200">
                {auction.city} - {auction.state}
              </div>
              <div className="text-[11px] text-slate-400">{auction.rfUnit}</div>
            </div>

            <div>
              <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Cronograma de Propostas
              </div>
              <div className="text-slate-200">
                Abertura: <strong>{formatDate(auction.proposalOpenAt)}</strong>
              </div>
              <div className="text-rose-300">
                Fim do Envio: <strong>{formatDate(auction.proposalCloseAt)}</strong>
              </div>
            </div>

            <div>
              <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Package className="w-3.5 h-3.5 text-purple-400" />
                Sessão Pública de Lances
              </div>
              <div className="font-semibold text-slate-200">
                Início: {formatDate(auction.sessionStartAt)}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {auction.lotsCount} lotes autuados
              </div>
            </div>
          </div>

          {/* Observations */}
          {auction.notes && (
            <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-500/20 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-blue-300">Observações da Unidade Fiscal: </span>
              {auction.notes}
            </div>
          )}

          {/* Documentos Anexos e Links Oficiais */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Documentos Oficiais & Links de Acesso
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {auction.documents.map(doc => (
                <div key={doc.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded bg-blue-500/10 text-blue-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{doc.name}</div>
                      <div className="text-[10px] text-slate-400">{doc.size} • {doc.type}</div>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    onClick={(e) => { e.preventDefault(); alert(`Download demonstrativo: ${doc.name}`); }}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0 ml-2"
                    title="Baixar arquivo"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}

              <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/25 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-blue-500/20 text-blue-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Consulta no Portal SLE</div>
                    <div className="text-[10px] text-slate-400">Página oficial na Receita Federal</div>
                  </div>
                </div>
                <a
                  href={auction.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 transition"
                >
                  <span>Abrir</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Lotes Relacionados a este Edital */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                Lotes Catalogados neste Edital ({relatedLots.length})
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Edital {auction.number}
              </span>
            </div>

            {relatedLots.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400 bg-slate-900/50 rounded-lg">
                Nenhum lote catalogado especificamente para este edital nos dados demonstrativos.
              </p>
            ) : (
              <div className="space-y-2.5">
                {relatedLots.map(lot => (
                  <div 
                    key={lot.id}
                    onClick={() => {
                      onClose();
                      onSelectLot(lot);
                    }}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-blue-400">
                          LOTE {lot.lotNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {lot.category}
                        </span>
                        <ParticipantBadge type={lot.allowedParticipant} />
                      </div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 line-clamp-1 transition">
                        {lot.description}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Lance Mínimo</div>
                        <div className="text-xs font-black text-emerald-400">
                          {formatCurrency(lot.minimumBid)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                        <span>Ver Lote</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <div className="font-mono text-[11px]">
            Coleta: {formatDate(auction.collectedAt)} • Verificado: {formatDate(auction.lastVerifiedAt)}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
