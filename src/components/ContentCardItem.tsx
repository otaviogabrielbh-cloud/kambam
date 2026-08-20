import React from 'react';
import { ContentCard, PRIORITY_CONFIG, StageId, ContentFormatItem } from '../types';
import { formatDateBR, isOverdue, getChecklistProgress, getPreviousStage, getNextStage } from '../utils';
import { FormatIcon } from './FormatIcon';
import {
  Calendar,
  CheckSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  GripVertical,
  Paperclip,
} from 'lucide-react';

interface ContentCardItemProps {
  card: ContentCard;
  formats: ContentFormatItem[];
  onClick: () => void;
  onMoveStage: (cardId: string, newStage: StageId) => void;
  onDragStart: (e: React.DragEvent, card: ContentCard) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export const ContentCardItem: React.FC<ContentCardItemProps> = ({
  card,
  formats,
  onClick,
  onMoveStage,
  onDragStart,
  onDragEnd,
  isDragging = false,
}) => {
  const formatInfo = formats.find((f) => f.name === card.format) || {
    bg: 'bg-well',
    text: 'text-ink-2',
    border: 'border-line',
    iconName: '',
  };

  const priorityInfo = PRIORITY_CONFIG[card.priority] || {
    label: card.priority,
    bg: 'bg-well',
    text: 'text-ink-2',
    dot: 'bg-slate-400',
    border: 'border-line',
  };

  const overdue = isOverdue(card.scheduledDate, card.stage);
  const checklistProgress = getChecklistProgress(card.checklist);
  const prevStage = getPreviousStage(card.stage);
  const nextStage = getNextStage(card.stage);

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prevStage) {
      onMoveStage(card.id, prevStage);
    }
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextStage) {
      onMoveStage(card.id, nextStage);
    }
  };

  return (
    <div
      id={`card-${card.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative bg-card hover:bg-raise rounded-xl p-3.5 border transition-all duration-200 cursor-pointer select-none box-neon-card ${
        isDragging ? 'opacity-40 scale-95 border-cyan-400/80 shadow-cyan-500/30' : 'border-line hover:border-cyan-400/60 hover:shadow-cyan-500/10'
      } ${
        overdue ? 'border-l-4 border-l-red-500 ring-1 ring-red-500/40' : ''
      }`}
    >
      {/* Top Badges: Format & Priority */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Format Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${formatInfo.bg} ${formatInfo.text} ${formatInfo.border}`}
          >
            <FormatIcon iconName={formatInfo.iconName} className="w-3 h-3" />
            <span>{card.format}</span>
          </span>

          {/* Priority Badge */}
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`}></span>
            <span>{card.priority}</span>
          </span>
        </div>

        {/* Drag handle icon on hover */}
        <div className="text-ink-4 group-hover:text-cyan-400 transition-colors">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Card Title */}
      <h3 className="text-sm font-semibold text-ink line-clamp-2 leading-snug mb-2.5 group-hover:text-accent transition-colors">
        {card.title}
      </h3>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-2.5">
          {card.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-accent bg-well px-1.5 py-0.5 rounded border border-line"
            >
              #{tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="text-[10px] text-ink-3 font-mono">+{card.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Checklist Progress Bar */}
      {card.checklist && card.checklist.length > 0 && (
        <div className="mb-2.5 bg-well p-1.5 rounded-lg border border-line">
          <div className="flex items-center justify-between text-[11px] text-ink-3 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <CheckSquare className="w-3 h-3 text-cyan-400" />
              <span>Tarefas</span>
            </span>
            <span className="font-mono text-[10px] text-accent font-semibold">
              {checklistProgress.completed}/{checklistProgress.total} ({checklistProgress.percentage}%)
            </span>
          </div>
          <div className="w-full bg-well rounded-full h-1.5 overflow-hidden border border-line">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                checklistProgress.percentage === 100
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-sm shadow-cyan-500/50'
              }`}
              style={{ width: `${checklistProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer Info: Date, Notes Indicator, Assignee, Quick Step Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-line gap-2">
        {/* Date & Overdue */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
              overdue
                ? 'text-red-400 font-bold'
                : 'text-ink-3'
            }`}
            title={overdue ? 'Conteúdo em atraso!' : 'Data prevista'}
          >
            {overdue ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            ) : (
              <Calendar className="w-3 h-3 text-ink-4" />
            )}
            <span className="font-mono">{formatDateBR(card.scheduledDate)}</span>
          </div>

          {/* Notes icon preview */}
          {card.notes && (
            <span title="Possui anotações" className="text-ink-4 hover:text-accent transition-colors">
              <FileText className="w-3 h-3" />
            </span>
          )}

          {/* Attachments preview */}
          {card.attachments && card.attachments.length > 0 && (
            <span
              title={`${card.attachments.length} arquivo(s) / anexo(s) no histórico`}
              className="inline-flex items-center gap-0.5 text-[10px] font-mono text-cyan-400/90 bg-cyan-950/40 px-1 py-0.2 rounded border border-cyan-800/40 hover:text-accent transition-colors"
            >
              <Paperclip className="w-2.5 h-2.5" />
              <span>{card.attachments.length}</span>
            </span>
          )}
        </div>

        {/* Right side: Assignee & Fast Mover Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Assignee Avatar */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${card.assignee.color}`}
            title={`Responsável: ${card.assignee.name}`}
          >
            {card.assignee.initials}
          </div>

          {/* Quick Stage Move Buttons */}
          <div className="flex items-center bg-well rounded-lg border border-line p-0.5 shadow-sm">
            <button
              id={`btn-prev-card-${card.id}`}
              disabled={!prevStage}
              onClick={handlePrevClick}
              title={prevStage ? 'Mover para etapa anterior' : 'Primeira etapa (Ideias)'}
              className={`p-1 rounded transition-colors ${
                prevStage
                  ? 'text-ink-3 hover:text-accent hover:bg-raise cursor-pointer'
                  : 'text-ink-4 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              id={`btn-next-card-${card.id}`}
              disabled={!nextStage}
              onClick={handleNextClick}
              title={nextStage ? 'Avançar para próxima etapa' : 'Última etapa (Concluídos)'}
              className={`p-1 rounded transition-colors ${
                nextStage
                  ? 'text-ink-3 hover:text-accent hover:bg-raise cursor-pointer'
                  : 'text-ink-4 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
