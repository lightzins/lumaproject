import React, { useEffect, useRef } from 'react';
import { X, User, LogOut, MessageSquare } from 'lucide-react';
import { supabase } from './supabase';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';

export const AccountModal = ({ isOpen, onClose, session }) => {
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.2)' }
      );
    }
  }, [isOpen]);

  if (!isOpen || !session) return null;

  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.95, y: 20, duration: 0.3, ease: 'power2.in',
      onComplete: onClose
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleClose();
  };

  const handleGoToChat = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/chat');
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-xl">
      <div 
        ref={modalRef}
        className="relative w-full max-w-sm bg-primary/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
      >
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5 text-white/60 hover:text-white" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 mb-6">
            <User className="w-8 h-8 text-accent" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1">Minha Conta</h2>
          <p className="text-white/50 text-sm mb-8">{session.user.email}</p>

          <div className="w-full space-y-3">
            <button 
              onClick={handleGoToChat}
              className="w-full flex items-center justify-center gap-2 bg-white/10 text-white py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Abrir Chat
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-3 rounded-xl hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
