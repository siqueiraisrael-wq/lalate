import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardView } from '../dashboard/DashboardView';
import { AuctionsView } from '../auctions/AuctionsView';
import { LotsView } from '../lots/LotsView';
import { MonitoringView } from '../monitoring/MonitoringView';
import { FavoritesView } from '../favorites/FavoritesView';
import { AlertsView } from '../alerts/AlertsView';
import { FinancialAnalysisView } from '../financial/FinancialAnalysisView';
import { HistoryView } from '../history/HistoryView';
import { SettingsView } from '../settings/SettingsView';

export const AppLayout: React.FC = () => {
  const { currentPage } = useApp();

  const renderActiveView = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardView />;
      case 'auctions':
        return <AuctionsView />;
      case 'lots':
        return <LotsView />;
      case 'monitoring':
        return <MonitoringView />;
      case 'favorites':
        return <FavoritesView />;
      case 'alerts':
        return <AlertsView />;
      case 'financial':
        return <FinancialAnalysisView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080d1a] text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        
        {/* Dynamic Page View */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0b101f] via-[#090e1c] to-[#070b16]">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
