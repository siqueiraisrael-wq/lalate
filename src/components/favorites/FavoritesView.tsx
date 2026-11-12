import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Calculator, 
  MapPin, 
  Clock, 
  Download, 
  FileText, 
  Edit3, 
  Save, 
  ExternalLink,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getTimeRemaining } from '../../utils/formatters';
import { ParticipantBadge } from '../common/Badge';

export const FavoritesView: React.FC = () => {
  const { 
    favorites, 
    lots, 
    toggleFavorite, 
    updateFavoriteNotes, 
    setSelectedLot, 
    setCurrentPage, 
    startFinancialAnalysisForLot 
  } = useApp();

  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [editedTargetBid, setEditedTargetBid] = useState<string>('');

  // Pair favorites with lot details
  const favoriteItems = favorites.map(fav => {
    const lot = lots.find(l => l.id === fav.lotId);
    return { fav, lot };
  }).filter((item): item is { fav: typeof item.fav; lot: NonNullable<typeof item.lot> } => item.lot !== undefined);

  const startEdit = (lotId: string, currentNotes: string, currentTargetBid?: number) => {
    setEditingLotId(lotId);
    setEditedNotes(currentNotes);
    setEditedTargetBid(currentTargetBid ? currentTargetBid.toString() : '');
  };

  const saveEdit = (lotId: string) => {
    updateFavoriteNotes(lotId, editedNotes, editedTargetBid ? parseFloat(editedTargetBid) : undefined);
    setEditingLotId(null);
  };

  const exportFavoritesJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(favoriteItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lanceradar_favoritos_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />
            Lotes Favoritos & Notas Estratégicas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organize suas oportunidades selecionadas com anotações de inspeção e teto de lance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {favoriteItems.length > 0 && (
            <button
              onClick={exportFavoritesJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar Dados (JSON)</span>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {favoriteItems.length === 0 ? (
        <div className="p-16 text-center bg-[#0f172a] border border-slate-800 rounded-xl space-y-3">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">Nenhum lote favoritado ainda</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ao navegar pela Central de Lotes ou pelo Dashboard, clique no ícone de marcador para salvar oportunidades com notas pessoais.
          </p>
          <button
            onClick={() => setCurrentPage('lots')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md"
          >
            Explorar Catálogo de Lotes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteItems.map(({ fav, lot }) => {
            const { text: timeText, isUrgent } = getTimeRemaining(lot.proposalCloseAt);
            const isEditing = editingLotId === lot.id;

            return (
              <div
                key={lot.id}
                className="bg-[#0f172a] border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 flex flex-col justify-between shadow-sm transition group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        LOTE {lot.lotNumber}
                      </span>
                      <ParticipantBadge type={lot.allowedParticipant} />
                    </div>

                    <button
                      onClick={() => toggleFavorite(lot.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition text-xs"
                      title="Remover dos favoritos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-2 mb-1.5">
                    {lot.description}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400" />
                      {lot.city}/{lot.state}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{lot.auctionNumber}</span>
                  </div>

                  {/* Personal Notes Card */}
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Bookmark className="w-3 h-3" />
                        Notas Pessoais de Inspeção
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(lot.id, fav.personalNotes, fav.targetBid)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editedNotes}
                          onChange={(e) => setEditedNotes(e.target.value)}
                          placeholder="Adicione observações sobre o lote..."
                          rows={2}
                          className="w-full bg-[#121929] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Lance Alvo (R$)"
                            value={editedTargetBid}
                            onChange={(e) => setEditedTargetBid(e.target.value)}
                            className="bg-[#121929] border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 w-36 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => saveEdit(lot.id)}
                            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 ml-auto"
                          >
                            <Save className="w-3 h-3" />
                            <span>Salvar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-300 italic text-[11px]">
                          {fav.personalNotes ? `"${fav.personalNotes}"` : "Nenhuma anotação registrada ainda. Clique em Editar para anotar."}
                        </p>
                        {fav.targetBid && (
                          <div className="mt-1.5 text-[11px] text-amber-300 font-semibold">
                            Teto Máximo Planejado: {formatCurrency(fav.targetBid)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Deadline */}
                  <div className={`p-2 rounded-lg text-xs font-medium flex items-center justify-between mb-3 ${
                    isUrgent 
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Prazo Limite:
                    </span>
                    <span className="font-bold">{timeText} ({formatDate(lot.proposalCloseAt)})</span>
                  </div>
                </div>

                {/* Price and Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Preço Mínimo</div>
                    <div className="text-sm font-black text-emerald-400">
                      {formatCurrency(lot.minimumBid)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startFinancialAnalysisForLot(lot)}
                      className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-1 transition"
                      title="Analisar margem"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Viabilidade</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLot(lot);
                        setCurrentPage('lots');
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                    >
                      Ver Lote Completo
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
