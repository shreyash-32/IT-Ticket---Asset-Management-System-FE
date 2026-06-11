import React, { useEffect, useState } from 'react';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';

const TOAST_VARIANTS = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900',
    text: 'text-emerald-800 dark:text-emerald-300',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900',
    text: 'text-red-800 dark:text-red-300',
    iconColor: 'text-red-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
    text: 'text-blue-800 dark:text-blue-300',
    iconColor: 'text-blue-500',
  },
};

const Toast = ({ message, variant = 'success', duration = 4000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const v = TOAST_VARIANTS[variant] || TOAST_VARIANTS.success;
  const Icon = v.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 ${
        v.bg
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      <Icon size={18} className={v.iconColor} />
      <span className={`text-sm font-medium ${v.text}`}>{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-2 p-0.5 rounded hover:bg-black/5 transition-colors">
        <X size={14} className={v.text} />
      </button>
    </div>
  );
};

export default Toast;
