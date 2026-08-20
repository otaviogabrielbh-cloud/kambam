import React, { useState } from 'react';
import { ContentCard, STAGES, StageId, ContentFormatItem } from '../types';
import { ContentCardItem } from './ContentCardItem';
import { Plus, Sparkles, CheckCircle2, Cog, Lightbulb, SearchCheck } from 'lucide-react';

interface KanbanBoardProps {
  cards: ContentCard[];
  formats: ContentFormatItem[];
  onCardClick: (card: ContentCard) => void;
  onNewCardInStage: (stage: StageId) => void;
  onMoveStage: (cardId: string, newStage: StageId) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  cards,
  formats,
  onCardClick,
  onNewCardInStage,
  onMoveStage,
}) => {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<StageId | null>(null);

  const handleDragStart = (e: React.DragEvent, card: ContentCard) => {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCardId(card.id);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: StageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stageId: StageId) => {
    // Only clear if leaving the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStageId: StageId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (cardId) {
      onMoveStage(cardId, targetStageId);
    }
    setDraggedCardId(null);
    setDragOverStage(null);
  };

  // Helper for stage header icon
  const renderStageIcon = (id: StageId) => {
    switch (id) {
      case 'ideas':
        return <Lightbulb className="w-4 h-4 text-violet-400" />;
      case 'production':
        return <Cog className="w-4 h-4 text-amber-400" />;
      case 'review':
        return <SearchCheck className="w-4 h-4 text-cyan-400" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCards = cards.filter((c) => c.stage === stage.id);
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              id={`kanban-column-${stage.id}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`flex flex-col bg-panel/95 backdrop-blur-md rounded-2xl border transition-all duration-200 min-h-[580px] shadow-2xl ${
                isOver
                  ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-card scale-[1.01] shadow-cyan-500/20'
                  : 'border-line hover:border-line'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-line bg-well/60 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-raise border border-line">
                    {renderStageIcon(stage.id)}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                      <span>{stage.title}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-raise text-accent border border-line shadow-inner">
                        {stageCards.length}
                      </span>
                    </h2>
                  </div>
                </div>

                {/* Add Card Button in Column Header */}
                <button
                  id={`btn-add-card-${stage.id}`}
                  onClick={() => onNewCardInStage(stage.id)}
                  title={`Adicionar novo conteúdo em ${stage.title}`}
                  className="p-1.5 rounded-lg text-ink-3 hover:text-accent hover:bg-raise border border-transparent hover:border-cyan-800/40 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="p-3 flex-1 flex flex-col gap-3 min-h-[300px]">
                {stageCards.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-line rounded-xl bg-well/40">
                    <p className="text-xs text-ink-4 mb-3">Nenhum conteúdo nesta etapa</p>
                    <button
                      onClick={() => onNewCardInStage(stage.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-accent bg-cyan-950/50 border border-cyan-800/60 hover:bg-cyan-900/50 hover:border-cyan-500/60 transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                ) : (
                  stageCards.map((card) => (
                    <ContentCardItem
                      key={card.id}
                      card={card}
                      formats={formats}
                      onClick={() => onCardClick(card)}
                      onMoveStage={onMoveStage}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedCardId === card.id}
                    />
                  ))
                )}
              </div>

              {/* Column Footer Quick Add */}
              <div className="p-2.5 pt-0">
                <button
                  onClick={() => onNewCardInStage(stage.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-ink-3 hover:text-accent bg-card/80 hover:bg-raise border border-line hover:border-cyan-800/50 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo conteúdo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
