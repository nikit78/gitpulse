import { AlertTriangle, WifiOff, Shield, HelpCircle, RefreshCw } from 'lucide-react';
import type { APIError } from '../types/github';

interface ErrorStateProps {
  error: APIError;
  onRetry?: () => void;
}

const errorConfig = {
  not_found: {
    icon: HelpCircle,
    title: 'User Not Found',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  rate_limited: {
    icon: Shield,
    title: 'Rate Limit Exceeded',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  network: {
    icon: WifiOff,
    title: 'Network Error',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  unknown: {
    icon: AlertTriangle,
    title: 'Something Went Wrong',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
  },
};

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const config = errorConfig[error.type];
  const Icon = config.icon;

  return (
    <div
      className={`flex flex-col items-center text-center gap-4 p-8 rounded-2xl ${config.bg} border ${config.border} animate-fadeIn`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`p-3 rounded-full ${config.bg} border ${config.border}`}>
        <Icon size={28} className={config.color} aria-hidden="true" />
      </div>
      <div>
        <h3 className={`text-base font-semibold ${config.color}`}>{config.title}</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-md">{error.message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all"
          aria-label="Retry search"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}
