import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Bookmark, 
  Calculator, 
  ExternalLink, 
  ArrowUpDown, 
  MapPin, 
  Clock, 
  Check, 
  Tag, 
  Save, 
  X,
  SlidersHorizontal,
  Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lot, ParticipantType, LotStatus } from '../../types';
import { formatCurrency, formatDate, formatDateOnly, getTimeRemaining } from '../../utils/formatters';
import { StatusBadge, ParticipantBadge } from '../common/Badge';
import { LotDetailModal } from './LotDetailModal';

export const LotsView: React.FC = () => {
  const { 
    lots, 
    auctions,
    selectedLot, 
    setSelectedLot, 
    toggleFavorite, 
    isFavorite, 
    startFinancialAnalysisForLot 
  } = useApp();

  // Layout View mode
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedState, setSelectedState] = useState<string>('TODOS');
  const [selectedCity, setSelectedCity] = useState<string>('TODAS');
  const [selectedAuctionNum, setSelectedAuctionNum] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [participantFilter, setParticipantFilter] = useState<'TODOS' | 'PF' | 'PJ'>('TODOS');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'ending_asc' | 'price_asc' | 'price_desc' | 'recent_desc'>('ending_asc');

  // Saved Searches
  const [savedSearches, setSavedSearches] = useState<{ name: string; query: string; category?: string }[]>([
    { name: 'Apple & MacBooks', query: 'apple', category: 'TODAS' },
    { name: 'iPhones até R$ 5k', query: 'iphone', category: 'Smartphones & Celulares' },
    { name: 'Veículos & Foz', query: 'hilux', category: 'Veículos & Transporte' },
  ]);
  const [savedSearchName, setSavedSearchName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Distinct filter options
  const categories = useMemo(() => {
    return Array.from(new Set(lots.map(l => l.category))).sort();
  }, [lots]);

  const states = useMemo(() => {
    return Array.from(new Set(lots.map(l => l.state))).sort();
  }, [lots]);

  const cities = useMemo(() => {
    const list = selectedState === 'TODOS' ? lots : lots.filter(l => l.state === selectedState);
    return Array.from(new Set(list.map(l => l.city))).sort();
  }, [lots, selectedState]);

  const auctionNumbers = useMemo(() => {
    return Array.from(new Set(lots.map(l => l.auctionNumber))).sort();
  }, [lots]);

  // Combined Filter and Sort Logic
  const filteredLots = useMemo(() => {
    return lots.filter(lot => {
      // 1. Keyword search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery = 
          lot.description.toLowerCase().includes(query) ||
          lot.fullDescription.toLowerCase().includes(query) ||
          lot.category.toLowerCase().includes(query) ||
          lot.tags.some(t => t.toLowerCase().includes(query)) ||
          lot.lotNumber.toString() === query;
        if (!matchesQuery) return false;
      }

      // 2. Category
      if (selectedCategory !== 'TODAS' && lot.category !== selectedCategory) {
        return false;
      }

      // 3. State
      if (selectedState !== 'TODOS' && lot.state !== selectedState) {
        return false;
      }

      // 4. City
      if (selectedCity !== 'TODAS' && lot.city !== selectedCity) {
        return false;
      }

      // 5. Origin Auction
      if (selectedAuctionNum !== 'TODOS' && lot.auctionNumber !== selectedAuctionNum) {
        return false;
      }

      // 6. Status
      if (selectedStatus !== 'TODOS' && lot.status !== selectedStatus) {
        return false;
      }

      // 7. Participant eligibility
      if (participantFilter === 'PF') {
        if (lot.allowedParticipant === 'APENAS_PJ') return false;
      } else if (participantFilter === 'PJ') {
        if (lot.allowedParticipant === 'APENAS_PF') return false;
      }

      // 8. Min Price
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        if (lot.minimumBid < parseFloat(minPrice)) return false;
      }

      // 9. Max Price
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        if (lot.minimumBid > parseFloat(maxPrice)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'ending_asc') {
        return new Date(a.proposalCloseAt).getTime() - new Date(b.proposalCloseAt).getTime();
      }
      if (sortBy === 'price_asc') {
        return a.minimumBid - b.minimumBid;
      }
      if (sortBy === 'price_desc') {
        return b.minimumBid - a.minimumBid;
      }
      if (sortBy === 'recent_desc') {
        return new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime();
      }
      return 0;
    });
  }, [
    lots, 
    searchTerm, 
    selectedCategory, 
    selectedState, 
    selectedCity, 
    selectedAuctionNum, 
    selectedStatus, 
    participantFilter, 
    minPrice, 
    maxPrice, 
    sortBy
  ]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('TODAS');
    setSelectedState('TODOS');
    setSelectedCity('TODAS');
    setSelectedAuctionNum('TODOS');
    setSelectedStatus('TODOS');
    setParticipantFilter('TODOS');
    setMinPrice('');
    setMaxPrice('');
  };

  const handleSaveSearch = () => {
    if (!savedSearchName.trim()) return;
    setSavedSearches(prev => [
      ...prev,
      {
        name: savedSearchName.trim(),
        query: searchTerm,
        category: selectedCategory
      }
    ]);
    setSavedSearchName('');
    setShowSaveModal(false);
  };

  const applySavedSearch = (s: { name: string; query: string; category?: string }) => {
    setSearchTerm(s.query);
    if (s.category) setSelectedCategory(s.category);
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedCategory !== 'TODAS' || 
    selectedState !== 'TODOS' || 
    selectedCity !== 'TODAS' || 
    selectedAuctionNum !== 'TODOS' || 
    selectedStatus !== 'TODOS' || 
    participantFilter !== 'TODOS' || 
    minPrice !== '' || 
    maxPrice !== '';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Catálogo Geral de Lotes</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pesquisa multifacetada, especificações técnicas, condições fiscais e estimativas de margem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0f172a] border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Visualização em Cards"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Save className="w-3.5 h-3.5 text-blue-400" />
            <span>Salvar Pesquisa</span>
          </button>
        </div>
      </div>

      {/* Saved Searches Quick Chips */}
      {savedSearches.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase shrink-0">
            Pesquisas Salvas:
          </span>
          {savedSearches.map((s, idx) => (
            <button
              key={idx}
              onClick={() => applySavedSearch(s)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 text-slate-300 text-xs transition shrink-0"
            >
              <Tag className="w-3 h-3 text-blue-400" />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Primary Search and Filter Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por descrição, modelo, marca ou tags (ex: MacBook, iPhone, Toyota)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121929] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Categoria */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#121929] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODAS">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* UF */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('TODAS');
              }}
              className="w-full bg-[#121929] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os Estados (UF)</option>
              {states.map(st => (
                <option key={st} value={st}>{st} - Estado</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle Advanced Filters Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvancedFilters ? 'Ocultar Filtros Avançados' : 'Mais Filtros (Preço, PF/PJ, Edital)'}</span>
            </button>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-medium">
              {filteredLots.length} lotes encontrados
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#121929] border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ending_asc">Encerramento Próximo</option>
              <option value="price_asc">Menor Preço Mínimo</option>
              <option value="price_desc">Maior Preço Mínimo</option>
              <option value="recent_desc">Coletados Recentemente</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 text-rose-400 hover:text-rose-300 text-xs transition"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Participação Permitida:</label>
              <select
                value={participantFilter}
                onChange={(e) => setParticipantFilter(e.target.value as any)}
                className="w-full bg-[#121929] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="TODOS">Todos (PF e PJ)</option>
                <option value="PF">Permite Pessoa Física</option>
                <option value="PJ">Permite Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Edital de Origem:</label>
              <select
                value={selectedAuctionNum}
                onChange={(e) => setSelectedAuctionNum(e.target.value)}
                className="w-full bg-[#121929] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="TODOS">Todos os Editais</option>
                {auctionNumbers.map(num => (
                  <option key={num} value={num}>Edital {num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Preço Mínimo Inicial (R$):</label>
              <input
                type="number"
                placeholder="Ex: 1000"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-[#121929] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Preço Mínimo Máximo (R$):</label>
              <input
                type="number"
                placeholder="Ex: 50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-[#121929] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* List Output */}
      {filteredLots.length === 0 ? (
        <div className="p-12 text-center bg-[#0f172a] border border-slate-800 rounded-xl space-y-2">
          <Package className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">Nenhum lote corresponde aos filtros selecionados</h3>
          <p className="text-xs text-slate-400">Verifique a ortografia das palavras-chave ou amplie a faixa de preço.</p>
          <button
            onClick={clearFilters}
            className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Resetar Filtros
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLots.map(lot => {
            const isFav = isFavorite(lot.id);
            const { text: timeText, isUrgent } = getTimeRemaining(lot.proposalCloseAt);
            return (
              <div
                key={lot.id}
                className="bg-[#0f172a] border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 flex flex-col justify-between shadow-sm transition-all duration-200 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        Lote {lot.lotNumber}
                      </span>
                      <ParticipantBadge type={lot.allowedParticipant} />
                    </div>

                    <button
                      onClick={() => toggleFavorite(lot.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        isFav 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Category */}
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-2 mb-1.5">
                    {lot.description}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                      {lot.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400" />
                      {lot.city}/{lot.state}
                    </span>
                  </div>

                  {/* Origin notice */}
                  <div className="text-[11px] text-slate-400 font-mono mb-3">
                    Edital: {lot.auctionNumber}
                  </div>

                  {/* Countdown pill */}
                  <div className={`p-2 rounded-lg text-xs font-medium flex items-center justify-between mb-3 ${
                    isUrgent 
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'animate-pulse text-rose-400' : 'text-slate-400'}`} />
                      Encerramento:
                    </span>
                    <span className="font-bold">{timeText}</span>
                  </div>
                </div>

                {/* Price and Actions Bottom */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Lance Mínimo</div>
                    <div className="text-sm font-black text-emerald-400">
                      {formatCurrency(lot.minimumBid)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startFinancialAnalysisForLot(lot)}
                      className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition"
                      title="Calcular Viabilidade e Margem de Lucro"
                    >
                      <Calculator className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedLot(lot)}
                      className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3.5">Lote / Edital</th>
                  <th className="p-3.5">Descrição</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5">Localização</th>
                  <th className="p-3.5">Participante</th>
                  <th className="p-3.5">Lance Mínimo</th>
                  <th className="p-3.5">Prazo Encerramento</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLots.map(lot => {
                  const isFav = isFavorite(lot.id);
                  const { text: timeText, isUrgent } = getTimeRemaining(lot.proposalCloseAt);
                  return (
                    <tr key={lot.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-blue-400 text-xs">
                          Lote {lot.lotNumber}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {lot.auctionNumber}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-slate-200 line-clamp-1">
                          {lot.description}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {lot.fullDescription}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300 border border-slate-700/60">
                          {lot.category}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="text-slate-200">{lot.city}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{lot.state}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <ParticipantBadge type={lot.allowedParticipant} />
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-emerald-400 text-xs">
                          {formatCurrency(lot.minimumBid)}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${isUrgent ? 'text-rose-400' : 'text-slate-300'}`}>
                          <Clock className="w-3 h-3" />
                          {timeText}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleFavorite(lot.id)}
                            className={`p-1.5 rounded border transition ${
                              isFav ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                            title="Favoritar"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => startFinancialAnalysisForLot(lot)}
                            className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400"
                            title="Calculadora de Viabilidade"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedLot(lot)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs"
                          >
                            Detalhes
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Save className="w-4 h-4 text-blue-400" />
                Salvar Esta Pesquisa
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Dê um nome para salvar os filtros atuais (termo &ldquo;{searchTerm || 'todos'}&rdquo;, categoria &ldquo;{selectedCategory}&rdquo;) e acessá-los rapidamente.
            </p>
            <input
              type="text"
              placeholder="Ex: Celulares Baratos no RJ"
              value={savedSearchName}
              onChange={(e) => setSavedSearchName(e.target.value)}
              className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!savedSearchName.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-40"
              >
                Salvar Pesquisa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lot Detail Modal */}
      {selectedLot && (
        <LotDetailModal
          lot={selectedLot}
          onClose={() => setSelectedLot(null)}
          onOpenFinancialAnalysis={(lot) => startFinancialAnalysisForLot(lot)}
        />
      )}
    </div>
  );
};
