import React from 'react';
import { Kanban, Calendar as CalendarIcon, Plus, Sparkles, Settings } from 'lucide-react';

interface HeaderProps {
  viewMode: 'kanban' | 'calendar';
  onViewModeChange: (mode: 'kanban' | 'calendar') => void;
  onNewCard: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onNewCard,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-page/95 backdrop-blur-xl border-b border-line px-4 lg:px-8 py-3.5 shadow-xl shadow-black/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
            <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-1.5 font-display">
                <span className="text-cyan-400 cyan-glow">KAMBAM</span>
                <span className="text-ink-4 font-normal text-sm sm:text-base hidden sm:inline">-</span>
                <span className="text-ink-2 text-sm sm:text-lg font-medium hidden sm:inline">Controle de tarefas</span>
              </h1>
            </div>
            <p className="text-xs text-ink-3 font-medium tracking-wide">
              Controle de Tarefas e Pipeline de Produção
            </p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-card p-1 rounded-xl border border-line shadow-inner">
            <button
              id="view-toggle-kanban"
              onClick={() => onViewModeChange('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 font-bold'
                  : 'text-ink-3 hover:text-ink-2 hover:bg-well/60'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              id="view-toggle-calendar"
              onClick={() => onViewModeChange('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 font-bold'
                  : 'text-ink-3 hover:text-ink-2 hover:bg-well/60'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendário</span>
            </button>
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-settings"
              onClick={onOpenSettings}
              title="Configurações (Responsáveis e Checklists)"
              className="p-2 rounded-xl bg-card text-ink-2 hover:text-accent hover:bg-raise border border-line hover:border-cyan-800/50 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-sm"
            >
              <Settings className="w-4 h-4 text-ink-2" />
              <span className="hidden xl:inline">Configurações</span>
            </button>
          </div>

          {/* Primary CTA */}
          <button
            id="btn-new-content-header"
            onClick={onNewCard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>Novo Conteúdo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
