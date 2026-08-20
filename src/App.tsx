import React, { useState, useEffect, useMemo } from 'react';
import { ContentCard, StageId, ContentFormat, Priority, Assignee, ChecklistTemplate, ContentFormatItem, TEAM_MEMBERS, DEFAULT_CHECKLIST_TEMPLATES, DEFAULT_FORMATS } from './types';
import { getSampleCards } from './initialData';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { FilterBar, FilterState } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { CardModal } from './components/CardModal';
import { JsonExportModal } from './components/JsonExportModal';
import { SettingsModal } from './components/SettingsModal';
import { isOverdue } from './utils';
import { ToastMessage } from './components/ToastMessage';
import { Sparkles } from 'lucide-react';
import { firestoreService, isFirebaseConfigured, COLLECTIONS } from './firebase';
import { generateCardPDF } from './pdfGenerator';

const STORAGE_KEY = 'kambam_content_pipeline_v1';
const TEAM_STORAGE_KEY = 'kambam_team_members_v1';
const TEMPLATE_STORAGE_KEY = 'kambam_checklist_templates_v1';
const FORMAT_STORAGE_KEY = 'kambam_content_formats_v1';
const THEME_STORAGE_KEY = 'kambam_theme_v1';

export default function App() {
  // Theme state: 'dark' | 'light', persisted in localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  // Persist theme and sync the .theme-light class on <html> (used by index.css tokens)
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Could not save theme to localStorage');
    }
    document.documentElement.classList.toggle('theme-light', theme === 'light');
  }, [theme]);

  // Firebase load state: prevents overwriting remote data before hydration
  const [dataLoaded, setDataLoaded] = useState(false);

  // Main Cards State
  // - With Firebase: starts empty, hydrated from Firestore (no sample data)
  // - Without Firebase: falls back to localStorage / sample data for demo
  const [cards, setCards] = useState<ContentCard[]>(() => {
    if (isFirebaseConfigured) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial sample data');
    }
    return getSampleCards();
  });

  // Team Members State (local cache first, then replaced by Firestore if present)
  const [teamMembers, setTeamMembers] = useState<Assignee[]>(() => {
    try {
      const saved = localStorage.getItem(TEAM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read team members from localStorage');
    }
    return TEAM_MEMBERS;
  });

  // Checklist Templates State (local cache first, then replaced by Firestore if present)
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read checklist templates from localStorage');
    }
    return DEFAULT_CHECKLIST_TEMPLATES;
  });

  // Content Formats State (local cache first, then replaced by Firestore if present)
  const [formats, setFormats] = useState<ContentFormatItem[]>(() => {
    try {
      const saved = localStorage.getItem(FORMAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read content formats from localStorage');
    }
    return DEFAULT_FORMATS;
  });

  // Hydrate from Firestore once on mount
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!isFirebaseConfigured) {
        setDataLoaded(true);
        return;
      }

      try {
        const [loadedCards, loadedMembers, loadedTemplates, loadedFormats] = await Promise.all([
          firestoreService.getAll(COLLECTIONS.cards),
          firestoreService.getAll(COLLECTIONS.teamMembers),
          firestoreService.getAll(COLLECTIONS.checklistTemplates),
          firestoreService.getAll(COLLECTIONS.contentFormats),
        ]);

        if (cancelled) return;

        if (Array.isArray(loadedCards) && loadedCards.length > 0) {
          setCards(loadedCards as unknown as ContentCard[]);
        }
        if (Array.isArray(loadedMembers) && loadedMembers.length > 0) {
          setTeamMembers(loadedMembers as unknown as Assignee[]);
        }
        if (Array.isArray(loadedTemplates) && loadedTemplates.length > 0) {
          setChecklistTemplates(loadedTemplates as unknown as ChecklistTemplate[]);
        }
        if (Array.isArray(loadedFormats) && loadedFormats.length > 0) {
          setFormats(loadedFormats as unknown as ContentFormatItem[]);
        }
      } catch (e) {
        console.warn('Could not load from Firestore, using local data', e);
      } finally {
        if (!cancelled) setDataLoaded(true);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist cards to localStorage + Firestore on change (after hydration)
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.warn('Could not save to localStorage');
    }
    if (isFirebaseConfigured) {
      firestoreService.syncCollection(COLLECTIONS.cards, cards as never[]).catch((e) => {
        console.warn('Could not sync cards to Firestore', e);
      });
    }
  }, [cards, dataLoaded]);

  // Persist team members to localStorage + Firestore on change (after hydration)
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(teamMembers));
    } catch (e) {
      console.warn('Could not save team members to localStorage');
    }
    if (isFirebaseConfigured) {
      firestoreService
        .syncCollection(COLLECTIONS.teamMembers, teamMembers as never[])
        .catch((e) => {
          console.warn('Could not sync team members to Firestore', e);
        });
    }
  }, [teamMembers, dataLoaded]);

  // Persist checklist templates to localStorage + Firestore on change (after hydration)
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(checklistTemplates));
    } catch (e) {
      console.warn('Could not save checklist templates to localStorage');
    }
    if (isFirebaseConfigured) {
      firestoreService
        .syncCollection(COLLECTIONS.checklistTemplates, checklistTemplates as never[])
        .catch((e) => {
          console.warn('Could not sync checklist templates to Firestore', e);
        });
    }
  }, [checklistTemplates, dataLoaded]);

  // Persist content formats to localStorage + Firestore on change (after hydration)
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      localStorage.setItem(FORMAT_STORAGE_KEY, JSON.stringify(formats));
    } catch (e) {
      console.warn('Could not save content formats to localStorage');
    }
    if (isFirebaseConfigured) {
      firestoreService
        .syncCollection(COLLECTIONS.contentFormats, formats as never[])
        .catch((e) => {
          console.warn('Could not sync content formats to Firestore', e);
        });
    }
  }, [formats, dataLoaded]);

  // View mode
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');

  // Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ContentCard | null>(null);
  const [modalInitialStage, setModalInitialStage] = useState<StageId>('ideas');
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(undefined);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  };

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    format: 'all',
    assigneeId: 'all',
    priority: 'all',
    tag: 'all',
    onlyOverdue: false,
  });

  // Calculate available tags across all cards
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    cards.forEach((c) => {
      if (c.tags) {
        c.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [cards]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Search filter (title, notes, tags)
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(query);
        const matchesNotes = card.notes?.toLowerCase().includes(query);
        const matchesTags = card.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesNotes && !matchesTags) return false;
      }

      // Format filter
      if (filters.format !== 'all' && card.format !== filters.format) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeId !== 'all' && card.assignee.id !== filters.assigneeId) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && card.priority !== filters.priority) {
        return false;
      }

      // Tag filter
      if (filters.tag !== 'all' && (!card.tags || !card.tags.includes(filters.tag))) {
        return false;
      }

      // Overdue filter
      if (filters.onlyOverdue && !isOverdue(card.scheduledDate, card.stage)) {
        return false;
      }

      return true;
    });
  }, [cards, filters]);

  // Card Actions
  const handleOpenNewCard = (stage: StageId = 'ideas', initialDate?: string) => {
    setSelectedCard(null);
    setModalInitialStage(stage);
    setModalInitialDate(initialDate);
    setIsCardModalOpen(true);
  };

  const handleCardClick = (card: ContentCard) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (savedCard: ContentCard) => {
    setCards((prev) => {
      const exists = prev.some((c) => c.id === savedCard.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCard.id ? savedCard : c));
      }
      return [savedCard, ...prev];
    });
    showToast(`Conteúdo "${savedCard.title.slice(0, 30)}..." salvo!`, 'success');
  };

  const handleDuplicateCard = (cardToDuplicate: ContentCard) => {
    const newCard: ContentCard = {
      ...cardToDuplicate,
      id: `card-${Date.now()}`,
      title: `${cardToDuplicate.title} (Cópia)`,
      stage: 'ideas',
      createdAt: new Date().toISOString().split('T')[0],
      checklist: cardToDuplicate.checklist.map((item) => ({ ...item, completed: false })),
    };
    setCards((prev) => [newCard, ...prev]);
    showToast('Card duplicado com sucesso!', 'success');
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    showToast('Conteúdo excluído do pipeline.', 'warning');
  };

  const handleMoveStage = (cardId: string, newStage: StageId) => {
    const stageTitles: Record<StageId, string> = {
      ideas: 'Ideias / Backlog',
      production: 'Produção',
      review: 'Revisão',
      done: 'Concluídos',
    };

    let movedCard: ContentCard | undefined;
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          movedCard = { ...c, stage: newStage, updatedAt: new Date().toISOString() };
          return movedCard;
        }
        return c;
      })
    );
    showToast(`Card movido para "${stageTitles[newStage]}"`, 'info');

    // When card reaches 'done', offer to generate PDF
    if (newStage === 'done' && movedCard) {
      const cardSnapshot = movedCard;
      setTimeout(() => {
        const wantsPDF = window.confirm(
          `✅ "${cardSnapshot.title.slice(0, 50)}" foi concluído!\n\nDeseja gerar um PDF com o resumo desta tarefa?`
        );
        if (wantsPDF) {
          generateCardPDF(cardSnapshot);
        }
      }, 400);
    }
  };

  const handleUpdateCardDate = (cardId: string, newDate: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return { ...c, scheduledDate: newDate, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );
    showToast(`Data atualizada para ${newDate}`, 'info');
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      format: 'all',
      assigneeId: 'all',
      priority: 'all',
      tag: 'all',
      onlyOverdue: false,
    });
    showToast('Filtros resetados.');
  };

  const handleImportCards = (importedCards: ContentCard[]) => {
    setCards(importedCards);
    showToast(`${importedCards.length} conteúdos importados!`, 'success');
  };

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col selection:bg-cyan-400 selection:text-slate-950">
      {/* Loading state while Firestore hydrates */}
      {!dataLoaded && isFirebaseConfigured && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-page">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40 animate-pulse">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <p className="text-sm text-ink-2 font-medium">
              Carregando dados do Firebase...
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewCard={() => handleOpenNewCard('ideas')}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Real-time Tracking & Metrics Bar */}
      <MetricsBar
        cards={cards}
        onFilterByStage={(stage) => {
          if (stage === 'all') {
            setFilters((f) => ({ ...f, onlyOverdue: false }));
          } else {
            // Can toggle or set
          }
        }}
        onFilterOverdue={() => {
          setFilters((f) => ({ ...f, onlyOverdue: !f.onlyOverdue }));
        }}
        isOverdueFiltered={filters.onlyOverdue}
      />

      {/* Search & Multi-Filters Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        availableTags={availableTags}
        teamMembers={teamMembers}
        formats={formats}
      />

      {/* Main View Area: Kanban or Calendar */}
      <main className="flex-1">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            cards={filteredCards}
            onCardClick={handleCardClick}
            onNewCardInStage={(stage) => handleOpenNewCard(stage)}
            onMoveStage={handleMoveStage}
            formats={formats}
          />
        ) : (
          <CalendarView
            cards={filteredCards}
            onCardClick={handleCardClick}
            onUpdateCardDate={handleUpdateCardDate}
            onNewCardOnDate={(dateStr) => handleOpenNewCard('ideas', dateStr)}
          />
        )}
      </main>

      {/* Card Edit / Create Modal */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        card={selectedCard}
        initialStage={modalInitialStage}
        initialDate={modalInitialDate}
        teamMembers={teamMembers}
        checklistTemplates={checklistTemplates}
        formats={formats}
        onSave={handleSaveCard}
        onDuplicate={handleDuplicateCard}
        onDelete={handleDeleteCard}
      />

      {/* JSON Export / Import Modal for n8n & API workflows */}
      <JsonExportModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        cards={cards}
        onImportCards={handleImportCards}
      />

      {/* Settings Modal: Responsáveis, Checklists & Formatos */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        teamMembers={teamMembers}
        onSaveTeamMembers={setTeamMembers}
        checklistTemplates={checklistTemplates}
        onSaveChecklistTemplates={setChecklistTemplates}
        formats={formats}
        onSaveFormats={setFormats}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Toast Feedback Notification */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
