import { AlertCircle, X } from 'lucide-react';

interface AuthErrorProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export function AuthError({
  message,
  onDismiss,
  type = 'error',
}: AuthErrorProps) {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          text: 'text-yellow-900',
          textMuted: 'text-yellow-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-900',
          textMuted: 'text-blue-700',
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          text: 'text-red-900',
          textMuted: 'text-red-700',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`p-4 rounded-lg border ${styles.bg} ${styles.border} flex gap-3`}
      role="alert"
    >
      <AlertCircle className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`font-semibold ${styles.text}`}>Error</p>
        <p className={`text-sm ${styles.textMuted}`}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`${styles.icon} hover:opacity-70 flex-shrink-0`}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
