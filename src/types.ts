export type StageId = 'ideas' | 'production' | 'review' | 'done';

export type ContentFormat = string;

export type Priority = 'Alta' | 'Média' | 'Baixa';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Assignee {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface CardAttachment {
  id: string;
  name: string;
  size?: number;
  type?: string;
  url: string;
  uploadedAt: string;
  notes?: string;
  isLink?: boolean;
}

export interface ContentCard {
  id: string;
  title: string;
  format: ContentFormat;
  scheduledDate: string; // YYYY-MM-DD
  assignee: Assignee;
  priority: Priority;
  tags: string[];
  checklist: ChecklistItem[];
  notes: string;
  attachments?: CardAttachment[];
  stage: StageId;
  createdAt: string;
  updatedAt?: string;
}

export interface StageConfig {
  id: StageId;
  title: string;
  description: string;
  accentColor: string;
  bgGlow: string;
  borderHover: string;
}

export const STAGES: StageConfig[] = [
  {
    id: 'ideas',
    title: 'Ideias / Backlog',
    description: 'Conceitos, pautas e rascunhos iniciais',
    accentColor: 'text-violet-400',
    bgGlow: 'bg-violet-950/20 border-violet-500/30',
    borderHover: 'hover:border-violet-500/50',
  },
  {
    id: 'production',
    title: 'Produção',
    description: 'Gravação, redação, design e edição',
    accentColor: 'text-amber-400',
    bgGlow: 'bg-amber-950/20 border-amber-500/30',
    borderHover: 'hover:border-amber-500/50',
  },
  {
    id: 'review',
    title: 'Revisão',
    description: 'Validação de roteiro, arte e aprovação final',
    accentColor: 'text-cyan-400',
    bgGlow: 'bg-cyan-950/20 border-cyan-500/30',
    borderHover: 'hover:border-cyan-500/50',
  },
  {
    id: 'done',
    title: 'Concluídos',
    description: 'Conteúdos publicados ou agendados',
    accentColor: 'text-emerald-400',
    bgGlow: 'bg-emerald-950/20 border-emerald-500/30',
    borderHover: 'hover:border-emerald-500/50',
  },
];

export interface ContentFormatItem {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  iconName: string;
}

export const DEFAULT_FORMATS: ContentFormatItem[] = [
  {
    id: 'format-youtube',
    name: 'YouTube longo',
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    iconName: 'Youtube',
  },
  {
    id: 'format-shorts',
    name: 'Shorts',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    iconName: 'Zap',
  },
  {
    id: 'format-reels',
    name: 'Reels',
    bg: 'bg-fuchsia-500/15',
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-500/30',
    iconName: 'Instagram',
  },
  {
    id: 'format-carrossel',
    name: 'Carrossel',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    iconName: 'Layers',
  },
  {
    id: 'format-newsletter',
    name: 'Newsletter',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    iconName: 'Mail',
  },
];

export const FORMAT_STYLE_OPTIONS: {
  bg: string;
  text: string;
  border: string;
  swatch: string;
}[] = [
  { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', swatch: 'bg-rose-500' },
  { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', swatch: 'bg-amber-500' },
  { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', swatch: 'bg-fuchsia-500' },
  { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', swatch: 'bg-blue-500' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', swatch: 'bg-emerald-500' },
  { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30', swatch: 'bg-violet-500' },
  { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', swatch: 'bg-cyan-500' },
  { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', swatch: 'bg-orange-500' },
  { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30', swatch: 'bg-teal-500' },
  { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30', swatch: 'bg-slate-400' },
];

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  Alta: {
    label: 'Alta',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    dot: 'bg-red-500 shadow-red-500/50 shadow-sm',
    border: 'border-red-500/30',
  },
  Média: {
    label: 'Média',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    dot: 'bg-amber-500 shadow-amber-500/50 shadow-sm',
    border: 'border-amber-500/30',
  },
  Baixa: {
    label: 'Baixa',
    bg: 'bg-slate-500/15',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
    border: 'border-slate-500/30',
  },
};

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: string[];
}

export const TEAM_MEMBERS: Assignee[] = [
  { id: '1', name: 'Otávio Gabriel', initials: 'OG', color: 'bg-cyan-600 text-cyan-50' },
  { id: '2', name: 'Beatriz Lima', initials: 'BL', color: 'bg-purple-600 text-purple-50' },
  { id: '3', name: 'Carlos Eduardo', initials: 'CE', color: 'bg-emerald-600 text-emerald-50' },
  { id: '4', name: 'Mariana Souza', initials: 'MS', color: 'bg-pink-600 text-pink-50' },
  { id: '5', name: 'Lucas Silva', initials: 'LS', color: 'bg-amber-600 text-amber-50' },
];

export const DEFAULT_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'tpl-video',
    name: 'Produção de Vídeo',
    items: [
      'Estruturação do Roteiro / Ideia',
      'Produção e Gravação / Design',
      'Revisão e Agendamento',
    ],
  },
  {
    id: 'tpl-post',
    name: 'Post para Redes Sociais',
    items: [
      'Pesquisa e referências',
      'Produção de arte / vídeo',
      'Revisão e programação',
    ],
  },
];

export const ASSIGNEE_COLORS = [
  'bg-cyan-600 text-cyan-50',
  'bg-purple-600 text-purple-50',
  'bg-emerald-600 text-emerald-50',
  'bg-pink-600 text-pink-50',
  'bg-amber-600 text-amber-50',
  'bg-blue-600 text-blue-50',
  'bg-rose-600 text-rose-50',
  'bg-indigo-600 text-indigo-50',
  'bg-teal-600 text-teal-50',
  'bg-orange-600 text-orange-50',
];

export const POPULAR_TAGS = [
  'IA',
  'Tutorial',
  'Notícia',
  'ChatGPT',
  'Gemini',
  'Claude',
  'Automação',
  'n8n',
  'Midjourney',
  'Produtividade',
  'DeepSeek',
  'Agentes',
];
