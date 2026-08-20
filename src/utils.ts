import { ContentCard, StageId } from './types';

// Format YYYY-MM-DD to "15 de Ago" or "15/08/2026"
export function formatDateBR(dateStr: string, includeYear: boolean = false): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  
  if (includeYear) {
    return `${day} de ${months[month - 1]} de ${year}`;
  }
  return `${day} de ${months[month - 1]}`;
}

export function isOverdue(scheduledDate: string, stage: StageId): boolean {
  if (!scheduledDate || stage === 'done') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [year, month, day] = scheduledDate.split('-').map(Number);
  if (!year || !month || !day) return false;
  
  const cardDate = new Date(year, month - 1, day);
  cardDate.setHours(0, 0, 0, 0);
  
  return cardDate.getTime() < today.getTime();
}

export function isDueNext7Days(scheduledDate: string, stage: StageId): boolean {
  if (!scheduledDate || stage === 'done') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sevenDays = new Date(today);
  sevenDays.setDate(today.getDate() + 7);
  sevenDays.setHours(23, 59, 59, 999);
  
  const [year, month, day] = scheduledDate.split('-').map(Number);
  if (!year || !month || !day) return false;
  
  const cardDate = new Date(year, month - 1, day);
  cardDate.setHours(0, 0, 0, 0);
  
  return cardDate.getTime() >= today.getTime() && cardDate.getTime() <= sevenDays.getTime();
}

export function getChecklistProgress(checklist: { completed: boolean }[]): { completed: number; total: number; percentage: number } {
  const total = checklist.length;
  if (total === 0) return { completed: 0, total: 0, percentage: 0 };
  const completed = checklist.filter((i) => i.completed).length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

export const STAGE_ORDER: StageId[] = ['ideas', 'production', 'review', 'done'];

export function getNextStage(currentStage: StageId): StageId | null {
  const idx = STAGE_ORDER.indexOf(currentStage);
  if (idx < STAGE_ORDER.length - 1) {
    return STAGE_ORDER[idx + 1];
  }
  return null;
}

export function getPreviousStage(currentStage: StageId): StageId | null {
  const idx = STAGE_ORDER.indexOf(currentStage);
  if (idx > 0) {
    return STAGE_ORDER[idx - 1];
  }
  return null;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateTimeBR(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}
