import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import useToastStore from '../../store/toastStore';

const VARIANTS = {
  success: {
    icon: CheckCircle,
    bar: 'bg-green-500',
    iconClass: 'text-green-500',
    bg: 'bg-white',
    border: 'border-green-100',
  },
  error: {
    icon: XCircle,
    bar: 'bg-red-500',
    iconClass: 'text-red-500',
    bg: 'bg-white',
    border: 'border-red-100',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-yellow-400',
    iconClass: 'text-yellow-500',
    bg: 'bg-white',
    border: 'border-yellow-100',
  },
  info: {
    icon: Info,
    bar: 'bg-blue-500',
    iconClass: 'text-blue-500',
    bg: 'bg-white',
    border: 'border-blue-100',
  },
};

function Toast({ id, message, type }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const v = VARIANTS[type] ?? VARIANTS.success;
  const Icon = v.icon;

  return (
    <div
      className={`relative flex items-start gap-3 min-w-[280px] max-w-sm w-full ${v.bg} border ${v.border} rounded-xl shadow-lg px-4 py-3 overflow-hidden`}
    >
      {/* Left colour bar */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${v.bar} rounded-l-xl`} />

      <Icon size={18} className={`${v.iconClass} mt-0.5 shrink-0`} />

      <p className="flex-1 text-sm text-gray-700 leading-snug">{message}</p>

      <button
        onClick={() => dismiss(id)}
        className="p-0.5 text-gray-300 hover:text-gray-500 transition shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto animate-slide-in">
          <Toast {...t} />
        </div>
      ))}
    </div>
  );
}
