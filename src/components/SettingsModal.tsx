import React, { useState, useEffect } from 'react';
import { Assignee, ChecklistTemplate, ContentFormatItem, ASSIGNEE_COLORS, FORMAT_STYLE_OPTIONS } from '../types';
import { FormatIcon, FORMAT_ICON_OPTIONS } from './FormatIcon';
import {
  X,
  Users,
  ListChecks,
  LayoutGrid,
  Plus,
  Pencil,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: Assignee[];
  onSaveTeamMembers: (members: Assignee[]) => void;
  checklistTemplates: ChecklistTemplate[];
  onSaveChecklistTemplates: (templates: ChecklistTemplate[]) => void;
  formats: ContentFormatItem[];
  onSaveFormats: (formats: ContentFormatItem[]) => void;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  onSaveTeamMembers,
  checklistTemplates,
  onSaveChecklistTemplates,
  formats,
  onSaveFormats,
}) => {
  const [tab, setTab] = useState<'members' | 'checklists' | 'formats'>('members');

  // Member form state
  const [memberName, setMemberName] = useState('');
  const [memberColor, setMemberColor] = useState(ASSIGNEE_COLORS[0]);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState<string | null>(null);

  // Checklist template form state
  const [templateName, setTemplateName] = useState('');
  const [templateItemsText, setTemplateItemsText] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [confirmDeleteTemplateId, setConfirmDeleteTemplateId] = useState<string | null>(null);

  // Format form state
  const [formatName, setFormatName] = useState('');
  const [formatStyle, setFormatStyle] = useState(FORMAT_STYLE_OPTIONS[0]);
  const [formatIcon, setFormatIcon] = useState(FORMAT_ICON_OPTIONS[0]);
  const [editingFormatId, setEditingFormatId] = useState<string | null>(null);
  const [confirmDeleteFormatId, setConfirmDeleteFormatId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab('members');
      resetMemberForm();
      resetTemplateForm();
      resetFormatForm();
      setConfirmDeleteMemberId(null);
      setConfirmDeleteTemplateId(null);
      setConfirmDeleteFormatId(null);
    }
  }, [isOpen]);

  const resetMemberForm = () => {
    setMemberName('');
    setMemberColor(ASSIGNEE_COLORS[0]);
    setEditingMemberId(null);
  };

  const resetTemplateForm = () => {
    setTemplateName('');
    setTemplateItemsText('');
    setEditingTemplateId(null);
  };

  const resetFormatForm = () => {
    setFormatName('');
    setFormatStyle(FORMAT_STYLE_OPTIONS[0]);
    setFormatIcon(FORMAT_ICON_OPTIONS[0]);
    setEditingFormatId(null);
  };

  const handleStartEditMember = (member: Assignee) => {
    setMemberName(member.name);
    setMemberColor(member.color);
    setEditingMemberId(member.id);
  };

  const handleSubmitMember = (e: React.FormEvent) => {
    e.preventDefault();
    const name = memberName.trim();
    if (!name) return;

    const newMember: Assignee = {
      id: editingMemberId || `member-${Date.now()}`,
      name,
      initials: getInitials(name),
      color: memberColor,
    };

    if (editingMemberId) {
      onSaveTeamMembers(
        teamMembers.map((m) => (m.id === editingMemberId ? newMember : m))
      );
    } else {
      onSaveTeamMembers([...teamMembers, newMember]);
    }
    resetMemberForm();
  };

  const handleDeleteMember = (id: string) => {
    onSaveTeamMembers(teamMembers.filter((m) => m.id !== id));
    setConfirmDeleteMemberId(null);
  };

  const handleStartEditTemplate = (tpl: ChecklistTemplate) => {
    setTemplateName(tpl.name);
    setTemplateItemsText(tpl.items.join('\n'));
    setEditingTemplateId(tpl.id);
  };

  const handleSubmitTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = templateName.trim();
    if (!name) return;

    const items = templateItemsText
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    const newTemplate: ChecklistTemplate = {
      id: editingTemplateId || `template-${Date.now()}`,
      name,
      items,
    };

    if (editingTemplateId) {
      onSaveChecklistTemplates(
        checklistTemplates.map((t) => (t.id === editingTemplateId ? newTemplate : t))
      );
    } else {
      onSaveChecklistTemplates([...checklistTemplates, newTemplate]);
    }
    resetTemplateForm();
  };

  const handleDeleteTemplate = (id: string) => {
    onSaveChecklistTemplates(checklistTemplates.filter((t) => t.id !== id));
    setConfirmDeleteTemplateId(null);
  };

  const handleStartEditFormat = (format: ContentFormatItem) => {
    setFormatName(format.name);
    setFormatStyle(
      FORMAT_STYLE_OPTIONS.find(
        (s) => s.bg === format.bg && s.text === format.text && s.border === format.border
      ) || FORMAT_STYLE_OPTIONS[0]
    );
    setFormatIcon(format.iconName);
    setEditingFormatId(format.id);
  };

  const handleSubmitFormat = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formatName.trim();
    if (!name) return;

    const newFormat: ContentFormatItem = {
      id: editingFormatId || `format-${Date.now()}`,
      name,
      bg: formatStyle.bg,
      text: formatStyle.text,
      border: formatStyle.border,
      iconName: formatIcon,
    };

    if (editingFormatId) {
      onSaveFormats(formats.map((f) => (f.id === editingFormatId ? newFormat : f)));
    } else {
      onSaveFormats([...formats, newFormat]);
    }
    resetFormatForm();
  };

  const handleDeleteFormat = (id: string) => {
    onSaveFormats(formats.filter((f) => f.id !== id));
    setConfirmDeleteFormatId(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#070e20] border border-cyan-900/50 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-950/80 bg-[#050b18]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Configurações
              </h2>
              <p className="text-xs text-slate-400">
                Cadastro de responsáveis, checklists de tarefas e formatos de conteúdo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0e1c38] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-4">
          <button
            onClick={() => setTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              tab === 'members'
                ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/40'
                : 'bg-[#0a1428] border-cyan-950/80 text-slate-400 hover:text-slate-200 hover:border-cyan-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Responsáveis
          </button>
          <button
            onClick={() => setTab('checklists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              tab === 'checklists'
                ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/40'
                : 'bg-[#0a1428] border-cyan-950/80 text-slate-400 hover:text-slate-200 hover:border-cyan-800/60'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            Checklists de Tarefas
          </button>
          <button
            onClick={() => setTab('formats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              tab === 'formats'
                ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/40'
                : 'bg-[#0a1428] border-cyan-950/80 text-slate-400 hover:text-slate-200 hover:border-cyan-800/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Formatos
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          {tab === 'members' ? (
            <div className="space-y-4">
              {/* New Member Form */}
              <form onSubmit={handleSubmitMember} className="bg-[#050b18] p-3.5 rounded-xl border border-cyan-950/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {editingMemberId ? 'Editar Responsável' : 'Novo Responsável'}
                  </label>
                  {editingMemberId && (
                    <button
                      type="button"
                      onClick={resetMemberForm}
                      className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${memberColor}`}>
                    {getInitials(memberName) || '?'}
                  </div>
                  <input
                    type="text"
                    required
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Nome do responsável (ex: João da Silva)"
                    className="flex-1 bg-[#081226] text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2.5 border border-cyan-950/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none text-sm transition-all"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{editingMemberId ? 'Salvar' : 'Adicionar'}</span>
                  </button>
                </div>

                {/* Color picker */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 mr-1">Cor:</span>
                  {ASSIGNEE_COLORS.map((color) => {
                    const isSelected = color === memberColor;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setMemberColor(color)}
                        className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-[#050b18] scale-110'
                            : 'hover:scale-110 opacity-70 hover:opacity-100'
                        } ${color.split(' ')[0]}`}
                        title={color}
                      />
                    );
                  })}
                </div>
              </form>

              {/* Members List */}
              <div className="space-y-2">
                {teamMembers.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-6">
                    Nenhum responsável cadastrado ainda.
                  </p>
                )}
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0a1329] border border-cyan-950/70 hover:border-cyan-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${member.color}`}>
                        {member.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{member.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">id: {member.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEditMember(member)}
                        title="Editar"
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#0e1c38] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {confirmDeleteMemberId === member.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Excluir
                          </button>
                          <button
                            onClick={() => setConfirmDeleteMemberId(null)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteMemberId(member.id)}
                          title="Excluir"
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === 'checklists' ? (
            <div className="space-y-4">
              {/* New Template Form */}
              <form onSubmit={handleSubmitTemplate} className="bg-[#050b18] p-3.5 rounded-xl border border-cyan-950/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {editingTemplateId ? 'Editar Checklist' : 'Novo Checklist de Tarefas'}
                  </label>
                  {editingTemplateId && (
                    <button
                      type="button"
                      onClick={resetTemplateForm}
                      className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Nome do checklist (ex: Produção de Vídeo)"
                  className="w-full bg-[#081226] text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2.5 border border-cyan-950/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none text-sm transition-all"
                />

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Tarefas (uma por linha)
                  </label>
                  <textarea
                    rows={4}
                    value={templateItemsText}
                    onChange={(e) => setTemplateItemsText(e.target.value)}
                    placeholder={'Estruturar roteiro\nGravar vídeo\nEditar e revisar'}
                    className="w-full bg-[#081226] text-slate-100 placeholder-slate-500 rounded-xl p-3 border border-cyan-950/80 focus:border-cyan-400 outline-none text-xs resize-y"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{editingTemplateId ? 'Salvar Alterações' : 'Criar Checklist'}</span>
                </button>
              </form>

              {/* Templates List */}
              <div className="space-y-2">
                {checklistTemplates.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-6">
                    Nenhum checklist cadastrado ainda.
                  </p>
                )}
                {checklistTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#0a1329] border border-cyan-950/70 hover:border-cyan-900/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">{tpl.name}</p>
                      <ul className="mt-1.5 space-y-0.5">
                        {tpl.items.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                        {tpl.items.length > 4 && (
                          <li className="text-[11px] text-slate-500 font-mono">
                            +{tpl.items.length - 4} tarefas
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEditTemplate(tpl)}
                        title="Editar"
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#0e1c38] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {confirmDeleteTemplateId === tpl.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Excluir
                          </button>
                          <button
                            onClick={() => setConfirmDeleteTemplateId(null)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteTemplateId(tpl.id)}
                          title="Excluir"
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* New Format Form */}
              <form onSubmit={handleSubmitFormat} className="bg-[#050b18] p-3.5 rounded-xl border border-cyan-950/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {editingFormatId ? 'Editar Formato' : 'Novo Formato'}
                  </label>
                  {editingFormatId && (
                    <button
                      type="button"
                      onClick={resetFormatForm}
                      className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${formatStyle.bg} ${formatStyle.text} ${formatStyle.border}`}>
                    <FormatIcon iconName={formatIcon} className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formatName}
                    onChange={(e) => setFormatName(e.target.value)}
                    placeholder="Nome do formato (ex: Podcast)"
                    className="flex-1 bg-[#081226] text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2.5 border border-cyan-950/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none text-sm transition-all"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{editingFormatId ? 'Salvar' : 'Adicionar'}</span>
                  </button>
                </div>

                {/* Icon picker */}
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">Ícone</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {FORMAT_ICON_OPTIONS.map((iconName) => {
                      const isSelected = iconName === formatIcon;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setFormatIcon(iconName)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-950/50 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/50'
                              : 'border-cyan-950/80 text-slate-400 hover:text-cyan-300 hover:border-cyan-800/60'
                          }`}
                          title={iconName}
                        >
                          <FormatIcon iconName={iconName} className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">Cor</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {FORMAT_STYLE_OPTIONS.map((style) => {
                      const isSelected =
                        style.bg === formatStyle.bg && style.text === formatStyle.text;
                      return (
                        <button
                          key={style.bg}
                          type="button"
                          onClick={() => setFormatStyle(style)}
                          className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-[#050b18] scale-110'
                              : 'hover:scale-110 opacity-70 hover:opacity-100'
                          } ${style.swatch}`}
                          title={style.text}
                        />
                      );
                    })}
                  </div>
                </div>
              </form>

              {/* Formats List */}
              <div className="space-y-2">
                {formats.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-6">
                    Nenhum formato cadastrado ainda.
                  </p>
                )}
                {formats.map((format) => (
                  <div
                    key={format.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0a1329] border border-cyan-950/70 hover:border-cyan-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${format.bg} ${format.text} ${format.border}`}>
                        <FormatIcon iconName={format.iconName} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">{format.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">id: {format.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEditFormat(format)}
                        title="Editar"
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#0e1c38] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {confirmDeleteFormatId === format.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteFormat(format.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Excluir
                          </button>
                          <button
                            onClick={() => setConfirmDeleteFormatId(null)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteFormatId(format.id)}
                          title="Excluir"
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};