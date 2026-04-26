import React, { useState, useEffect } from 'react';
import { X, Mail, User, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from './supabase';
import { gsap } from 'gsap';

export const ContactModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idea: '',
    budget: '',
    services: []
  });

  const modalRef = React.useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      setSuccess(false);
      setFormData({ name: '', email: '', idea: '', budget: '', services: [] });
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.2)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.95, y: 20, duration: 0.3, ease: 'power2.in',
      onComplete: onClose
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('leads').insert([formData]);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      alert("Ocorreu um erro ao enviar sua ideia. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const servicesList = ['Web Design', 'Sistemas', 'E-commerce', 'Outro'];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-xl" onClick={handleClose}>
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-primary/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 md:top-4 md:right-4 p-4 md:p-3 rounded-full hover:bg-white/10 transition-colors z-50"
        >
          <X className="w-6 h-6 md:w-5 md:h-5 text-white/60 hover:text-white" />
        </button>

        <div className="relative z-10">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ideia Recebida!</h2>
              <p className="text-white/60 mb-8 max-w-xs mx-auto">
                Nossa equipe vai analisar o seu projeto e entraremos em contato em até 24 horas.
              </p>
              <button 
                onClick={handleClose}
                className="bg-white/10 text-white px-8 py-3 rounded-xl hover:bg-white/20 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Qual é a sua ideia?</h2>
                  <p className="text-white/50 text-sm mt-1">Preencha os detalhes e retornaremos em até 24h.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Seu Nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input 
                      type="text" required value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Como devemos te chamar?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input 
                      type="email" required value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Resumo do Projeto</label>
                  <textarea 
                    required value={formData.idea}
                    onChange={e => setFormData({...formData, idea: e.target.value})}
                    placeholder="Conte-nos o que você tem em mente..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Quanto pretende investir? (Opcional)</label>
                  <input 
                    type="text" value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    placeholder="Ex: R$ 500 - R$ 2.000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Interesse</label>
                  <div className="flex flex-wrap gap-2">
                    {servicesList.map(service => (
                      <button
                        type="button"
                        key={service}
                        onClick={() => {
                          const svcs = formData.services;
                          if (svcs.includes(service)) setFormData({...formData, services: svcs.filter(s => s !== service)});
                          else setFormData({...formData, services: [...svcs, service]});
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors border ${
                          formData.services.includes(service) 
                            ? 'bg-accent/20 border-accent text-accent' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-accent text-primary py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-50 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Enviar Pedido de Orçamento
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
