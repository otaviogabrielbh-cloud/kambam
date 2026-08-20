import React, { useState, useEffect, useRef } from 'react';
import {
  ContentCard,
  ContentFormat,
  Priority,
  StageId,
  ChecklistItem,
  Assignee,
  ChecklistTemplate,
  ContentFormatItem,
  CardAttachment,
  POPULAR_TAGS,
  STAGES,
  PRIORITY_CONFIG,
} from '../types';
import {
  getPreviousStage,
  getNextStage,
  getChecklistProgress,
  formatDateBR,
  formatFileSize,
  formatDateTimeBR,
} from '../utils';
import {
  X,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Calendar,
  User,
  Tag,
  FileText,
  AlertTriangle,
  Sparkles,
  Paperclip,
  UploadCloud,
  Link as LinkIcon,
  Download,
  ExternalLink,
  File,
  FileImage,
  Film,
  Music,
  Eye,
  Check,
  Loader2,
  FileDown,
} from 'lucide-react';
import { generateCardPDF } from '../pdfGenerator';
import { storageService, isFirebaseConfigured } from '../firebase';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ContentCard | null; // null means creating new
  initialStage?: StageId;
  initialDate?: string;
  teamMembers: Assignee[];
  checklistTemplates: ChecklistTemplate[];
  formats: ContentFormatItem[];
  onSave: (savedCard: ContentCard) => void;
  onDuplicate: (card: ContentCard) => void;
  onDelete: (cardId: string) => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  card,
  initialStage = 'ideas',
  initialDate,
  teamMembers,
  checklistTemplates,
  formats,
  onSave,
  onDuplicate,
  onDelete,
}) => {
  if (!isOpen) return null;

  const isEditing = !!card;

  // Form State
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<ContentFormat>('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [assigneeId, setAssigneeId] = useState(teamMembers[0]?.id ?? '');
  const [priority, setPriority] = useState<Priority>('Média');
  const [stage, setStage] = useState<StageId>(initialStage);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<CardAttachment[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Attachment input states
  const [attachmentTab, setAttachmentTab] = useState<'upload' | 'link'>('upload');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [fileNote, setFileNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<CardAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setFormat(card.format);
      setScheduledDate(card.scheduledDate || '');
      setAssigneeId(card.assignee.id);
      setPriority(card.priority);
      setStage(card.stage);
      setTags([...card.tags]);
      setChecklist(card.checklist ? [...card.checklist] : []);
      setNotes(card.notes || '');
      setAttachments(card.attachments ? [...card.attachments] : []);
    } else {
      // Default for new card
      const today = new Date();
      const defaultDateStr =
        initialDate ||
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
          today.getDate()
        ).padStart(2, '0')}`;

      setTitle('');
      setFormat(formats[0]?.name ?? '');
      setScheduledDate(defaultDateStr);
      setAssigneeId(teamMembers[0]?.id ?? '');
      setPriority('Média');
      setStage(initialStage);
      setTags(['IA', 'Tutorial']);
      setChecklist(
        checklistTemplates[0]
          ? checklistTemplates[0].items.map((text, idx) => ({
              id: `cl-${Date.now()}-${idx}`,
              text,
              completed: false,
            }))
          : [
              { id: `cl-${Date.now()}-1`, text: 'Estruturação do Roteiro / Ideia', completed: false },
              { id: `cl-${Date.now()}-2`, text: 'Produção e Gravação / Design', completed: false },
              { id: `cl-${Date.now()}-3`, text: 'Revisão e Agendamento', completed: false },
            ]
      );
      setNotes('');
      setAttachments([]);
    }
    setShowDeleteConfirm(false);
    setLinkUrl('');
    setLinkName('');
    setFileNote('');
    setPreviewAttachment(null);
  }, [card, initialStage, initialDate, isOpen, formats]);

  // Checklist handlers
  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddChecklistItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: `cl-${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  // Tag handlers
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Attachment handlers
  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);

    const filesArray = Array.from(fileList);

    try {
      const newAttachments = await Promise.all(
        filesArray.map(async (file): Promise<CardAttachment> => {
          const base = {
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            uploadedAt: new Date().toISOString(),
            notes: fileNote.trim() || undefined,
            isLink: false,
          };

          if (isFirebaseConfigured) {
            // Modo nuvem: arquivo vai para o Firebase Storage
            const { url, storagePath } = await storageService.uploadFile(file);
            return { ...base, url, storagePath };
          }

          // Modo local (sem Firebase): base64 embutido no card
          return await new Promise<CardAttachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ ...base, url: reader.result as string });
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
          });
        })
      );

      setAttachments((prev) => [...prev, ...newAttachments]);
      setFileNote('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Erro ao carregar arquivo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkUrl.trim()) return;

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const defaultTitle =
      linkName.trim() ||
      formattedUrl.replace(/^https?:\/\//i, '').split('/')[0] ||
      'Link Externo';

    const newAttachment: CardAttachment = {
      id: `att-link-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: defaultTitle,
      url: formattedUrl,
      uploadedAt: new Date().toISOString(),
      notes: fileNote.trim() || undefined,
      isLink: true,
      type: 'link',
    };

    setAttachments((prev) => [...prev, newAttachment]);
    setLinkUrl('');
    setLinkName('');
    setFileNote('');
  };

  const handleDeleteAttachment = (id: string) => {
    const att = attachments.find((a) => a.id === id);
    if (att?.storagePath) {
      storageService.deleteFile(att.storagePath);
    }
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const getAttachmentIcon = (att: CardAttachment) => {
    if (att.isLink) {
      return <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    const type = att.type?.toLowerCase() || '';
    const name = att.name.toLowerCase();

    if (type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(name)) {
      return <FileImage className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(name)) {
      return <Film className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    if (type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(name)) {
      return <Music className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    return <File className="w-4 h-4 text-cyan-400 shrink-0" />;
  };

  const isImageAttachment = (att: CardAttachment) => {
    if (att.isLink) return false;
    const type = att.type?.toLowerCase() || '';
    const name = att.name.toLowerCase();
    return type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(name);
  };

  // Stage advance / back inside modal
  const prevStage = getPreviousStage(stage);
  const nextStage = getNextStage(stage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedAssignee =
      teamMembers.find((m) => m.id === assigneeId) ||
      teamMembers[0] ||
      ({ id: 'member-unknown', name: 'Sem responsável', initials: '?', color: 'bg-slate-600 text-slate-50' } as Assignee);

    const updatedCard: ContentCard = {
      id: card ? card.id : `card-${Date.now()}`,
      title: title.trim(),
      format: format || formats[0]?.name || '',
      scheduledDate,
      assignee: selectedAssignee,
      priority,
      tags,
      checklist,
      notes: notes.trim(),
      attachments,
      stage,
      createdAt: card ? card.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedCard);
    onClose();
  };

  const checklistProgress = getChecklistProgress(checklist);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="card-editor-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-panel border border-line rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-line bg-well/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink font-display">
                {isEditing ? 'Editar Conteúdo' : 'Novo Conteúdo'}
              </h2>
              <p className="text-xs text-ink-3">
                {isEditing ? 'Atualize as informações do card' : 'Preencha os detalhes para o pipeline'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-raise transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Stage Bar inside Modal */}
          <div className="bg-well p-3 rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-3">Etapa Atual:</span>
              <div className="flex items-center gap-1">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStage(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      stage === s.id
                        ? `${s.bgGlow} text-white font-bold border-cyan-400 shadow-sm`
                        : 'border-transparent text-ink-3 hover:bg-raise hover:text-ink-2'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Step Buttons in Modal */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                id="modal-btn-prev-stage"
                disabled={!prevStage}
                onClick={() => prevStage && setStage(prevStage)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  prevStage
                    ? 'bg-card text-ink-2 border-line hover:bg-raise hover:text-accent cursor-pointer'
                    : 'bg-well/50 text-ink-4 border-line cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                id="modal-btn-next-stage"
                disabled={!nextStage}
                onClick={() => nextStage && setStage(nextStage)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  nextStage
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 hover:bg-cyan-400 cursor-pointer shadow-sm shadow-cyan-500/30'
                    : 'bg-well/50 text-ink-4 border-line cursor-not-allowed'
                }`}
              >
                <span>Avançar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
              Título do Conteúdo <span className="text-cyan-400">*</span>
            </label>
            <input
              id="card-modal-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Como Criar Agentes de IA com Gemini e n8n..."
              className="w-full bg-well text-ink placeholder-ink-4 rounded-xl px-3.5 py-2.5 border border-line focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none text-sm transition-all"
            />
          </div>

          {/* 3 Columns: Format, Date, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Format */}
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
                Formato
              </label>
              <select
                id="card-modal-format-select"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-well text-ink-2 rounded-xl px-3 py-2 border border-line focus:border-cyan-400 outline-none text-xs transition-all cursor-pointer"
              >
                {formats.length === 0 && (
                  <option value="" className="bg-well text-ink-3">
                    Nenhum formato cadastrado
                  </option>
                )}
                {formats.map((f) => (
                  <option key={f.id} value={f.name} className="bg-well text-ink-2">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
                Data Prevista
              </label>
              <input
                id="card-modal-date-input"
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-well text-ink-2 rounded-xl px-3 py-2 border border-line focus:border-cyan-400 outline-none text-xs transition-all font-mono"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
                Prioridade
              </label>
              <select
                id="card-modal-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-well text-ink-2 rounded-xl px-3 py-2 border border-line focus:border-cyan-400 outline-none text-xs transition-all cursor-pointer"
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
              Responsável
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {teamMembers.length === 0 && (
                <p className="col-span-full text-xs text-ink-4">
                  Nenhum responsável cadastrado. Adicione um em Configurações.
                </p>
              )}
              {teamMembers.map((member) => {
                const isSelected = member.id === assigneeId;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setAssigneeId(member.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/50'
                        : 'bg-well border-line text-ink-3 hover:border-cyan-800/60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${member.color}`}
                    >
                      {member.initials}
                    </div>
                    <span className="text-xs font-medium truncate">{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Manager */}
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
              Tags / Categorias
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-card text-accent border border-line"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Tag Input & Popular Suggestions */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Digitar nova tag e pressionar Enter..."
                className="flex-1 bg-well text-ink-2 placeholder-ink-4 rounded-xl px-3 py-1.5 border border-line focus:border-cyan-400 outline-none text-xs"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-1.5 rounded-xl bg-raise hover:bg-raise text-ink-2 text-xs font-medium border border-line cursor-pointer"
              >
                Adicionar
              </button>
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[11px] text-ink-4">Sugeridas:</span>
              {POPULAR_TAGS.slice(0, 6).map((pop) => (
                <button
                  key={pop}
                  type="button"
                  onClick={() => handleAddTag(pop)}
                  disabled={tags.includes(pop)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    tags.includes(pop)
                      ? 'opacity-30 border-transparent text-ink-4 cursor-not-allowed'
                      : 'border-line text-ink-3 hover:text-accent hover:border-cyan-800/60'
                  }`}
                >
                  +{pop}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Manager */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ink-2 uppercase tracking-wider">
                Checklist de Tarefas
              </label>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                {checklistProgress.completed}/{checklistProgress.total} ({checklistProgress.percentage}%)
              </span>
            </div>

            {/* Checklist Progress Bar */}
            <div className="w-full bg-well rounded-full h-1.5 mb-3 overflow-hidden border border-line">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/40"
                style={{ width: `${checklistProgress.percentage}%` }}
              ></div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-1.5 mb-2.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-well border border-line hover:border-line transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-ink-4 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        item.completed ? 'line-through text-ink-4' : 'text-ink-2'
                      }`}
                    >
                      {item.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-ink-4 hover:text-red-400 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Checklist Item */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="Adicionar nova tarefa..."
                className="flex-1 bg-well text-ink-2 placeholder-ink-4 rounded-xl px-3 py-2 border border-line focus:border-cyan-400 outline-none text-xs"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-2 rounded-xl bg-raise hover:bg-raise text-ink-2 text-xs font-semibold border border-line flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Notes / Anotações */}
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
              Anotações / Briefing / Roteiro
            </label>
            <textarea
              id="card-modal-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ideias centrais, referências, links, observações de gravação..."
              className="w-full bg-well text-ink-2 placeholder-ink-4 rounded-xl p-3 border border-line focus:border-cyan-400 outline-none text-xs resize-y"
            ></textarea>
          </div>

          {/* Files & History Attachments Section */}
          <div className="bg-well p-4 rounded-xl border border-line space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-semibold text-ink-2 uppercase tracking-wider">
                  Arquivos & Histórico de Anexos
                </label>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50">
                {attachments.length} {attachments.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            {/* Sub-tabs: Upload or Link */}
            <div className="flex items-center gap-1.5 bg-well p-1 rounded-lg border border-line">
              <button
                type="button"
                onClick={() => setAttachmentTab('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  attachmentTab === 'upload'
                    ? 'bg-cyan-950/70 text-accent border border-cyan-500/40 shadow-sm'
                    : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload de Arquivos</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachmentTab('link')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  attachmentTab === 'link'
                    ? 'bg-cyan-950/70 text-accent border border-cyan-500/40 shadow-sm'
                    : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link Externo (Drive, Figma, Docs)</span>
              </button>
            </div>

            {/* Note / Context Input for Attachment */}
            <div>
              <input
                type="text"
                value={fileNote}
                onChange={(e) => setFileNote(e.target.value)}
                placeholder="Identificação/versão opcional (ex: 'Roteiro v2', 'Capa aprovada', 'Briefing')..."
                className="w-full bg-well text-ink-2 placeholder-ink-4 rounded-lg px-3 py-1.5 border border-line focus:border-cyan-400 outline-none text-xs"
              />
            </div>

            {/* Mode 1: File Upload Box */}
            {attachmentTab === 'upload' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                  isDraggingFile
                    ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                    : 'border-line hover:border-cyan-800/80 bg-well/60'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="p-2 rounded-full bg-cyan-500/10 text-cyan-400">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs text-ink-2 font-medium">
                    {isUploading
                      ? 'Processando e anexando arquivos...'
                      : 'Clique ou arraste arquivos aqui para o histórico'}
                  </p>
                  <p className="text-[10px] text-ink-4">
                    Suporta imagens, PDFs, roteiros, planilhas, vídeos e áudios
                  </p>
                </div>
              </div>
            )}

            {/* Mode 2: Link Input */}
            {attachmentTab === 'link' && (
              <div className="space-y-2 bg-well/60 p-3 rounded-xl border border-line">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    placeholder="Nome do link (ex: Pasta do Google Drive)"
                    className="bg-well text-ink-2 placeholder-ink-4 rounded-lg px-3 py-1.5 border border-line focus:border-cyan-400 outline-none text-xs"
                  />
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="URL (ex: drive.google.com/...)"
                    className="bg-well text-ink-2 placeholder-ink-4 rounded-lg px-3 py-1.5 border border-line focus:border-cyan-400 outline-none text-xs font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddLink}
                  disabled={!linkUrl.trim()}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    linkUrl.trim()
                      ? 'bg-cyan-500/20 text-accent border border-cyan-500/50 hover:bg-cyan-500/30 cursor-pointer'
                      : 'bg-well/50 text-ink-4 border border-transparent cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Anexar Link ao Histórico</span>
                </button>
              </div>
            )}

            {/* List of Attached Files & History */}
            {attachments.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider block">
                  Arquivos Registrados no Histórico ({attachments.length}):
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-well border border-line hover:border-line transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        {isImageAttachment(att) ? (
                          <div
                            onClick={() => setPreviewAttachment(att)}
                            className="w-8 h-8 rounded-lg bg-well border border-line overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            title="Clique para ampliar"
                          >
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-well border border-line flex items-center justify-center shrink-0">
                            {getAttachmentIcon(att)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-xs font-medium text-ink-2 truncate block group-hover:text-accent transition-colors"
                              title={att.name}
                            >
                              {att.name}
                            </span>
                            {att.isLink && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shrink-0">
                                Link
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-ink-4">
                            {att.size && <span>{formatFileSize(att.size)}</span>}
                            <span>{formatDateTimeBR(att.uploadedAt)}</span>
                            {att.notes && (
                              <span className="text-cyan-400/80 font-medium truncate max-w-[150px]">
                                • {att.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Attachment action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isImageAttachment(att) && (
                          <button
                            type="button"
                            onClick={() => setPreviewAttachment(att)}
                            className="p-1 rounded text-ink-3 hover:text-accent hover:bg-raise transition-colors cursor-pointer"
                            title="Visualizar imagem"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {att.isLink ? (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-ink-3 hover:text-emerald-400 hover:bg-raise transition-colors cursor-pointer inline-flex items-center"
                            title="Abrir link externo"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <a
                            href={att.url}
                            download={att.name}
                            className="p-1 rounded text-ink-3 hover:text-accent hover:bg-raise transition-colors cursor-pointer inline-flex items-center"
                            title="Baixar arquivo"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="p-1 rounded text-ink-4 hover:text-red-400 hover:bg-raise transition-colors cursor-pointer"
                          title="Remover anexo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Alert */}
          {showDeleteConfirm && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Tem certeza que deseja excluir este conteúdo?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (card) onDelete(card.id);
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                >
                  Sim, Excluir
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-well text-ink-2 hover:bg-well text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (card) onDuplicate(card);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-raise text-ink-2 text-xs font-medium border border-line transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Duplicar</span>
                  </button>

                   <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/40 text-red-400 text-xs font-medium border border-red-900/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </>
              )}
            </div>

            {/* PDF Generator — always visible when editing */}
            {isEditing && card && (
              <button
                type="button"
                onClick={() => {
                  // Build the current in-progress card snapshot for PDF
                  const teamMemberFound =
                    teamMembers.find((m) => m.id === assigneeId) ||
                    teamMembers[0] ||
                    card.assignee;
                  generateCardPDF({
                    ...card,
                    title: title.trim() || card.title,
                    format: format || card.format,
                    scheduledDate,
                    assignee: teamMemberFound,
                    priority,
                    tags,
                    checklist,
                    notes: notes.trim(),
                    attachments,
                    stage,
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-400 text-xs font-semibold border border-emerald-800/50 hover:border-emerald-600/60 transition-all cursor-pointer"
                title="Gerar resumo em PDF deste card"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Gerar PDF</span>
              </button>
            )}

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-card hover:bg-raise text-ink-2 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-save-card-modal"
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                {isEditing ? 'Salvar Alterações' : 'Criar Conteúdo'}
              </button>
            </div>
          </div>
        </form>

        {/* Image Preview Lightbox */}
        {previewAttachment && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setPreviewAttachment(null)}
          >
            <div
              className="relative max-w-3xl max-h-[85vh] bg-panel border border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-2 border-b border-line text-ink-2">
                <span className="text-xs font-semibold truncate mr-4">
                  {previewAttachment.name}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1 rounded text-ink-3 hover:text-ink hover:bg-well transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 flex items-center justify-center overflow-auto max-h-[70vh]">
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="max-h-[65vh] max-w-full rounded-lg object-contain"
                />
              </div>
              <div className="flex items-center justify-between p-2 pt-1 border-t border-line text-[11px] text-ink-3">
                <span>{previewAttachment.notes || 'Sem observação'}</span>
                <a
                  href={previewAttachment.url}
                  download={previewAttachment.name}
                  className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
