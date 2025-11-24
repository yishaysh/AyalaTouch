import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ isVisible, message, type = 'success', onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-full shadow-xl bg-white border border-gray-100 animate-in slide-in-from-top-5 duration-300">
        {type === 'success' ? <CheckCircle className="text-emerald-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
        <span className="font-bold text-gray-800 text-sm">{message}</span>
        <button onClick={onClose} className="bg-gray-100 rounded-full p-1 hover:bg-gray-200 ml-2"><X size={14}/></button>
    </div>
  );
};