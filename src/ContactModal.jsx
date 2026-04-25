import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { gsap } from 'gsap';
import emailjs from '@emailjs/browser';

export const ContactModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('signup'); // 'signup', 'details', 'loading', 'success'
  const [accountData, setAccountData] = useState({ name: '', email: '' });
  const [errorMessage, setErrorMessage] = useState('');
  
  const formRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" });
    } else {
      document.body.style.overflow = 'auto';
      setTimeout(() => {
        setStep('signup');
        setAccountData({ name: '', email: '' });
        setErrorMessage('');
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignup = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');

    // Simulate delay
    setStep('loading');
    setErrorMessage('');
    
    setTimeout(() => {
      setAccountData({ name, email });
      setStep('details');
    }, 1200);
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setStep('loading');
    setErrorMessage('');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setStep('details');
      setErrorMessage('Erro de configuração: Chaves do EmailJS não encontradas.');
      return;
    }

    const messageContent = formRef.current.message.value;

    // Configurando os parâmetros para que o e-mail apareça após o nome
    const templateParams = {
      name: `${accountData.name} (${accountData.email})`,
      email: accountData.email,
      message: messageContent
    };

    emailjs.send(serviceId, templateId, templateParams, {
      publicKey: publicKey,
    })
    .then(
      () => {
        setStep('success');
      },
      (error) => {
        console.error('FAILED...', error);
        setStep('details');
        setErrorMessage('Ocorreu um erro ao enviar sua mensagem. Tente novamente.');
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={onClose} />
      
      <div 
        ref={modalRef}
        className="relative bg-background w-full max-w-lg rounded-[3rem] p-8 md:p-12 shadow-2xl border border-primary/5 overflow-y-auto max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-primary/5 rounded-full transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        {step === 'signup' && (
          <div className="pt-2">
            <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
              <UserPlus className="text-accent w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Iniciar Projeto</h3>
            <p className="text-sm opacity-50 mb-8 leading-relaxed">
              Preencha seus dados para enviar a proposta e dar o primeiro passo no seu projeto.
            </p>

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="Seu nome"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">E-mail</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-5 rounded-full bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-black/80 transition-all duration-300 flex justify-center items-center"
              >
                Continuar
              </button>
            </form>
          </div>
        )}

        {step === 'details' && (
          <div className="pt-2">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Detalhes do Projeto</h3>
            <p className="text-sm opacity-50 mb-8">Olá, {accountData.name.split(' ')[0]}! Preencha os detalhes abaixo para enviar sua solicitação.</p>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-2xl flex items-center gap-3 text-sm font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-left">{errorMessage}</p>
              </div>
            )}

            <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Sua Visão</label>
                <textarea 
                  name="message" 
                  required 
                  rows="6"
                  className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
                  placeholder="1: Quanto você quer investir?&#10;2: Qual a ideia principal do projeto?&#10;3: Como você deseja expressar essa ideia para seus clientes?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-5 rounded-full bg-accent text-primary font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all duration-300 flex justify-center items-center gap-2"
              >
                Enviar Proposta Oficial
              </button>
            </form>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-16 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-accent mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter animate-pulse">Processando...</h3>
          </div>
        )}

        {step === 'success' && (
           <div className="text-center py-8">
             <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
               <CheckCircle2 className="text-green-500 w-8 h-8" />
             </div>
             <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Proposta Enviada!</h3>
             <p className="text-lg font-medium text-primary leading-relaxed mb-8">
               Proposta recebida com sucesso. Retornaremos no seu e-mail em até <span className="text-accent underline underline-offset-4 decoration-2">24h</span>.
             </p>
             <button 
               onClick={onClose}
               className="w-full py-5 rounded-full border border-primary/10 font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-background transition-all duration-500"
             >
               Concluído
             </button>
           </div>
        )}
      </div>
    </div>
  );
};
