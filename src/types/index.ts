export type AuctionStatus = 'AGENDADO' | 'PROPOSTAS_ABERTAS' | 'EM_LEILAO' | 'HOMOLOGADO' | 'ENCERRADO' | 'SUSPENSO';
export type LotStatus = 'ABERTO' | 'EM_DISPUTA' | 'ARREMATADO' | 'NAO_ARREMATADO' | 'CANCELADO';
export type ParticipantType = 'AMBOS' | 'APENAS_PF' | 'APENAS_PJ';

export interface AuctionDocument {
  id: string;
  name: string;
  type: 'EDITAL' | 'ANEXO' | 'ERRATA' | 'RESULTADO';
  url: string;
  size: string;
  uploadedAt: string;
}

export interface Auction {
  id: string;
  number: string; // e.g. "0817900/000001/2026"
  organ: string; // e.g. "Superintendência Regional da Receita Federal na 8ª Região Fiscal"
  rfUnit: string; // e.g. "Alfândega de Santos"
  state: string; // e.g. "SP"
  city: string; // e.g. "Santos"
  publishedAt: string;
  proposalOpenAt: string;
  proposalCloseAt: string;
  sessionStartAt: string;
  lotsCount: number;
  status: AuctionStatus;
  officialUrl: string;
  documents: AuctionDocument[];
  source: string;
  collectedAt: string;
  lastVerifiedAt: string;
  notes?: string;
}

export interface LotHistoryItem {
  id: string;
  timestamp: string;
  fieldChanged: 'PRECO_MINIMO' | 'DESCRICAO' | 'SITUACAO' | 'DOCUMENTO' | 'INSPECAO';
  oldValue: string;
  newValue: string;
  reason?: string;
}

export interface Lot {
  id: string; // e.g. "LOT-08179-001"
  lotNumber: number; // e.g. 1
  auctionId: string;
  auctionNumber: string;
  description: string;
  fullDescription: string;
  category: string; // e.g. "Eletrônicos & Informática", "Veículos", "Bebidas", "Vestuário", "Industrial"
  itemsCount: number | null;
  minimumBid: number; // in BRL
  state: string;
  city: string;
  storageLocation: string; // e.g. "Porto de Santos - Terminal Ecoporto, Armazém 3"
  visitationSchedule: string; // e.g. "Segunda a sexta das 09h às 16h sob agendamento"
  proposalCloseAt: string;
  status: LotStatus;
  allowedParticipant: ParticipantType;
  pickupConditions: string;
  destinationRestrictions: string; // e.g. "Proibida a comercialização para PF; exclusiva para uso e consumo"
  documents: AuctionDocument[];
  officialUrl: string;
  source: string;
  collectedAt: string;
  lastVerifiedAt: string;
  history: LotHistoryItem[];
  imageUrl?: string;
  tags: string[];
}

export interface MonitoringRule {
  id: string;
  name: string;
  keywords: string[];
  excludeKeywords: string[];
  states: string[];
  categories: string[];
  maxPrice: number | null;
  minPrice: number | null;
  participantType: ParticipantType | 'QUALQUER';
  desiredStatus: LotStatus | 'QUALQUER';
  checkFrequency: 'TEMPO_REAL' | '1_HORA' | '6_HORAS' | 'DIARIA';
  active: boolean;
  createdAt: string;
  matchCount?: number;
}

export interface MonitoringMatch {
  id: string;
  ruleId: string;
  ruleName: string;
  lotId: string;
  lot: Lot;
  matchedAt: string;
  matchedCriteria: string[];
  viewed: boolean;
}

export interface UserFavorite {
  lotId: string;
  addedAt: string;
  personalNotes: string;
  tags: string[];
  targetBid?: number;
}

export type AlertType = 
  | 'NOVO_EDITAL' 
  | 'NOVO_LOTE' 
  | 'REGRA_MONITORAMENTO' 
  | 'ALTERACAO_LOTE' 
  | 'ALTERACAO_PRECO' 
  | 'EDITAL_ATUALIZADO' 
  | 'ERRATA' 
  | 'ENCERRAMENTO_24H' 
  | 'ENCERRAMENTO_48H' 
  | 'MUDANCA_SITUACAO';

export interface AlertNotification {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  entityType: 'EDITAL' | 'LOTE';
  entityId: string;
  editalNumber?: string;
  lotNumber?: number;
  highlight?: boolean;
}

export interface FinancialSimulation {
  id: string;
  lotId: string;
  lotTitle: string;
  lotNumber: number;
  auctionNumber: string;
  createdAt: string;
  minimumBid: number;
  estimatedBid: number;
  transportCost: number;
  taxCharges: number; // ICMS, impostos e encargos de arrematação (5% leiloeiro ou taxas alfandegárias se houver)
  storageCost: number;
  repairCost: number;
  otherCosts: number;
  expectedResalePrice: number;
  // Computed values
  totalInvestment: number;
  expectedGrossProfit: number;
  marginPercent: number;
  roiPercent: number;
  notes: string;
}

export interface CollectionLog {
  id: string;
  startedAt: string;
  completedAt: string;
  status: 'SUCESSO' | 'AVISO' | 'FALHA';
  sourceUrl: string;
  auctionsProcessed: number;
  lotsExtracted: number;
  changesDetected: number;
  latencyMs: number;
  details: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  autoRefreshMinutes: number;
  telegramEnabled: boolean;
  telegramChatId: string;
  emailNotifications: boolean;
  emailAddress: string;
  notifyOnEnding24h: boolean;
  notifyOnPriceChange: boolean;
  notifyOnNewRulesMatch: boolean;
  defaultTransportEstimatePercent: number;
}
