import React from 'react';
import { Search, X, Filter, User, Tag, AlertCircle, Layers } from 'lucide-react';
import { Priority, Assignee, POPULAR_TAGS, ContentFormatItem } from '../types';

export interface FilterState {
  search: string;
  format: string | 'all';
  assigneeId: string | 'all';
  priority: Priority | 'all';
  tag: string | 'all';
  onlyOverdue: boolean;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  availableTags: string[];
  teamMembers: Assignee[];
  formats: ContentFormatItem[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableTags,
  teamMembers,
  formats,
}) => {
  const activeFilterCount = [
    filters.search !== '',
    filters.format !== 'all',
    filters.assigneeId !== 'all',
    filters.priority !== 'all',
    filters.tag !== 'all',
    filters.onlyOverdue,
  ].filter(Boolean).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, format: e.target.value });
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, assigneeId: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, priority: e.target.value as Priority | 'all' });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, tag: e.target.value });
  };

  const toggleOverdueOnly = () => {
    onFilterChange({ ...filters, onlyOverdue: !filters.onlyOverdue });
  };

  return (
    <div className="bg-[#050d1c] border-b border-cyan-950/60 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="filter-search-input"
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Buscar por título, pauta ou anotações..."
            className="w-full bg-[#081226] text-sm text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-8 py-2 border border-cyan-950/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all shadow-inner"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Format */}
          <div className="relative">
            <select
              id="filter-format-select"
              value={filters.format}
              onChange={handleFormatChange}
              className={`text-xs rounded-xl px-3 py-2 pr-8 bg-[#081226] border outline-none cursor-pointer transition-colors appearance-none shadow-sm ${
                filters.format !== 'all'
                  ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/40 shadow-cyan-500/10'
                  : 'border-cyan-950/80 text-slate-300 hover:border-cyan-800/60'
              }`}
            >
              <option value="all" className="bg-[#081226] text-slate-300">Formato: Todos</option>
              {formats.map((f) => (
                <option key={f.id} value={f.name} className="bg-[#081226] text-slate-300">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="relative">
            <select
              id="filter-assignee-select"
              value={filters.assigneeId}
              onChange={handleAssigneeChange}
              className={`text-xs rounded-xl px-3 py-2 pr-8 bg-[#081226] border outline-none cursor-pointer transition-colors appearance-none shadow-sm ${
                filters.assigneeId !== 'all'
                  ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/40 shadow-cyan-500/10'
                  : 'border-cyan-950/80 text-slate-300 hover:border-cyan-800/60'
              }`}
            >
              <option value="all" className="bg-[#081226] text-slate-300">Responsável: Todos</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id} className="bg-[#081226] text-slate-300">
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="relative">
            <select
              id="filter-priority-select"
              value={filters.priority}
              onChange={handlePriorityChange}
              className={`text-xs rounded-xl px-3 py-2 pr-8 bg-[#081226] border outline-none cursor-pointer transition-colors appearance-none shadow-sm ${
                filters.priority !== 'all'
                  ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/40 shadow-cyan-500/10'
                  : 'border-cyan-950/80 text-slate-300 hover:border-cyan-800/60'
              }`}
            >
              <option value="all" className="bg-[#081226] text-slate-300">Prioridade: Todas</option>
              <option value="Alta" className="bg-[#081226] text-slate-300">Alta</option>
              <option value="Média" className="bg-[#081226] text-slate-300">Média</option>
              <option value="Baixa" className="bg-[#081226] text-slate-300">Baixa</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <select
              id="filter-tag-select"
              value={filters.tag}
              onChange={handleTagChange}
              className={`text-xs rounded-xl px-3 py-2 pr-8 bg-[#081226] border outline-none cursor-pointer transition-colors appearance-none shadow-sm ${
                filters.tag !== 'all'
                  ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/40 shadow-cyan-500/10'
                  : 'border-cyan-950/80 text-slate-300 hover:border-cyan-800/60'
              }`}
            >
              <option value="all" className="bg-[#081226] text-slate-300">Tag: Todas</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag} className="bg-[#081226] text-slate-300">
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          {/* Overdue filter toggle pill */}
          <button
            id="filter-overdue-toggle-btn"
            onClick={toggleOverdueOnly}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              filters.onlyOverdue
                ? 'bg-red-500/20 text-red-300 border-red-500 shadow-red-500/30'
                : 'bg-[#081226] text-slate-400 border-cyan-950/80 hover:border-cyan-800/60 hover:text-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filters.onlyOverdue ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
            <span>Apenas Atrasados</span>
          </button>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              id="btn-clear-all-filters"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 transition-all cursor-pointer shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
