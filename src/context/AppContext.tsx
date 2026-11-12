import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Auction, 
  Lot, 
  MonitoringRule, 
  MonitoringMatch, 
  UserFavorite, 
  AlertNotification, 
  FinancialSimulation, 
  CollectionLog, 
  UserSettings 
} from '../types';
import { 
  initialAuctions, 
  initialLots, 
  initialMonitoringRules, 
  initialAlerts, 
  initialFinancialSimulations, 
  initialCollectionLogs 
} from '../data/mockData';

export type NavigationPage = 
  | 'dashboard' 
  | 'auctions' 
  | 'lots' 
  | 'monitoring' 
  | 'favorites' 
  | 'alerts' 
  | 'financial' 
  | 'history' 
  | 'settings';

interface AppContextType {
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  
  // Data entities
  auctions: Auction[];
  lots: Lot[];
  rules: MonitoringRule[];
  matches: MonitoringMatch[];
  favorites: UserFavorite[];
  alerts: AlertNotification[];
  simulations: FinancialSimulation[];
  collectionLogs: CollectionLog[];
  settings: UserSettings;
  
  // Modals & Navigation Selections
  selectedLot: Lot | null;
  setSelectedLot: (lot: Lot | null) => void;
  selectedAuction: Auction | null;
  setSelectedAuction: (auction: Auction | null) => void;
  
  // Actions
  toggleFavorite: (lotId: string) => void;
  isFavorite: (lotId: string) => boolean;
  updateFavoriteNotes: (lotId: string, notes: string, targetBid?: number) => void;
  
  addRule: (rule: Omit<MonitoringRule, 'id' | 'createdAt' | 'matchCount'>) => void;
  updateRule: (id: string, rule: Partial<MonitoringRule>) => void;
  deleteRule: (id: string) => void;
  toggleRuleActive: (id: string) => void;
  
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  unreadAlertsCount: number;
  
  saveSimulation: (simulation: Omit<FinancialSimulation, 'id' | 'createdAt'>) => void;
  deleteSimulation: (id: string) => void;
  startFinancialAnalysisForLot: (lot: Lot) => void;
  
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  triggerManualSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string;
  resetDemoData: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  autoRefreshMinutes: 15,
  telegramEnabled: false,
  telegramChatId: '',
  emailNotifications: true,
  emailAddress: 'usuario@lanceradar.com.br',
  notifyOnEnding24h: true,
  notifyOnPriceChange: true,
  notifyOnNewRulesMatch: true,
  defaultTransportEstimatePercent: 5
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  
  // LocalStorage persistence helpers with fallback
  const [auctions, setAuctions] = useState<Auction[]>(() => {
    const saved = localStorage.getItem('lanceradar_auctions');
    return saved ? JSON.parse(saved) : initialAuctions;
  });

  const [lots, setLots] = useState<Lot[]>(() => {
    const saved = localStorage.getItem('lanceradar_lots');
    return saved ? JSON.parse(saved) : initialLots;
  });

  const [rules, setRules] = useState<MonitoringRule[]>(() => {
    const saved = localStorage.getItem('lanceradar_rules');
    return saved ? JSON.parse(saved) : initialMonitoringRules;
  });

  const [favorites, setFavorites] = useState<UserFavorite[]>(() => {
    const saved = localStorage.getItem('lanceradar_favorites');
    if (saved) return JSON.parse(saved);
    // Initial demo favorite
    return [
      {
        lotId: 'LOT-07178-02',
        addedAt: '2026-11-06T14:00:00Z',
        personalNotes: 'Excelente margem para revenda rápida no marketplace. Avaliar arrematação até R$ 5.500.',
        tags: ['Revenda Alta Margem', 'Galeão']
      }
    ];
  });

