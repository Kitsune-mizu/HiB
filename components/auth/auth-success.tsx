import { CheckCircle2, X } from 'lucide-react';

interface AuthSuccessProps {
  message: string;
  onDismiss?: () => void;
}

export function AuthSuccess({ message, onDismiss }: AuthSuccessProps) {
  return (
    <div
      className="p-4 rounded-lg border border-green-200 bg-green-50 flex gap-3"
      role="status"
    >
      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-green-900">Sukses</p>
        <p className="text-sm text-green-700">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-600 hover:opacity-70 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
