import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastMessageProps {
  message: string;
  type?: 'info' | 'success' | 'warning';
  onClose: () => void;
}

export const ToastMessage: React.FC<ToastMessageProps> = ({
  message,
  type = 'info',
  onClose,
}) => {
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500/50 text-amber-200',
          icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
        };
      default:
        return {
          bg: 'bg-cyan-950/90 border-cyan-500/50 text-accent',
          icon: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
        };
    }
  };

  const { bg, icon } = getColors();

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-medium max-w-sm ${bg}`}
      >
        {icon}
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-ink-3 hover:text-ink transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