  const [alerts, setAlerts] = useState<AlertNotification[]>(() => {
    const saved = localStorage.getItem('lanceradar_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [simulations, setSimulations] = useState<FinancialSimulation[]>(() => {
    const saved = localStorage.getItem('lanceradar_simulations');
    return saved ? JSON.parse(saved) : initialFinancialSimulations;
  });

  const [collectionLogs, setCollectionLogs] = useState<CollectionLog[]>(() => {
    const saved = localStorage.getItem('lanceradar_logs');
    return saved ? JSON.parse(saved) : initialCollectionLogs;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('lanceradar_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('2026-11-12T06:00:00Z');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('lanceradar_auctions', JSON.stringify(auctions));
  }, [auctions]);

  useEffect(() => {
    localStorage.setItem('lanceradar_lots', JSON.stringify(lots));
  }, [lots]);

  useEffect(() => {
    localStorage.setItem('lanceradar_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('lanceradar_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('lanceradar_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('lanceradar_simulations', JSON.stringify(simulations));
  }, [simulations]);

  useEffect(() => {
    localStorage.setItem('lanceradar_settings', JSON.stringify(settings));
  }, [settings]);

  // Compute matches between active rules and lots
  const matches: MonitoringMatch[] = useMemo(() => {
    const activeRules = rules.filter(r => r.active);
    const results: MonitoringMatch[] = [];

    activeRules.forEach(rule => {
      lots.forEach(lot => {
        const textToSearch = `${lot.description} ${lot.fullDescription} ${lot.category} ${lot.tags.join(' ')}`.toLowerCase();
        
        // 1. Keyword check (ANY match)
        const matchedKeywords = rule.keywords.filter(kw => 
          kw.trim().length > 0 && textToSearch.includes(kw.toLowerCase().trim())
        );

        if (rule.keywords.length > 0 && matchedKeywords.length === 0) {
          return;
        }

        // 2. Excluded keywords check (NONE must match)
        const hasExcluded = rule.excludeKeywords.some(ex => 
          ex.trim().length > 0 && textToSearch.includes(ex.toLowerCase().trim())
        );
        if (hasExcluded) return;

        // 3. State check
        if (rule.states.length > 0 && !rule.states.includes(lot.state)) {
          return;
        }

        // 4. Category check
        if (rule.categories.length > 0 && !rule.categories.includes(lot.category)) {
          return;
        }

        // 5. Max price check
        if (rule.maxPrice !== null && lot.minimumBid > rule.maxPrice) {
          return;
        }

        // 6. Min price check
        if (rule.minPrice !== null && lot.minimumBid < rule.minPrice) {
          return;
        }

        // 7. Participant check
        if (rule.participantType !== 'QUALQUER' && rule.participantType !== 'AMBOS') {
          if (lot.allowedParticipant !== 'AMBOS' && lot.allowedParticipant !== rule.participantType) {
            return;
          }
        }

        const criteriaList = [
          matchedKeywords.length > 0 ? `Palavras: ${matchedKeywords.join(', ')}` : '',
          rule.states.length > 0 ? `UF: ${lot.state}` : '',
          rule.maxPrice ? `Teto R$ ${rule.maxPrice.toLocaleString('pt-BR')}` : ''
        ].filter(Boolean);

        results.push({
          id: `match-${rule.id}-${lot.id}`,
          ruleId: rule.id,
          ruleName: rule.name,
          lotId: lot.id,
          lot,
          matchedAt: lot.collectedAt,
          matchedCriteria: criteriaList,
          viewed: false
        });
      });
    });

    return results;
  }, [rules, lots]);

  // Update match count in rules
  useEffect(() => {
    setRules(prev => prev.map(r => {
      const count = matches.filter(m => m.ruleId === r.id).length;
      return r.matchCount !== count ? { ...r, matchCount: count } : r;
    }));
  }, [matches.length]);

  const toggleFavorite = (lotId: string) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.lotId === lotId);
      if (exists) {
        return prev.filter(f => f.lotId !== lotId);
      } else {
        return [...prev, {
          lotId,
          addedAt: new Date().toISOString(),
          personalNotes: '',
          tags: []
        }];
      }
    });
  };

