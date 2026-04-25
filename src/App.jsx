import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, 
  Menu, 
  X, 
  MousePointer2, 
  Terminal, 
  Calendar, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Activity 
} from 'lucide-react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

gsap.registerPlugin(ScrollTrigger);

// --- Components ---

const Noise = () => (
  <div className="noise-overlay pointer-events-none fixed inset-0 z-[999] opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      ref={navRef}
      className={cn(
        "hidden md:flex fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] items-center px-4 py-2 rounded-full border border-white/10 shadow-2xl",
        isScrolled 
          ? "bg-primary/90 backdrop-blur-xl w-auto" 
          : "bg-primary/40 backdrop-blur-md w-auto"
      )}
    >
      <div className="flex items-center gap-8 px-4 text-white">
        <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.25em] font-bold opacity-70">
          <a href="#features" className="hover:opacity-100 transition-opacity">Serviços</a>
          <a href="#philosophy" className="hover:opacity-100 transition-opacity">Filosofia</a>
          <a href="#protocol" className="hover:opacity-100 transition-opacity">Protocolo</a>
          <a href="#pricing" className="hover:opacity-100 transition-opacity">Investimento</a>
        </div>
      </div>
    </nav>
  );
};

import { ContactModal } from './ContactModal';

const Hero = ({ onStart }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-item", {
        y: 120,
        opacity: 0,
        duration: 1.8,
        stagger: 0.1,
        ease: "expo.out",
      });

      gsap.from(imgRef.current, {
        scale: 1.1,
        opacity: 0,
        duration: 3,
        ease: "power4.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="min-h-[100vh] w-full p-0 md:p-6 bg-primary md:bg-background flex flex-col">
      <div 
        ref={containerRef}
        className="relative flex-1 w-full min-h-[90vh] md:min-h-0 rounded-none md:rounded-[3rem] overflow-hidden flex flex-col justify-end p-6 md:p-20"
      >
        {/* Background Image */}
        <div 
          ref={imgRef}
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop)' }}
        />
        <div className="absolute inset-0 z-10 bg-black/30" />
        
        <div className="relative z-20 w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-12">
          <h1 className="reveal-item text-[20vw] md:text-[18vw] font-black text-background leading-[0.8] tracking-tighter uppercase">
            Lume<span className="text-accent">*</span>
          </h1>
          
          <div className="max-w-sm text-left md:text-right flex flex-col items-start md:items-end mt-4 md:mt-0">
            <p className="reveal-item text-background/80 text-sm md:text-lg mb-8 leading-relaxed font-medium">
              Lume é um estúdio global de tecnólogos criativos e contadores de histórias, unidos pela paixão de desbloquear potencial digital.
            </p>

            <button 
              onClick={onStart}
              className="reveal-item bg-background text-primary px-8 md:px-10 py-4 md:py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-4 btn-magnetic group hover:pr-12 transition-all duration-500"
            >
              Iniciar Projeto
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center -mr-2 group-hover:mr-0 transition-all duration-500">
                <ArrowRight className="w-4 h-4 text-background" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCards = () => {
  const containerRef = useRef(null);

  // Card 1 Logic: Diagnostic Shuffler
  const [shuffleItems, setShuffleItems] = useState([
    "Custom Layout",
    "High Fidelity",
    "Pixel Perfect"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShuffleItems(prev => {
        const next = [...prev];
        const last = next.pop();
        next.unshift(last);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Card 2 Logic: Telemetry Typewriter
  const [typeText, setTypeText] = useState("");
  const fullText = "Codificação limpa. SEO Otimizado. Performance 100/100.";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypeText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) i = 0;
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="features" className="py-24 md:py-48 px-6 md:px-24 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-7xl mx-auto overflow-hidden">
        
        {/* Card 1: Diagnostic Shuffler */}
        <div className="bg-white/40 backdrop-blur-sm border border-primary/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 min-h-[320px] md:min-h-[500px] flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)] group hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-700">
          <div className="flex items-center gap-4 mb-12">
            <Layers className="text-accent w-6 h-6" />
            <h3 className="font-bold text-xl uppercase tracking-tighter">Do seu jeito</h3>
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            {shuffleItems.map((item, idx) => (
              <div 
                key={item}
                className={cn(
                  "absolute w-full py-4 px-6 rounded-xl border border-primary/10 bg-background flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  idx === 0 ? "z-30 opacity-100 scale-100" : 
                  idx === 1 ? "z-20 opacity-60 scale-95 -translate-y-12" :
                  "z-10 opacity-30 scale-90 -translate-y-20"
                )}
              >
                <span className="font-mono text-sm uppercase">{item}</span>
                <CheckCircle2 className="w-4 h-4 text-accent" />
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm opacity-60 leading-relaxed">
            Layouts personalizados que se adaptam à identidade única da sua marca, sem amarras.
          </p>
        </div>

        {/* Card 2: Telemetry Typewriter */}
        <div className="bg-white/40 backdrop-blur-sm border border-primary/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 min-h-[320px] md:min-h-[500px] flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)] group hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-700">
          <div className="flex items-center gap-4 mb-12">
            <Terminal className="text-accent w-6 h-6" />
            <h3 className="font-bold text-xl uppercase tracking-tighter">Design Editorial</h3>
          </div>
          <div className="flex-1 bg-primary rounded-2xl p-6 font-mono text-sm text-accent/80 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-4 opacity-40">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>LIVE_FEED</span>
            </div>
            <div className="leading-relaxed">
              {typeText}
              <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse" />
            </div>
          </div>
          <p className="mt-8 text-sm opacity-60 leading-relaxed">
            Narrativa visual focada em converter visitantes em clientes através de clareza e impacto.
          </p>
        </div>

        {/* Card 3: Cursor Protocol Scheduler */}
        <div className="bg-white/40 backdrop-blur-sm border border-primary/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 min-h-[320px] md:min-h-[500px] flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)] group hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-700">
          <div className="flex items-center gap-4 mb-12">
            <Calendar className="text-accent w-6 h-6" />
            <h3 className="font-bold text-xl uppercase tracking-tighter">Performance</h3>
          </div>
          <div className="flex-1 grid grid-cols-7 gap-2">
            {['S','M','T','W','T','F','S'].map((day, i) => (
              <div key={i} className={cn(
                "aspect-square rounded-lg border border-primary/5 flex items-center justify-center text-[10px] font-mono",
                i === 3 ? "bg-accent text-primary font-bold border-accent" : "opacity-40"
              )}>
                {day}
              </div>
            ))}
            <div className="col-span-7 mt-4 flex items-center justify-center relative h-20">
               <div className="absolute top-0 right-0 p-2 bg-accent/20 rounded-lg text-[10px] font-mono text-accent">SAVE_CHANGES</div>
               <MousePointer2 className="w-5 h-5 text-accent absolute animate-bounce" style={{ left: '40%', top: '20%' }} />
            </div>
          </div>
          <p className="mt-8 text-sm opacity-60 leading-relaxed">
            Sites otimizados para velocidade extrema e interação fluida em qualquer dispositivo.
          </p>
        </div>

      </div>
    </section>
  );
};

const Philosophy = () => {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-p", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        y: 80,
        opacity: 0,
        stagger: 0.2,
        duration: 1.8,
        ease: "expo.out"
      });

      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="philosophy"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-primary text-background overflow-hidden px-6 md:px-24"
    >
      <div 
        ref={bgRef}
        className="absolute inset-0 opacity-10 pointer-events-none grayscale scale-110"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop)', backgroundSize: 'cover' }}
      />
      
      <div className="relative z-10 max-w-5xl">
        <p className="reveal-p text-xs md:text-sm uppercase tracking-[0.3em] opacity-40 mb-8 md:mb-12">O Manifesto Lume</p>
        
        <div className="space-y-12 md:space-y-16">
          <div className="reveal-p">
            <span className="text-sm md:text-lg opacity-40 block mb-4">A maioria das agências foca em:</span>
            <h2 className="text-3xl md:text-5xl font-bold opacity-60">Templates genéricos e prazos curtos.</h2>
          </div>

          <div className="reveal-p">
            <span className="text-sm md:text-lg opacity-40 block mb-4">Nós focamos em:</span>
            <h2 className="text-[12vw] md:text-[7rem] text-drama leading-none mt-2">
              Arquitetura<br className="md:hidden" /> <span className="text-accent">Intencional.</span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

const Protocol = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".protocol-card-clean", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        y: 60,
        opacity: 0,
        stagger: 0.2,
        duration: 1.5,
        ease: "expo.out"
      });
    });
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: "01",
      title: "Exploração de Visão",
      desc: "Mapeamos os objetivos centrais e a alma da sua marca para criar um blueprint único.",
      icon: <Activity className="w-8 h-8 text-accent" />
    },
    {
      num: "02",
      title: "Arquitetura Digital",
      desc: "Construção milimétrica usando as tecnologias mais avançadas do mercado.",
      icon: <Cpu className="w-8 h-8 text-accent" />
    },
    {
      num: "03",
      title: "Desdobramento Final",
      desc: "Lançamento otimizado com foco total em performance e experiência do usuário.",
      icon: <CheckCircle2 className="w-8 h-8 text-accent" />
    }
  ];

  return (
    <section id="protocol" ref={containerRef} className="bg-background py-24 md:py-48 px-6 md:px-24 border-t border-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-16 md:mb-32">
          <div className="max-w-2xl">
            <span className="font-mono text-accent text-[10px] md:text-xs uppercase tracking-[0.3em] mb-4 md:mb-6 block">Nosso Processo</span>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
              Protocolo de<br/>Execução
            </h2>
          </div>
          <p className="max-w-xs text-sm opacity-50 leading-relaxed font-medium">
            Uma metodologia rigorosa dividida em três fases fundamentais para garantir a excelência.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="protocol-card-clean group"
            >
              <div className="flex items-center justify-between mb-10 border-b border-primary/5 pb-8">
                <span className="font-mono text-xs opacity-30">{step.num}</span>
                <div className="p-3 bg-white/50 rounded-2xl group-hover:bg-accent group-hover:text-primary transition-all duration-500 shadow-sm">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-6 tracking-tight uppercase">{step.title}</h3>
              <p className="text-sm opacity-50 leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = ({ onStart }) => {
  return (
    <section id="pricing" className="relative py-24 md:py-48 px-6 md:px-24 bg-background z-[20] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="text-center mb-16 md:mb-24 relative z-10">
        <h2 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6">Investimento</h2>
        <p className="opacity-60 max-w-lg mx-auto text-sm md:text-base">Soluções sob medida para diferentes estágios de crescimento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-2 md:px-0">
        <div className="bg-white/50 backdrop-blur-md p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-primary/5 flex flex-col shadow-sm">
          <span className="text-[10px] font-mono opacity-30 mb-4 uppercase tracking-widest">Essencial</span>
          <h3 className="text-4xl font-bold mb-8 tracking-tighter">One-Page</h3>
          <ul className="space-y-4 mb-12 flex-1">
            {['Design Customizado', 'Responsivo', 'GSAP Essentials', 'SEO Base'].map(item => (
              <li key={item} className="flex items-center gap-3 opacity-60 text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent" /> {item}
              </li>
            ))}
          </ul>
          <button 
            onClick={onStart}
            className="w-full py-4 rounded-full border border-primary/10 font-bold hover:bg-primary hover:text-white transition-colors"
          >
            Solicitar
          </button>
        </div>

        <div className="bg-primary text-background p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-accent/20 flex flex-col md:scale-105 shadow-[0_20px_80px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-6 right-8 bg-accent text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Popular</div>
          <span className="text-sm font-mono opacity-40 mb-4 uppercase">Performance</span>
          <h3 className="text-3xl md:text-4xl font-bold mb-8">Multi-Page</h3>
          <ul className="space-y-4 mb-12 flex-1">
            {['Micro-Interações Avançadas', 'Copywriting Estratégico', 'Integração CMS', 'Performance 100%'].map(item => (
              <li key={item} className="flex items-center gap-3 opacity-80 text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" /> <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={onStart}
            className="w-full py-4 rounded-full bg-accent text-primary font-bold btn-magnetic hover:scale-[1.02] transition-transform"
          >
            Iniciar Projeto
          </button>
        </div>

        <div className="bg-white/50 backdrop-blur-md p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-primary/5 flex flex-col shadow-sm">
          <span className="text-[10px] font-mono opacity-30 mb-4 uppercase tracking-widest">Enterprise</span>
          <h3 className="text-4xl font-bold mb-8 tracking-tighter">Customizado</h3>
          <ul className="space-y-4 mb-12 flex-1">
            {['Sistemas Web', 'E-commerce High-End', 'Suporte Prioritário', 'Análises de Dados'].map(item => (
              <li key={item} className="flex items-center gap-3 opacity-60 text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent" /> {item}
              </li>
            ))}
          </ul>
          <button 
            onClick={onStart}
            className="w-full py-4 rounded-full border border-primary/10 font-bold hover:bg-primary hover:text-white transition-colors"
          >
            Consultar
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-primary text-background rounded-t-[3rem] md:rounded-t-[4rem] px-6 md:px-24 pt-20 md:pt-32 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-24">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-4xl font-bold uppercase tracking-tighter mb-8">Lume</h2>
          <p className="opacity-40 max-w-xs leading-relaxed">
            Criando o futuro da web através de design editorial e tecnologia de ponta.
          </p>
        </div>
        <div>
          <h4 className="font-mono text-sm opacity-20 uppercase tracking-widest mb-8">Navegação</h4>
          <ul className="space-y-4 opacity-60 text-sm">
            <li><a href="#" className="hover:text-accent transition-colors">Home</a></li>
            <li><a href="#features" className="hover:text-accent transition-colors">Serviços</a></li>
            <li><a href="#philosophy" className="hover:text-accent transition-colors">Filosofia</a></li>
            <li><a href="#protocol" className="hover:text-accent transition-colors">Protocolo</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-sm opacity-20 uppercase tracking-widest mb-8">Social</h4>
          <ul className="space-y-4 opacity-60 text-sm">
            <li><a href="#" className="hover:text-accent transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">LinkedIn</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Dribbble</a></li>
          </ul>
        </div>
      </div>

      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          SYSTEM_OPERATIONAL // 2026
        </div>
        <p className="font-mono text-[10px] opacity-20 uppercase tracking-widest">
          &copy; Lume Design Studio. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <main className="selection:bg-accent selection:text-primary antialiased">
      <Noise />
      <Navbar />
      <Hero onStart={() => setIsModalOpen(true)} />
      <FeatureCards />
      <Philosophy />
      <Protocol />
      <Pricing onStart={() => setIsModalOpen(true)} />
      <Footer />
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
