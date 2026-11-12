import React, { useState } from 'react';
import { 
  Settings, 
  Send, 
  Mail, 
  Database, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Download, 
  Server, 
  ShieldCheck, 
  ExternalLink,
  Code
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    triggerManualSync, 
    isSyncing, 
    lastSyncTime,
    resetDemoData,
    auctions,
    lots,
    rules,
    simulations
  } = useApp();

  const [telegramToken, setTelegramToken] = useState('7192837492:AAHgK-DEMO_TOKEN');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || '-10023481923');
  const [emailAddress, setEmailAddress] = useState(settings.emailAddress);
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegramEnabled);
  const [emailEnabled, setEmailEnabled] = useState(settings.emailNotifications);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      telegramEnabled,
      telegramChatId,
      emailNotifications: emailEnabled,
      emailAddress
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportFullBackup = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      platform: "LanceRadar - Monitor de Leilões Receita Federal",
      version: "Marco 1",
      data: {
        auctions,
        lots,
        rules,
        simulations
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lanceradar_backup_completo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Configurações da Plataforma & Integrações
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Parâmetros do coletor de editais, canais de alertas automatizados e manutenção da base.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Channels Form */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Send className="w-4 h-4 text-blue-400" />
              Canais de Notificação Automática (Alertas Externos)
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Configure onde o LanceRadar deverá despachar notificações imediatas quando um lote compatível com suas regras for detectado ou estiver encerrando.
            </p>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
              {/* Telegram */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Send className="w-4 h-4 text-blue-400" />
                    <span>Bot do Telegram</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramEnabled}
                      onChange={(e) => setTelegramEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Telegram Bot Token:</label>
                    <input
                      type="password"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      placeholder="Ex: 123456:ABC-DEF1234..."
                      className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Chat ID / Canal ID:</label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="Ex: -10023481923"
                      className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>Notificações por E-mail</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">E-mail para envio de resumos e alertas:</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="seuemail@empresa.com.br"
                    className="w-full bg-[#121929] border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Preferências salvas!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-md"
                >
                  Salvar Preferências
                </button>
              </div>
            </form>
          </div>

          {/* Data Backup & Reset */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Database className="w-4 h-4 text-purple-400" />
              Gestão da Base de Dados & Backup
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportFullBackup}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Exportar Base Completa (JSON)</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Deseja restabelecer os dados demonstrativos oficiais do Marco 1?")) {
                    resetDemoData();
                  }
                }}
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restaurar Demonstração Marco 1</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: SLE Collector Architecture Info */}
        <div className="space-y-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Server className="w-4 h-4 text-blue-400" />
              Camada de Coleta & Integração
            </h3>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Fonte Oficial:</span>
                <span className="text-slate-200">Receita Federal</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Portal:</span>
                <span className="text-blue-400">SLE - Sociedade</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Protocolo:</span>
                <span className="text-emerald-400">HTTPS / REST JSON</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status Coletor:</span>
                <span className="text-emerald-400 font-bold">OPERACIONAL</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              O conector utiliza uma camada de abstração independente. No <strong>Marco 1</strong>, os modelos de dados e a interface refletem 100% da estrutura oficial do portal SLE. No <strong>Marco 3</strong>, o crawler com HTTPX/Playwright será integrado diretamente aos endpoints da Receita Federal.
            </p>

            <a
              href="https://www25.receita.fazenda.gov.br/sle-sociedade/portal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              <span>Abrir portal www25.receita.fazenda.gov.br</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Architecture Roadmap Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-400" />
              Roteiro de Marcos do LanceRadar
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="text-emerald-400 font-bold">✓ Marco 1: Interface, Layout, Dash, Lotes e Análise (Concluído)</div>
              <div>• Marco 2: Modelo de Dados e Persistência PostgreSQL</div>
              <div>• Marco 3: Investigação técnica e Coletor SLE HTTPX</div>
              <div>• Marco 4 a 8: Testes, Automações e Webhooks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