  const isFavorite = (lotId: string) => {
    return favorites.some(f => f.lotId === lotId);
  };

  const updateFavoriteNotes = (lotId: string, notes: string, targetBid?: number) => {
    setFavorites(prev => prev.map(f => {
      if (f.lotId === lotId) {
        return { ...f, personalNotes: notes, targetBid: targetBid ?? f.targetBid };
      }
      return f;
    }));
  };

  const addRule = (rule: Omit<MonitoringRule, 'id' | 'createdAt' | 'matchCount'>) => {
    const newRule: MonitoringRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      matchCount: 0
    };
    setRules(prev => [newRule, ...prev]);

    // Check if new rule matches any lot immediately and add alert
    const newAlert: AlertNotification = {
      id: `alert-rule-${Date.now()}`,
      type: 'REGRA_MONITORAMENTO',
      title: `Regra criada: "${newRule.name}"`,
      description: `A nova regra foi cadastrada e passará a monitorar os leilões em tempo real.`,
      timestamp: new Date().toISOString(),
      read: false,
      entityType: 'EDITAL',
      entityId: newRule.id
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const updateRule = (id: string, updatedFields: Partial<MonitoringRule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const toggleRuleActive = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const unreadAlertsCount = useMemo(() => {
    return alerts.filter(a => !a.read).length;
  }, [alerts]);

  const saveSimulation = (sim: Omit<FinancialSimulation, 'id' | 'createdAt'>) => {
    const newSim: FinancialSimulation = {
      ...sim,
      id: `sim-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSimulations(prev => [newSim, ...prev]);
  };

  const deleteSimulation = (id: string) => {
    setSimulations(prev => prev.filter(s => s.id !== id));
  };

  const startFinancialAnalysisForLot = (lot: Lot) => {
    setSelectedLot(lot);
    setCurrentPage('financial');
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const triggerManualSync = async () => {
    setIsSyncing(true);
    // Realistic simulation of HTTP handshake with RFB portal sle-sociedade
    await new Promise(resolve => setTimeout(resolve, 1200));
    const now = new Date().toISOString();
    setLastSyncTime(now);
    
    // Add a collection log entry
    const newLog: CollectionLog = {
      id: `log-${Date.now()}`,
      startedAt: now,
      completedAt: new Date(Date.now() + 1200).toISOString(),
      status: 'SUCESSO',
      sourceUrl: 'https://www25.receita.fazenda.gov.br/sle-sociedade/portal',
      auctionsProcessed: auctions.length,
      lotsExtracted: lots.length,
      changesDetected: 0,
      latencyMs: 1200,
      details: 'Sincronização manual sob demanda executada com sucesso. Integridade de dados verificada.'
    };
    setCollectionLogs(prev => [newLog, ...prev]);
    setIsSyncing(false);
  };

  const resetDemoData = () => {
    setAuctions(initialAuctions);
    setLots(initialLots);
    setRules(initialMonitoringRules);
    setAlerts(initialAlerts);
    setSimulations(initialFinancialSimulations);
    setCollectionLogs(initialCollectionLogs);
    setSettings(defaultSettings);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        auctions,
        lots,
        rules,
        matches,
        favorites,
        alerts,
        simulations,
        collectionLogs,
        settings,
        selectedLot,
        setSelectedLot,
        selectedAuction,
        setSelectedAuction,
        toggleFavorite,
        isFavorite,
        updateFavoriteNotes,
        addRule,
        updateRule,
        deleteRule,
        toggleRuleActive,
        markAlertRead,
        markAllAlertsRead,
        unreadAlertsCount,
        saveSimulation,
        deleteSimulation,
        startFinancialAnalysisForLot,
        updateSettings,
        triggerManualSync,
        isSyncing,
        lastSyncTime,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
