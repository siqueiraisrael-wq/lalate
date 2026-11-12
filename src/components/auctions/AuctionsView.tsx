import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Building2, 
  Package, 
  ExternalLink, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Auction, Lot } from '../../types';
import { formatDate, formatDateOnly } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';
import { AuctionDetailModal } from './AuctionDetailModal';

export const AuctionsView: React.FC = () => {
  const { 
    auctions, 
    lots, 
    selectedAuction, 
    setSelectedAuction,
    setSelectedLot,
    setCurrentPage 
  } = useApp();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [sortBy, setSortBy] = useState<'publication_desc' | 'close_asc' | 'lots_desc'>('close_asc');
  
  // Pagination
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 6;

  // Unique states for filter
  const availableStates = useMemo(() => {
    return Array.from(new Set(auctions.map(a => a.state))).sort();
  }, [auctions]);

  // Filter & Sort Logic
  const filteredAuctions = useMemo(() => {
    return auctions.filter(a => {
      // 1. Search term (number, organ, unit, city)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery = 
          a.number.toLowerCase().includes(query) ||
          a.organ.toLowerCase().includes(query) ||
          a.rfUnit.toLowerCase().includes(query) ||
          a.city.toLowerCase().includes(query) ||
          a.state.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 2. State filter
      if (selectedState !== 'TODOS' && a.state !== selectedState) {
        return false;
      }

      // 3. Status filter
      if (selectedStatus !== 'TODOS' && a.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'close_asc') {
        return new Date(a.proposalCloseAt).getTime() - new Date(b.proposalCloseAt).getTime();
      }
      if (sortBy === 'publication_desc') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === 'lots_desc') {
        return b.lotsCount - a.lotsCount;
      }
      return 0;
    });
  }, [auctions, searchTerm, selectedState, selectedStatus, sortBy]);

  // Paginated records
  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage) || 1;
  const paginatedAuctions = filteredAuctions.slice(
    (currentPageNum - 1) * itemsPerPage,
    currentPageNum * itemsPerPage
  );

  // Get related lots for the selected auction
  const relatedLots = useMemo(() => {
    if (!selectedAuction) return [];
    return lots.filter(l => l.auctionId === selectedAuction.id || l.auctionNumber === selectedAuction.number);
  }, [selectedAuction, lots]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Central de Editais Públicos</h2>
          <p className="text-xs text-slate-400 mt-1">
            Editais oficiais com acompanhamento de cronogramas, retificações e anexos do SLE Receita Federal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {filteredAuctions.length} editais encontrados
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por número do edital, unidade ou cidade..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full bg-[#121929] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Estado (UF) Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full bg-[#121929] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Estados (UF)</option>
              {availableStates.map(st => (
                <option key={st} value={st}>{st} - Estado</option>
              ))}
            </select>
          </div>

          {/* Situação Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full bg-[#121929] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todas as Situações</option>
              <option value="PROPOSTAS_ABERTAS">Propostas Abertas</option>
              <option value="AGENDADO">Agendado</option>
              <option value="EM_LEILAO">Em Leilão</option>
              <option value="ENCERRADO">Encerrado</option>
            </select>
          </div>
        </div>

        {/* Sort and Reset controls */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Ordenar por:</span>
            <button
              onClick={() => setSortBy('close_asc')}
              className={`px-2.5 py-1 rounded transition ${sortBy === 'close_asc' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              Encerramento Próximo
            </button>
            <button
              onClick={() => setSortBy('publication_desc')}
              className={`px-2.5 py-1 rounded transition ${sortBy === 'publication_desc' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              Publicação Mais Recente
            </button>
            <button
              onClick={() => setSortBy('lots_desc')}
              className={`px-2.5 py-1 rounded transition ${sortBy === 'lots_desc' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              Mais Lotes
            </button>
          </div>

          {(searchTerm || selectedState !== 'TODOS' || selectedStatus !== 'TODOS') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedState('TODOS');
                setSelectedStatus('TODOS');
                setCurrentPageNum(1);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 transition"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid of Auctions */}
      {paginatedAuctions.length === 0 ? (
        <div className="p-12 text-center bg-[#0f172a] border border-slate-800 rounded-xl space-y-2">
          <FileText className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">Nenhum edital encontrado com estes filtros</h3>
          <p className="text-xs text-slate-400">Tente ajustar o termo de pesquisa ou selecionar outros estados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedAuctions.map(auction => (
            <div
              key={auction.id}
              className="bg-[#0f172a] border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {auction.number}
                  </span>
                  <StatusBadge status={auction.status} />
                </div>

                {/* Unidade & Órgão */}
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-1 mb-1">
                  {auction.rfUnit}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {auction.organ}
                </p>

                {/* Location and Lots count badge */}
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    {auction.city} - {auction.state}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-semibold">
                    <Package className="w-3 h-3" />
                    {auction.lotsCount} Lotes
                  </span>
                </div>

                {/* Key Dates Timeline */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-xs mb-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Publicação:</span>
                    <span className="text-slate-200">{formatDateOnly(auction.publishedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Abertura Propostas:</span>
                    <span className="text-slate-200">{formatDate(auction.proposalOpenAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-300 font-semibold">
                    <span>Fim Propostas:</span>
                    <span>{formatDate(auction.proposalCloseAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                    <span>Sessão de Lances:</span>
                    <span className="text-blue-400 font-medium">{formatDate(auction.sessionStartAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={auction.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1"
                  title="Abrir no portal oficial da Receita Federal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SLE Oficial</span>
                </a>

                <button
                  onClick={() => setSelectedAuction(auction)}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition text-center"
                >
                  Ver Edital & Lotes ({auction.lotsCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-xs">
          <span className="text-slate-400">
            Página <strong>{currentPageNum}</strong> de <strong>{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageNum(p => Math.max(1, p - 1))}
              disabled={currentPageNum === 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPageNum(p => Math.min(totalPages, p + 1))}
              disabled={currentPageNum === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Auction Detail Modal */}
      {selectedAuction && (
        <AuctionDetailModal
          auction={selectedAuction}
          relatedLots={relatedLots}
          onClose={() => setSelectedAuction(null)}
          onSelectLot={(lot) => {
            setSelectedLot(lot);
            setCurrentPage('lots');
          }}
        />
      )}
    </div>
  );
};
