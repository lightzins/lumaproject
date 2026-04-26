import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Bot, ArrowRight, Wrench } from 'lucide-react';
import { gsap } from 'gsap';

const faqs = [
  {
    id: 'cost',
    question: 'Quanto custa em média?',
    answer: 'Nossos projetos são sob medida, pois acreditamos em design exclusivo e alto desempenho. Landing Pages de alta conversão começam a partir de R$ 100 até R$ 500. Plataformas mais complexas variam de acordo com o escopo e funcionalidades.'
  },
  {
    id: 'process',
    question: 'Como vocês fazem os sites?',
    answer: 'Nosso processo tem 4 etapas: 1. Imersão (entendemos sua marca), 2. UX/UI Design (criamos a estética e o fluxo), 3. Desenvolvimento Avançado (código limpo, animações e SEO) e 4. Lançamento e Suporte. Tudo focado em conversão e experiência premium.'
  },
  {
    id: 'budget',
    question: 'Solicitar orçamento',
    answer: 'Ótimo! Vamos criar algo incrível juntos. Clique abaixo para preencher sua proposta e nossa equipe entrará em contato em até 24h.',
    action: { label: 'Enviar Proposta', type: 'modal' }
  },
  {
    id: 'contact',
    question: 'Falar com um humano',
    answer: 'Nossa equipe está pronta para entender sua visão em detalhes. Clique abaixo para iniciar seu atendimento no nosso chat oficial.',
    action: { label: 'Iniciar Chat', type: 'chat' }
  }
];

export const ChatBot = ({ onStart, isOpen: controlledIsOpen, onClose: controlledOnClose, onOpen: controlledOnOpen }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const handleClose = () => {
    if (controlledOnClose) controlledOnClose();
    else setInternalIsOpen(false);
  };
  
  const handleOpen = () => {
    if (controlledOnOpen) controlledOnOpen();
    else setInternalIsOpen(true);
  };

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const chatRef = useRef(null);
  const btnRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize: hide chat window on mount
  useEffect(() => {
    if (chatRef.current) {
      gsap.set(chatRef.current, { opacity: 0, scale: 0.9, y: 30, pointerEvents: 'none' });
    }
  }, []);

  // GSAP open/close — no CSS conflict
  useEffect(() => {
    if (!chatRef.current) return;

    if (isOpen) {
      gsap.to(chatRef.current, {
        opacity: 1, scale: 1, y: 0, duration: 0.45,
        ease: 'back.out(1.4)',
        pointerEvents: 'auto',
      });
      if (btnRef.current) {
        gsap.to(btnRef.current, {
          opacity: 0, scale: 0, duration: 0.2,
          ease: 'power2.in',
          pointerEvents: 'none',
        });
      }

      if (messages.length === 0) {
        setIsTyping(true);
        setTimeout(() => {
          setMessages([{ id: 1, text: 'Lume_System_v1.0. Inicializando...', sender: 'system' }]);
        }, 400);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 2,
            text: 'Olá! Sou o assistente virtual da Lume. Como posso ajudar a elevar sua presença digital hoje?',
            sender: 'bot'
          }]);
          setIsTyping(false);
          setShowOptions(true);
        }, 1800);
      }
    } else {
      gsap.to(chatRef.current, {
        opacity: 0, scale: 0.9, y: 30, duration: 0.3,
        ease: 'power2.in',
        pointerEvents: 'none',
      });
      if (btnRef.current) {
        gsap.to(btnRef.current, {
          opacity: 1, scale: 1, duration: 0.35, delay: 0.15,
          ease: 'back.out(1.4)',
          pointerEvents: 'auto',
        });
      }
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showOptions]);

  const handleQuestionClick = (faq) => {
    setShowOptions(false);
    setMessages(prev => [...prev, { id: Date.now(), text: faq.question, sender: 'user' }]);
    setIsTyping(true);

    setTimeout(() => {
      // Check if it's a direct chat action
      if (faq.action?.type === 'chat') {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: 'Redirecionando você para o nosso chat... Um momento.',
          sender: 'bot'
        }]);
        setIsTyping(false);
        setTimeout(() => {
          handleClose();
          onStart && onStart();
        }, 1500);
        return;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: faq.answer,
        sender: 'bot',
        action: faq.action
      }]);
      setIsTyping(false);
      setTimeout(() => setShowOptions(true), 1200);
    }, 1400);
  };

  return (
    <>
      {/* Floating Toggle Button (PC ONLY) */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="hidden md:flex fixed md:bottom-12 md:left-12 w-14 h-14 rounded-full bg-accent text-primary items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 z-[900]"
      >
        <Wrench className="w-6 h-6" />
      </button>

      {/* Chat Window — visibility controlled by GSAP only */}
      <div
        ref={chatRef}
        className="fixed top-24 left-1/2 -translate-x-1/2 md:top-auto md:translate-x-0 md:bottom-32 md:left-12 w-[calc(100vw-48px)] md:w-[400px] h-[600px] md:h-[550px] max-h-[80vh] bg-primary/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl z-[950] flex flex-col overflow-hidden origin-top md:origin-bottom-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-primary/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center relative">
              <Bot className="w-4 h-4 text-accent" />
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 animate-pulse border border-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-widest uppercase text-background">Lume Nexus</h4>
              <p className="text-[10px] text-background/40 font-mono">Status: Online</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-background/60 hover:text-background"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-accent text-primary rounded-br-sm'
                  : msg.sender === 'system'
                    ? 'bg-transparent border border-white/10 text-background/40 font-mono text-[10px] uppercase tracking-widest w-full text-center rounded-xl'
                    : 'bg-white/5 text-background rounded-bl-sm border border-white/5'
              }`}>
                {msg.text}

                {msg.action && (
                  msg.action.type === 'modal' ? (
                    <button
                      onClick={() => { handleClose(); onStart && onStart(); }}
                      className="mt-4 w-full flex items-center justify-between px-4 py-3 bg-accent text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent/80 transition-colors"
                    >
                      {msg.action.label}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <a
                      href={msg.action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-between px-4 py-3 bg-white/5 text-background rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/10"
                    >
                      {msg.action.label}
                      <ArrowRight className="w-4 h-4 text-accent" />
                    </a>
                  )
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="bg-white/5 rounded-2xl rounded-bl-sm p-4 flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-background/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-background/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-background/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {showOptions && !isTyping && (
            <div className="flex flex-col gap-2 mt-2">
              {faqs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => handleQuestionClick(faq)}
                  className="w-full text-left px-5 py-3 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/15 text-accent text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </>
  );
};
