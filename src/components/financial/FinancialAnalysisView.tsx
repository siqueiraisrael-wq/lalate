import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Save, 
  Trash2, 
  Percent, 
  DollarSign, 
  ShieldAlert, 
  Package, 
  Check, 
  Clock, 
  Info,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lot, FinancialSimulation } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FinancialAnalysisView: React.FC = () => {
  const { 
    lots, 
    selectedLot, 
    setSelectedLot, 
    simulations, 
    saveSimulation, 
    deleteSimulation,
    settings 
  } = useApp();

  // Active lot for the calculation
  const [currentLotId, setCurrentLotId] = useState<string>(selectedLot?.id || lots[0]?.id || '');
  const activeLot = useMemo(() => lots.find(l => l.id === currentLotId), [lots, currentLotId]);

  // Form input fields
  const [minimumBid, setMinimumBid] = useState<number>(activeLot?.minimumBid || 4200);
  const [estimatedBid, setEstimatedBid] = useState<number>(activeLot ? Math.round(activeLot.minimumBid * 1.15) : 5000);
  const [transportCost, setTransportCost] = useState<number>(150);
  const [taxCharges, setTaxCharges] = useState<number>(300);
  const [storageCost, setStorageCost] = useState<number>(0);
  const [repairCost, setRepairCost] = useState<number>(0);
  const [otherCosts, setOtherCosts] = useState<number>(100);
  const [expectedResalePrice, setExpectedResalePrice] = useState<number>(8500);
  const [simulationNotes, setSimulationNotes] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync when activeLot changes
  useEffect(() => {
    if (activeLot) {
      setMinimumBid(activeLot.minimumBid);
      setEstimatedBid(Math.round(activeLot.minimumBid * 1.15));
      // Suggested estimated resale based on category
      const multiplier = activeLot.category.includes('Veículos') ? 1.4 : activeLot.category.includes('Informática') ? 1.7 : 1.5;
      setExpectedResalePrice(Math.round(activeLot.minimumBid * multiplier));
    }
  }, [activeLot]);

  // Calculations per exact requirements
  const additionalCosts = useMemo(() => {
    return transportCost + taxCharges + storageCost + repairCost + otherCosts;
  }, [transportCost, taxCharges, storageCost, repairCost, otherCosts]);

  // Formula 1: Investimento total = lance estimado + todos os custos adicionais
  const totalInvestment = useMemo(() => {
    return estimatedBid + additionalCosts;
  }, [estimatedBid, additionalCosts]);

  // Formula 2: Lucro estimado = preço esperado de revenda - investimento total
  const expectedGrossProfit = useMemo(() => {
    return expectedResalePrice - totalInvestment;
  }, [expectedResalePrice, totalInvestment]);

  // Formula 3: Margem percentual = (lucro estimado / preço esperado de revenda) * 100
  const marginPercent = useMemo(() => {
    if (expectedResalePrice <= 0) return 0;
    return (expectedGrossProfit / expectedResalePrice) * 100;
  }, [expectedGrossProfit, expectedResalePrice]);

  // Formula 4: ROI = (lucro estimado / investimento total) * 100
  const roiPercent = useMemo(() => {
    if (totalInvestment <= 0) return 0;
    return (expectedGrossProfit / totalInvestment) * 100;
  }, [expectedGrossProfit, totalInvestment]);

  const isProfitable = expectedGrossProfit > 0;

  const handleSaveSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLot) return;

    saveSimulation({
      lotId: activeLot.id,
      lotTitle: activeLot.description,
      lotNumber: activeLot.lotNumber,
      auctionNumber: activeLot.auctionNumber,
      minimumBid,
      estimatedBid,
      transportCost,
      taxCharges,
      storageCost,
      repairCost,
      otherCosts,
      expectedResalePrice,
      totalInvestment,
      expectedGrossProfit,
      marginPercent,
      roiPercent,
      notes: simulationNotes.trim()
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          Análise de Oportunidades & Calculadora de Margem de Arrematação
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Simule o custo de aquisição completo incluindo encargos alfandegários, frete e custos ocultos para aferir o Retorno Sobre Investimento (ROI).
        </p>
      </div>

      {/* Legal & Analytical Disclaimer (Mandatory) */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">Aviso Legal & Diretriz de Conformidade:</strong> Todos os cálculos e projeções financeiras gerados pela ferramenta são estimativas analíticas baseadas nos valores informados pelo operador. Não constituem promessa, garantia de arrematação ou garantia de retorno financeiro. Os leilões da Receita Federal sujeitam-se à concorrência pública de lances, inspeção prévia obrigatória e regras estritas do respectivo edital.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Parameters */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
          {/* Select Lot to Preload */}
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-400" />
              Selecione um lote do catálogo para preenchimento automático:
            </label>
            <select
              value={currentLotId}
              onChange={(e) => setCurrentLotId(e.target.value)}
              className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {lots.map(l => (
                <option key={l.id} value={l.id}>
                  Lote {l.lotNumber}: {l.description} ({l.city}/{l.state} - Mín: R$ {l.minimumBid.toLocaleString('pt-BR')})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSaveSimulation} className="space-y-4">
            {/* Primary Bids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Preço Mínimo Oficial (R$):
                </label>
                <input
                  type="number"
                  value={minimumBid}
                  onChange={(e) => setMinimumBid(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Base inicial fixada no edital.</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 mb-1 block">
                  Lance Máximo Estimado (R$):
                </label>
                <input
                  type="number"
                  value={estimatedBid}
                  onChange={(e) => setEstimatedBid(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#121929] border border-blue-500/50 rounded-lg p-2.5 text-xs text-white font-mono font-black focus:outline-none focus:border-blue-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Teto planejado para a disputa ao vivo.</span>
              </div>
            </div>

            {/* Additional Costs Section */}
            <div className="pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Custos Adicionais de Arrematação & Operação (R$)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 mb-1 block">Transporte & Frete:</label>
                  <input
                    type="number"
                    value={transportCost}
                    onChange={(e) => setTransportCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 mb-1 block">Tributos & Taxas (ICMS):</label>
                  <input
                    type="number"
                    value={taxCharges}
                    onChange={(e) => setTaxCharges(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 mb-1 block">Armazenamento / Estadia:</label>
                  <input
                    type="number"
                    value={storageCost}
                    onChange={(e) => setStorageCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 mb-1 block">Reparo & Manutenção:</label>
                  <input
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 mb-1 block">Outros Custos / Despesas:</label>
                  <input
                    type="number"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-emerald-400 font-semibold mb-1 block">Preço Esperado Revenda:</label>
                  <input
                    type="number"
                    value={expectedResalePrice}
                    onChange={(e) => setExpectedResalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121929] border border-emerald-500/50 rounded-lg p-2 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-slate-300 font-medium mb-1 block">
                Observações e Premissas da Simulação:
              </label>
              <textarea
                value={simulationNotes}
                onChange={(e) => setSimulationNotes(e.target.value)}
                placeholder="Ex: Preço de mercado consultado no Mercado Livre e Tabela FIPE em 12/11/2026..."
                rows={2}
                className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Total de custos adicionais: <strong>{formatCurrency(additionalCosts)}</strong>
              </span>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Simulação no Histórico</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                Simulação arquivada com sucesso no registro de viabilidade!
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Computed KPI Cards */}
        <div className="space-y-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Resultado da Modelagem Financeira
            </h3>

            {/* Total Investment */}
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Investimento Total Estimado</div>
              <div className="text-xl font-black text-white mt-1">
                {formatCurrency(totalInvestment)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Lance ({formatCurrency(estimatedBid)}) + Custos ({formatCurrency(additionalCosts)})
              </div>
            </div>

            {/* Expected Resale */}
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Receita Bruta Potencial (Revenda)</div>
              <div className="text-xl font-black text-slate-200 mt-1">
                {formatCurrency(expectedResalePrice)}
              </div>
            </div>

            {/* Gross Profit */}
            <div className={`p-4 rounded-xl border ${
              isProfitable 
                ? 'bg-emerald-950/20 border-emerald-500/30' 
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Lucro Bruto Estimado</span>
                {isProfitable ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div className={`text-2xl font-black mt-1 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(expectedGrossProfit)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Receita prevista menos desembolso total
              </div>
            </div>

            {/* Margin and ROI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400">Margem Comercial</div>
                <div className={`text-lg font-black mt-1 ${marginPercent >= 20 ? 'text-emerald-400' : marginPercent > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {marginPercent.toFixed(1)}%
                </div>
                <div className="text-[9px] text-slate-400">(Lucro / Revenda)</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[11px] text-slate-400">Retorno (ROI)</div>
                <div className={`text-lg font-black mt-1 ${roiPercent >= 30 ? 'text-emerald-400' : roiPercent > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {roiPercent.toFixed(1)}%
                </div>
                <div className="text-[9px] text-slate-400">(Lucro / Investimento)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Simulations Ledger */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Simulações Financeiras Salvas ({simulations.length})
        </h3>

        {simulations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Nenhuma simulação salva ainda. Calcule a viabilidade de um lote acima e clique em &ldquo;Salvar Simulação&rdquo;.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulations.map(sim => (
              <div key={sim.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      Lote {sim.lotNumber} • {sim.auctionNumber}
                    </span>
                    <button
                      onClick={() => deleteSimulation(sim.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="Excluir simulação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 mb-2">
                    {sim.lotTitle}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded bg-slate-950 border border-slate-800 mb-2">
                    <div>
                      <div className="text-[10px] text-slate-400">Investimento Total</div>
                      <div className="font-bold text-white">{formatCurrency(sim.totalInvestment)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Lucro Estimado</div>
                      <div className={`font-black ${sim.expectedGrossProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(sim.expectedGrossProfit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Margem</div>
                      <div className="font-semibold text-slate-300">{sim.marginPercent.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">ROI</div>
                      <div className="font-semibold text-blue-400">{sim.roiPercent.toFixed(1)}%</div>
                    </div>
                  </div>

                  {sim.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-2">
                      &ldquo;{sim.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800 mt-2">
                  Simulado em {formatDate(sim.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
