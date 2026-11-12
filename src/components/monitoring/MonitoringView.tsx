import React, { useState } from 'react';
import { 
  Radar, 
  Plus, 
  Trash2, 
  Power, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  X, 
  MapPin, 
  Clock, 
  Bookmark, 
  Calculator,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MonitoringRule, ParticipantType, Lot } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ParticipantBadge } from '../common/Badge';

export const MonitoringView: React.FC = () => {
  const { 
    rules, 
    matches, 
    addRule, 
    deleteRule, 
    toggleRuleActive,
    setSelectedLot,
    setCurrentPage,
    startFinancialAnalysisForLot,
    toggleFavorite,
    isFavorite,
    lots
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRuleFilter, setSelectedRuleFilter] = useState<string>('TODAS');

  // New Rule form state
  const [ruleName, setRuleName] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [excludeKeywordsText, setExcludeKeywordsText] = useState('');
  const [selectedStatesText, setSelectedStatesText] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [participantType, setParticipantType] = useState<ParticipantType | 'QUALQUER'>('QUALQUER');
  const [frequency, setFrequency] = useState<'TEMPO_REAL' | '1_HORA' | '6_HORAS' | 'DIARIA'>('TEMPO_REAL');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const keywords = keywordsText.split(',').map(s => s.trim()).filter(Boolean);
    const excludeKeywords = excludeKeywordsText.split(',').map(s => s.trim()).filter(Boolean);
    const states = selectedStatesText.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

    addRule({
      name: ruleName.trim(),
      keywords,
      excludeKeywords,
      states,
      categories: [],
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      participantType,
      desiredStatus: 'QUALQUER',
      checkFrequency: frequency,
      active: true
    });

    // Reset form
    setRuleName('');
    setKeywordsText('');
    setExcludeKeywordsText('');
    setSelectedStatesText('');
    setMaxPrice('');
    setMinPrice('');
    setShowCreateModal(false);
  };

  const filteredMatches = selectedRuleFilter === 'TODAS'
    ? matches
    : matches.filter(m => m.ruleId === selectedRuleFilter);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radar className="w-5 h-5 text-blue-400" />
            Meu Monitoramento Automático de Oportunidades
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre robôs de monitoramento com palavras-chave, restrições e filtros de teto financeiro.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Regra de Monitoramento</span>
        </button>
      </div>

      {/* Rules Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map(rule => {
          const ruleMatches = matches.filter(m => m.ruleId === rule.id);
          return (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all ${
                rule.active
                  ? 'bg-[#0f172a] border-slate-800 hover:border-blue-500/50'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${rule.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <h3 className="text-sm font-bold text-white line-clamp-1">{rule.name}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleRuleActive(rule.id)}
                    className={`p-1.5 rounded-lg border text-xs transition ${
                      rule.active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                    title={rule.active ? 'Desativar regra' : 'Ativar regra'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition text-xs"
                    title="Excluir regra"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2 text-xs my-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Palavras-chave:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rule.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-medium text-[11px] border border-blue-500/20">
                        +{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {rule.excludeKeywords.length > 0 && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Excluir:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.excludeKeywords.map((ex, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] border border-rose-500/20">
                          -{ex}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filters metadata */}
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estados (UF):</span>
                    <span>{rule.states.length > 0 ? rule.states.join(', ') : 'Qualquer UF'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Teto Máximo:</span>
                    <span className="text-emerald-400 font-semibold">
                      {rule.maxPrice ? formatCurrency(rule.maxPrice) : 'Sem limite'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Frequência:</span>
                    <span className="font-mono text-blue-300">{rule.checkFrequency}</span>
                  </div>
                </div>
              </div>

              {/* Footer matches count */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Correspondências ativas:
                </span>
                <span className="font-bold text-white bg-blue-600/20 border border-blue-500/30 px-2 py-0.5 rounded-full text-blue-300">
                  {ruleMatches.length} lotes
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section: Matches Encontrados pelas Regras */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Lotes Encontrados pelos Robôs de Monitoramento ({filteredMatches.length})
            </h3>
            <p className="text-xs text-slate-400">
              Lotes que atenderam 100% aos critérios das suas regras ativas.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filtrar por regra:</span>
            <select
              value={selectedRuleFilter}
              onChange={(e) => setSelectedRuleFilter(e.target.value)}
              className="bg-[#121929] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="TODAS">Todas as regras</option>
              {rules.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Nenhum lote corresponde a esta regra no momento. O robô continuará monitorando novos editais publicados no portal da RFB.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map(match => (
              <div
                key={match.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Regra: {match.ruleName}
                    </span>
                    <ParticipantBadge type={match.lot.allowedParticipant} />
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition line-clamp-2 mb-1">
                    Lote {match.lot.lotNumber}: {match.lot.description}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span>{match.lot.city}/{match.lot.state}</span>
                    <span>•</span>
                    <span className="font-mono">{match.lot.auctionNumber}</span>
                  </div>

                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-0.5 mb-3">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Critérios Casados:</div>
                    <div className="text-slate-300">{match.matchedCriteria.join(' | ')}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Lance Mínimo</div>
                    <div className="text-xs font-black text-emerald-400">
                      {formatCurrency(match.lot.minimumBid)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFavorite(match.lot.id)}
                      className={`p-1.5 rounded border text-xs transition ${
                        isFavorite(match.lot.id)
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title="Favoritar"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => startFinancialAnalysisForLot(match.lot)}
                      className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs"
                      title="Calculadora de Viabilidade"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLot(match.lot);
                        setCurrentPage('lots');
                      }}
                      className="px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Ver Lote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radar className="w-5 h-5 text-blue-400" />
                Criar Nova Regra de Monitoramento
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Nome da Regra:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Robô iPhone 15 e MacBooks RJ / SP"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">
                  Palavras-chave obrigatórias (separadas por vírgula):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: iphone, macbook, m3, pro max"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  O robô alertará sempre que qualquer uma dessas palavras constar no lote.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">
                  Palavras excluídas (separadas por vírgula):
                </label>
                <input
                  type="text"
                  placeholder="Ex: defeito, quebrado, sucata, desmontado"
                  value={excludeKeywordsText}
                  onChange={(e) => setExcludeKeywordsText(e.target.value)}
                  className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Estados UF (separados por vírgula):</label>
                  <input
                    type="text"
                    placeholder="Ex: RJ, SP, PR (ou vazio p/ qualquer)"
                    value={selectedStatesText}
                    onChange={(e) => setSelectedStatesText(e.target.value)}
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Preço Mínimo Máximo (R$):</label>
                  <input
                    type="number"
                    placeholder="Ex: 5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Tipo de Participante:</label>
                  <select
                    value={participantType}
                    onChange={(e) => setParticipantType(e.target.value as any)}
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="QUALQUER">Qualquer tipo</option>
                    <option value="AMBOS">Pessoa Física e Jurídica</option>
                    <option value="APENAS_PF">Apenas Pessoa Física</option>
                    <option value="APENAS_PJ">Apenas Pessoa Jurídica</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Frequência de Verificação:</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="TEMPO_REAL">Tempo Real (A cada novo lote)</option>
                    <option value="1_HORA">A cada 1 hora</option>
                    <option value="6_HORAS">A cada 6 horas</option>
                    <option value="DIARIA">Diária</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30"
                >
                  Salvar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
