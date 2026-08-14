import React from 'react';
import { ContentCard, StageId } from '../types';
import { isOverdue, isDueNext7Days } from '../utils';
import { Clock, AlertTriangle, Calendar, CheckCircle2, Flame, Layers } from 'lucide-react';

interface MetricsBarProps {
  cards: ContentCard[];
  onFilterByStage?: (stage: StageId | 'all') => void;
  selectedStageFilter?: string;
  onFilterOverdue?: () => void;
  isOverdueFiltered?: boolean;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  cards,
  onFilterByStage,
  selectedStageFilter,
  onFilterOverdue,
  isOverdueFiltered,
}) => {
  // Counts by stage
  const ideasCount = cards.filter((c) => c.stage === 'ideas').length;
  const productionCount = cards.filter((c) => c.stage === 'production').length;
  const reviewCount = cards.filter((c) => c.stage === 'review').length;
  const doneCount = cards.filter((c) => c.stage === 'done').length;

  const totalCards = cards.length;
  const activeCards = cards.filter((c) => c.stage !== 'done').length;
  
  // Overdue cards
  const overdueCards = cards.filter((c) => isOverdue(c.scheduledDate, c.stage));
  const overdueCount = overdueCards.length;

  // Next 7 days
  const next7DaysCount = cards.filter((c) => isDueNext7Days(c.scheduledDate, c.stage)).length;

  // Monthly progress: cards scheduled in the current month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const cardsThisMonth = cards.filter((c) => {
    if (!c.scheduledDate) return false;
    const [y, m] = c.scheduledDate.split('-').map(Number);
    return y === currentYear && m === currentMonth;
  });

  const totalThisMonth = cardsThisMonth.length;
  const doneThisMonth = cardsThisMonth.filter((c) => c.stage === 'done').length;
  const monthlyProgress = totalThisMonth > 0 ? Math.round((doneThisMonth / totalThisMonth) * 100) : 0;

  return (
    <div className="bg-[#060d1f]/90 border-b border-cyan-950/60 px-4 lg:px-8 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Main counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:items-center gap-2.5">
          {/* Total Ativos */}
          <div className="flex items-center gap-2.5 bg-[#091226] px-3 py-2 rounded-xl border border-cyan-950/70 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Ativos no Pipeline</p>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-white font-mono">{activeCards}</span>
                <span className="text-[10px] text-slate-500">/ {totalCards} total</span>
              </div>
            </div>
          </div>

          {/* Overdue Alert */}
          <button
            id="metric-overdue-filter"
            onClick={onFilterOverdue}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left cursor-pointer ${
              overdueCount > 0
                ? isOverdueFiltered
                  ? 'bg-red-500/25 border-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20 text-red-300'
                : 'bg-[#091226] border-cyan-950/70 text-slate-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                overdueCount > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800/80 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-medium tracking-wider">Atrasados</p>
              <span
                className={`text-base font-bold font-mono ${
                  overdueCount > 0 ? 'text-red-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                {overdueCount} {overdueCount === 1 ? 'conteúdo' : 'conteúdos'}
              </span>
            </div>
          </button>

          {/* Next 7 days */}
          <div className="flex items-center gap-2.5 bg-[#091226] px-3 py-2 rounded-xl border border-cyan-950/70 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Próximos 7 dias</p>
              <span className="text-base font-bold text-white font-mono">{next7DaysCount} previstos</span>
            </div>
          </div>

          {/* Pipeline breakdown mini pills */}
          <div className="hidden 2xl:flex items-center gap-1.5 bg-[#081022] p-1.5 rounded-xl border border-cyan-950/60">
            <button
              onClick={() => onFilterByStage?.('ideas')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-slate-800/70 text-violet-300 transition-colors cursor-pointer"
              title="Filtrar por Ideias"
            >
              <span className="w-2 h-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50"></span>
              <span>Ideias:</span>
              <strong className="font-mono">{ideasCount}</strong>
            </button>
            <button
              onClick={() => onFilterByStage?.('production')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-slate-800/70 text-amber-300 transition-colors cursor-pointer"
              title="Filtrar por Produção"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
              <span>Produção:</span>
              <strong className="font-mono">{productionCount}</strong>
            </button>
            <button
              onClick={() => onFilterByStage?.('review')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-slate-800/70 text-cyan-300 transition-colors cursor-pointer"
              title="Filtrar por Revisão"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
              <span>Revisão:</span>
              <strong className="font-mono">{reviewCount}</strong>
            </button>
            <button
              onClick={() => onFilterByStage?.('done')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-slate-800/70 text-emerald-300 transition-colors cursor-pointer"
              title="Filtrar por Concluídos"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
              <span>Concluídos:</span>
              <strong className="font-mono">{doneCount}</strong>
            </button>
          </div>
        </div>

        {/* Monthly Progress Bar */}
        <div className="flex items-center gap-3 bg-[#091226] px-3.5 py-2 rounded-xl border border-cyan-950/70 sm:min-w-[280px] shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[11px] text-slate-300 font-medium truncate">
                Meta do Mês ({doneThisMonth}/{totalThisMonth})
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono ml-2">
                {monthlyProgress}%
              </span>
            </div>
            <div className="w-full bg-[#050b1a] rounded-full h-2 overflow-hidden border border-slate-800/60">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/40"
                style={{ width: `${monthlyProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
