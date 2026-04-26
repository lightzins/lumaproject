import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { AlertCircle, X } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", variant = "danger" }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.9, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#16161D] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[50px] -mr-16 -mt-16" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${variant === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-accent/20 text-accent'}`}>
            <AlertCircle className="w-7 h-7" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{title}</h3>
          <p className="text-sm text-white/50 leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95 ${
                variant === 'danger' 
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' 
                  : 'bg-accent text-primary hover:bg-white shadow-lg shadow-accent/20'
              }`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
