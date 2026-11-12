import React, { useMemo } from 'react';
import { 
  FileText, 
  Package, 
  Clock, 
  Bookmark, 
  TrendingUp, 
  Radar, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Calculator,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateOnly, getTimeRemaining } from '../../utils/formatters';
import { StatusBadge, ParticipantBadge } from '../common/Badge';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const DashboardView: React.FC = () => {
  const { 
    auctions, 
    lots, 
    favorites, 
    matches, 
    alerts, 
    setCurrentPage, 
    setSelectedLot, 
    setSelectedAuction,
    toggleFavorite,
    isFavorite,
    startFinancialAnalysisForLot 
  } = useApp();

  // 1. Calculate Real Indicators from state
  const activeAuctionsCount = useMemo(() => {
    return auctions.filter(a => a.status === 'PROPOSTAS_ABERTAS' || a.status === 'AGENDADO').length;
  }, [auctions]);

  const totalLotsCount = lots.length;

  const newLotsCount = useMemo(() => {
    // Lots collected recently
    return lots.filter(l => l.collectedAt >= '2026-11-01T00:00:00Z').length;
  }, [lots]);

  const endingSoonLots = useMemo(() => {
    return lots.filter(l => {
      const { isUrgent, isEnded } = getTimeRemaining(l.proposalCloseAt);
      return isUrgent && !isEnded;
    });
  }, [lots]);

  const favoritesCount = favorites.length;

  const monitoredLotsTotalMinBid = useMemo(() => {
    const matchedLotIds = new Set(matches.map(m => m.lotId));
    const matchedLots = lots.filter(l => matchedLotIds.has(l.id));
    return matchedLots.reduce((sum, item) => sum + item.minimumBid, 0);
  }, [matches, lots]);

  // 2. Chart: Editais por Estado
  const auctionsByStateData = useMemo(() => {
    const counts: Record<string, number> = {};
    auctions.forEach(a => {
      counts[a.state] = (counts[a.state] || 0) + 1;
    });
    return Object.entries(counts).map(([state, total]) => ({ state, total }));
  }, [auctions]);

  // 3. Chart: Distribuição de Lotes por Categoria
  const lotsByCategoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    lots.forEach(l => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });
    return Object.entries(counts).map(([category, count]) => ({
      name: category.split(' ')[0], // short name for legend
      fullName: category,
      value: count
    }));
  }, [lots]);

  // 4. Chart: Lotes por Faixa de Preço
  const lotsByPriceBracket = useMemo(() => {
    const brackets = [
      { name: 'Até 5k', min: 0, max: 5000, count: 0 },
      { name: '5k - 15k', min: 5000, max: 15000, count: 0 },
      { name: '15k - 30k', min: 15000, max: 30000, count: 0 },
      { name: '30k - 80k', min: 30000, max: 80000, count: 0 },
      { name: '> 80k', min: 80000, max: Infinity, count: 0 },
    ];
    lots.forEach(l => {
      const b = brackets.find(item => l.minimumBid >= item.min && l.minimumBid < item.max);
      if (b) b.count += 1;
    });
    return brackets.map(b => ({ range: b.name, lotes: b.count }));
  }, [lots]);

  // 5. Chart: Evolução de novos lotes ao longo do tempo
  const lotEvolutionData = [
    { date: '02/Nov', lotes: 3 },
    { date: '04/Nov', lotes: 7 },
    { date: '07/Nov', lotes: 9 },
    { date: '09/Nov', lotes: 10 },
    { date: '10/Nov', lotes: 11 },
    { date: '12/Nov', lotes: 12 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner de Homologação dos Dados */}
      <div className="bg-gradient-to-r from-blue-900/30 via-slate-900/40 to-slate-900/20 border border-blue-500/25 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              Radar Operacional de Leilões Públicos da Receita Federal
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                SLE CONECTADO
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Monitorando editais oficiais no padrão do Sistema de Leilão Eletrônico (SLE-Sociedade). 
              Dados demonstrativos parametrizados para o <strong>Marco 1</strong> com regras e cálculos financeiros em tempo real.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setCurrentPage('monitoring')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Configurar Monitor</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Editais Ativos</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{activeAuctionsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">de {auctions.length} cadastrados</p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total de Lotes</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{totalLotsCount}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">100% catalogados</p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Novos Lotes</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{newLotsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">coletados nos editais</p>
        </div>

        {/* Card 4 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 hover:border-rose-900/60 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-rose-300">Encerram em 24h</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 tracking-tight">{endingSoonLots.length}</div>
          <p className="text-[11px] text-rose-400/80 mt-1 font-semibold">Atenção ao prazo de lance</p>
        </div>

        {/* Card 5 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Favoritos</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{favoritesCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">lotes salvos com notas</p>
        </div>

        {/* Card 6 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Lotes Monitorados</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-blue-400 tracking-tight truncate">
            {formatCurrency(monitoredLotsTotalMinBid)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{matches.length} correspondências</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Editais por Estado */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Editais por Estado (UF)</h3>
              <p className="text-xs text-slate-400">Distribuição geográfica das sessões públicas</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{auctions.length} editais</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auctionsByStateData}>
                <XAxis dataKey="state" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} 
                  formatter={(val: any) => [`${val} editais`, 'Quantidade']}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribuição de Lotes por Categoria */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Lotes por Categoria</h3>
              <p className="text-xs text-slate-400">Classificação mercadológica dos itens</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{lots.length} itens</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lotsByCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {lotsByCategoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any, _: any, item: any) => [`${val} lotes`, item.payload.fullName]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {lotsByCategoryData.map((entry, idx) => (
              <span key={entry.name} className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>

        {/* Gráfico 3: Lotes por Faixa de Preço */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Lotes por Faixa de Preço Mínimo</h3>
              <p className="text-xs text-slate-400">Distribuição para planejamento de capital</p>
            </div>
            <span className="text-xs font-mono text-slate-400">BRL</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lotsByPriceBracket}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} lotes`, 'Total']}
                />
                <Bar dataKey="lotes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 4: Evolução de novos lotes ao longo do tempo */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Evolução do Catálogo de Lotes</h3>
              <p className="text-xs text-slate-400">Lotes coletados pelo monitor de leilões</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">+300% nov</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lotEvolutionData}>
                <defs>
                  <linearGradient id="colorLotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="lotes" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorLotes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Alert: Lotes Encerrando em 24h */}
      {endingSoonLots.length > 0 && (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
              <h3 className="text-sm font-bold text-rose-300">
                Lotes Encerrando nas Próximas 24 Horas ({endingSoonLots.length})
              </h3>
            </div>
            <button 
              onClick={() => setCurrentPage('lots')} 
              className="text-xs text-rose-300 hover:text-white flex items-center gap-1 font-medium"
            >
              <span>Ver todos os lotes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {endingSoonLots.map(lot => {
              const { text } = getTimeRemaining(lot.proposalCloseAt);
              return (
                <div 
                  key={lot.id} 
                  className="bg-[#0f172a] border border-rose-500/30 rounded-lg p-3 hover:border-rose-400 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white">Lote {lot.lotNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {text}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium line-clamp-2 mb-2">
                      {lot.description}
                    </p>
                    <div className="text-[11px] text-slate-400">
                      Edital: <span className="font-mono text-slate-300">{lot.auctionNumber}</span> ({lot.city}/{lot.state})
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Lance Mínimo</div>
                      <div className="text-xs font-bold text-emerald-400">
                        {formatCurrency(lot.minimumBid)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startFinancialAnalysisForLot(lot)}
                        title="Simular viabilidade na calculadora"
                        className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/20"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLot(lot);
                          setCurrentPage('lots');
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two columns: Últimos Editais & Oportunidades Monitoradas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Editais */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Últimos Editais Publicados</h3>
              <p className="text-xs text-slate-400">Atualizações oficiais do SLE Receita Federal</p>
            </div>
            <button 
              onClick={() => setCurrentPage('auctions')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {auctions.slice(0, 4).map(auction => (
              <div 
                key={auction.id}
                onClick={() => {
                  setSelectedAuction(auction);
                  setCurrentPage('auctions');
                }}
                className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-blue-400 group-hover:text-blue-300">
                    Edital {auction.number}
                  </span>
                  <StatusBadge status={auction.status} />
                </div>
                <div className="text-xs text-slate-300 font-medium line-clamp-1">
                  {auction.rfUnit} ({auction.city} - {auction.state})
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>{auction.lotsCount} lotes disponíveis</span>
                  <span>Encerra: {formatDateOnly(auction.proposalCloseAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Oportunidades Monitoradas */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Oportunidades em Monitoramento</h3>
              <p className="text-xs text-slate-400">Lotes que bateram suas regras cadastradas</p>
            </div>
            <button 
              onClick={() => setCurrentPage('monitoring')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>Ver regras</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {matches.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              Nenhuma correspondência recente. Crie novas regras em &ldquo;Monitoramento&rdquo;.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 4).map(match => (
                <div 
                  key={match.id}
                  className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 transition flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-medium">
                        Regra: {match.ruleName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {match.lot.city}/{match.lot.state}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">
                      Lote {match.lot.lotNumber}: {match.lot.description}
                    </h4>
                    <div className="text-xs font-bold text-emerald-400 mt-1">
                      {formatCurrency(match.lot.minimumBid)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleFavorite(match.lot.id)}
                      className={`p-1.5 rounded border text-xs transition ${
                        isFavorite(match.lot.id)
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title="Salvar nos Favoritos"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLot(match.lot);
                        setCurrentPage('lots');
                      }}
                      className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs"
                      title="Abrir detalhes"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
