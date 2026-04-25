import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
// Utility not needed - using template literals for class composition

const faqs = [
  {
    id: 'cost',
    question: 'Quanto custa em média?',
    answer: 'Nossos projetos são sob medida, pois acreditamos em design exclusivo e alto desempenho. Landing Pages de alta conversão começam a partir de R$ 2.500. Plataformas mais complexas variam de acordo com o escopo e funcionalidades.'
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
    answer: 'Nossa equipe está pronta para entender sua visão em detalhes. Clique abaixo para ir direto ao nosso WhatsApp.',
    action: { label: 'Abrir WhatsApp', url: 'https://wa.me/5521981436672?text=Olá%2C%20vim%20pelo%20site%20Lume%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto.' }
  }
];

export const ChatBot = ({ onStart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          { id: 1, text: 'Lume_System_v1.0. Inicializando...', sender: 'system' }
        ]);
      }, 500);

      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: 2, 
          text: 'Olá! Sou o assistente virtual da Lume. Como posso ajudar a elevar sua presença digital hoje?', 
          sender: 'bot' 
        }]);
        setIsTyping(false);
        setShowOptions(true);
      }, 2000);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showOptions]);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen && chatRef.current) {
      gsap.fromTo(chatRef.current, 
        { y: 50, opacity: 0, scale: 0.95 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' }
      );
    }
  }, [isOpen]);

  const handleQuestionClick = (faq) => {
    setShowOptions(false);
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), text: faq.question, sender: 'user' }]);
    
    // Simulate thinking
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: faq.answer, 
        sender: 'bot',
        action: faq.action 
      }]);
      setIsTyping(false);
      
      // Show options again after a short delay
      setTimeout(() => setShowOptions(true), 1500);
    }, 1500);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 z-[900] ${
          isOpen ? 'bg-primary/20 rotate-90 scale-0 opacity-0' : 'bg-accent text-primary hover:scale-110 hover:shadow-accent/20'
        }`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        ref={chatRef}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 w-[calc(100vw-48px)] md:w-[400px] h-[550px] max-h-[85vh] bg-primary/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl z-[950] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-primary/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center relative">
              <Bot className="w-4 h-4 text-accent" />
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 animate-pulse border border-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-widest uppercase">Lume Nexus</h4>
              <p className="text-[10px] text-background/40 font-mono">Status: Online</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-background/60 hover:text-background"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-hide">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-accent text-primary rounded-br-sm' 
                  : msg.sender === 'system'
                    ? 'bg-transparent border border-white/10 text-background/50 font-mono text-[10px] uppercase tracking-widest rounded-bl-sm w-full text-center'
                    : 'bg-white/5 text-background rounded-bl-sm border border-white/5'
              }`}>
                {msg.text}
                
                {msg.action && (
                  msg.action.type === 'modal' ? (
                    <button
                      onClick={() => { setIsOpen(false); onStart && onStart(); }}
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
                      className="mt-4 w-full flex items-center justify-between px-4 py-3 bg-primary text-background rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/10"
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
                <div className="w-1.5 h-1.5 bg-background/50 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-background/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-background/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {showOptions && !isTyping && (
            <div className="flex flex-col gap-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {faqs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => handleQuestionClick(faq)}
                  className="w-full text-left px-5 py-3 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase transition-colors"
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
