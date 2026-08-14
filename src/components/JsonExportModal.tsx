import React, { useState } from 'react';
import { ContentCard } from '../types';
import { X, Copy, Check, Download, Upload, AlertCircle, Code } from 'lucide-react';

interface JsonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: ContentCard[];
  onImportCards: (cards: ContentCard[]) => void;
}

export const JsonExportModal: React.FC<JsonExportModalProps> = ({
  isOpen,
  onClose,
  cards,
  onImportCards,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [importError, setImportError] = useState<string | null>(null);

  const jsonString = JSON.stringify(cards, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maestros-ia-pipeline-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('O JSON deve ser uma lista (array) de cards.');
      }
      onImportCards(parsed as ContentCard[]);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'JSON inválido');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#070e20] border border-cyan-900/50 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-950/80 bg-[#050b18]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Estrutura de Dados & Automação (n8n / API)
              </h2>
              <p className="text-xs text-slate-400">
                JSON padronizado para sincronização e webhooks
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

        {/* Tab switch */}
        <div className="flex items-center border-b border-cyan-950/80 px-4 bg-[#050b18]/50">
          <button
            onClick={() => setMode('export')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'export'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Exportar JSON ({cards.length} cards)
          </button>
          <button
            onClick={() => setMode('import')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              mode === 'import'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Importar JSON
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {mode === 'export' ? (
            <div>
              <div className="relative mb-4">
                <pre className="p-3.5 bg-[#040814] border border-cyan-950/80 rounded-xl text-cyan-300 font-mono text-xs max-h-72 overflow-y-auto selection:bg-cyan-900 selection:text-white">
                  {jsonString}
                </pre>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Compatível com nós de Webhook e Agentes n8n.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09142c] hover:bg-[#0d1e42] text-slate-200 text-xs font-semibold border border-cyan-950/80 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Arquivo</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleImportSubmit}>
              <p className="text-xs text-slate-300 mb-2">
                Cole o JSON de cards abaixo para substituir ou restaurar o pipeline:
              </p>
              <textarea
                rows={8}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="[ { id: 'card-1', title: '...', format: '...' } ]"
                className="w-full bg-[#040814] border border-cyan-950/80 rounded-xl p-3 text-xs font-mono text-cyan-300 placeholder-slate-600 outline-none focus:border-cyan-400 mb-3"
              ></textarea>

              {importError && (
                <div className="p-2.5 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#09142c] hover:bg-[#0e1c38] text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar e Salvar</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
