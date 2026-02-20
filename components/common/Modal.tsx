
import React, { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[1000] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-[1001]">
            <button
                onClick={onClose}
                className="p-3 bg-slate-100 text-slate-400 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                aria-label="Tutup Modal"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="max-h-[90vh] overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
