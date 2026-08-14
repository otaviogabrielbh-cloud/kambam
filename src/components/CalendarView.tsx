import React, { useState } from 'react';
import { ContentCard, STAGES, StageId } from '../types';
import { isOverdue, formatDateBR } from '../utils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface CalendarViewProps {
  cards: ContentCard[];
  onCardClick: (card: ContentCard) => void;
  onUpdateCardDate: (cardId: string, newDate: string) => void;
  onNewCardOnDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  cards,
  onCardClick,
  onUpdateCardDate,
  onNewCardOnDate,
}) => {
  const [calMode, setCalMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // Month navigation
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (calMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (calMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Drag & Drop handlers for Calendar cells
  const handleDragStart = (e: React.DragEvent, card: ContentCard) => {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCardId(card.id);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (cardId) {
      onUpdateCardDate(cardId, dateStr);
    }
    setDraggedCardId(null);
    setDragOverDate(null);
  };

  // Get days in month view
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding to reach full grid (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, dateStr, isCurrentMonth: false });
    }

    return days;
  };

  // Get days in week view
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day; // Sunday as start

    const weekDays: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(curr.setDate(diff + i));
      const dateStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
      weekDays.push({
        date: nextDay,
        dateStr,
        isCurrentMonth: nextDay.getMonth() === currentDate.getMonth(),
      });
    }
    return weekDays;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  })();

  // Stage color badge styles for calendar card items
  const getStageBadgeStyle = (stage: StageId) => {
    switch (stage) {
      case 'ideas':
        return 'bg-violet-950/80 border-violet-700/60 text-violet-300 hover:border-violet-500';
      case 'production':
        return 'bg-amber-950/80 border-amber-700/60 text-amber-300 hover:border-amber-500';
      case 'review':
        return 'bg-cyan-950/80 border-cyan-700/60 text-cyan-300 hover:border-cyan-500';
      case 'done':
        return 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300 hover:border-emerald-500';
    }
  };

  const daysToRender = calMode === 'month' ? getMonthDays() : getWeekDays();

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Calendar Header & Controls */}
      <div className="bg-[#070e20]/95 backdrop-blur-md p-4 rounded-2xl border border-cyan-950/70 shadow-2xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display capitalize">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-xs text-slate-400">
              {calMode === 'month' ? 'Visão Mensal de Publicações' : 'Visão Semanal de Produção'}
            </p>
          </div>
        </div>

        {/* View Toggle & Navigation */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Month / Week Switch */}
          <div className="flex items-center bg-[#050b18] p-1 rounded-xl border border-cyan-950/70">
            <button
              onClick={() => setCalMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                calMode === 'month'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setCalMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                calMode === 'week'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semana
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl bg-[#091224] hover:bg-[#0e1c38] border border-cyan-950/70 hover:border-cyan-800/50 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Hoje
          </button>

          {/* Prev / Next Buttons */}
          <div className="flex items-center bg-[#050b18] rounded-xl border border-cyan-950/70 p-0.5">
            <button
              onClick={prevPeriod}
              title="Anterior"
              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#0e1c38] rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPeriod}
              title="Próximo"
              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#0e1c38] rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#070e20]/95 backdrop-blur-md rounded-2xl border border-cyan-950/70 shadow-2xl overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-cyan-950/80 bg-[#050b18]/80">
          {weekDayLabels.map((day, idx) => (
            <div
              key={idx}
              className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-400 border-r border-cyan-950/80 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-cyan-950/60">
          {daysToRender.map(({ date, dateStr, isCurrentMonth }, idx) => {
            const isToday = dateStr === todayStr;
            const isOver = dragOverDate === dateStr;
            const dayCards = cards.filter((c) => c.scheduledDate === dateStr);

            return (
              <div
                key={idx}
                id={`calendar-cell-${dateStr}`}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
                className={`min-h-[120px] sm:min-h-[140px] p-2 flex flex-col transition-all relative group ${
                  !isCurrentMonth ? 'bg-[#040814]/70 text-slate-600' : 'bg-[#081124]/40 text-slate-300'
                } ${isOver ? 'bg-cyan-950/50 ring-2 ring-cyan-400/80 shadow-inner' : ''} ${
                  isToday ? 'bg-cyan-950/30' : ''
                }`}
              >
                {/* Cell Header: Day Number & Add Action */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isToday
                        ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/50 font-extrabold'
                        : isCurrentMonth
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {/* Add content button on hover */}
                  <button
                    onClick={() => onNewCardOnDate(dateStr)}
                    title={`Agendar conteúdo para ${formatDateBR(dateStr)}`}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#0c1834] text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Content Cards on this Day */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[150px]">
                  {dayCards.map((card) => {
                    const overdue = isOverdue(card.scheduledDate, card.stage);

                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card)}
                        onClick={() => onCardClick(card)}
                        className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all shadow-sm flex flex-col gap-1 ${getStageBadgeStyle(
                          card.stage
                        )} ${
                          overdue
                            ? 'border-red-500 bg-red-950/80 text-red-200 ring-1 ring-red-500/40'
                            : ''
                        } ${draggedCardId === card.id ? 'opacity-40' : 'hover:scale-[1.02] hover:shadow-cyan-500/20'}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold truncate">
                            {card.format}
                          </span>
                          {overdue && (
                            <span title="Atrasado!" className="text-red-400">
                              <AlertCircle className="w-2.5 h-2.5 animate-pulse" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-100 line-clamp-2 leading-tight">
                          {card.title}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5 border-t border-white/10">
                          <span className="truncate">{card.assignee.name.split(' ')[0]}</span>
                          <span className="font-semibold uppercase tracking-wider text-[8px] opacity-80">
                            {STAGES.find((s) => s.id === card.stage)?.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
