import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { soundFx } from './soundFx';
import './App.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ==========================================
// CRIMSON CYBER PARTICLE CONFIGURATION
// (Tweak these numbers anytime to adjust particle looks!)
// ==========================================
export const PARTICLE_CONFIG = {
  count: 45,                  // Total number of floating embers
  minSize: 1.2,               // Smallest ember radius (px)
  maxSize: 3.2,               // Largest ember radius (px)
  speedY: -0.35,              // Upward floating speed
  speedXSpread: 0.25,         // Sideways drift variation
  color: 'rgba(220, 38, 38,', // Crimson red base color
  mouseRepelDistance: 90,     // Distance at which particles flee from cursor (px)
};

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouseX = -9999;
    let mouseY = -9999;
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Generate Initial Particles
    const particles = [];
    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (PARTICLE_CONFIG.maxSize - PARTICLE_CONFIG.minSize) + PARTICLE_CONFIG.minSize,
        vx: (Math.random() - 0.5) * PARTICLE_CONFIG.speedXSpread,
        vy: PARTICLE_CONFIG.speedY - Math.random() * 0.2,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    const repelDistSq = PARTICLE_CONFIG.mouseRepelDistance * PARTICLE_CONFIG.mouseRepelDistance;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Fast squared distance mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < repelDistSq) {
          const dist = Math.sqrt(distSq) || 1;
          const force = (PARTICLE_CONFIG.mouseRepelDistance - dist) / PARTICLE_CONFIG.mouseRepelDistance;
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        }

        // Screen boundary wrapping
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw particle ember (Fast GPU-friendly dual-pass)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 38, 38, ${p.alpha * 0.25})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 100, ${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

// ==========================================
// LIVE INDIAN STANDARD TIME (IST) CLOCK
// ==========================================
const LiveClock = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTime(now.toLocaleTimeString('en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] text-zinc-400 bg-zinc-950/80 border border-zinc-800/80 px-3 py-1.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>PUNE, IN // {time || '00:00:00'} IST</span>
    </div>
  );
};

// ==========================================
// INTERACTIVE CUSTOM CURSOR (Context-Aware)
// ==========================================
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const glowRef = useRef(null);
  const [hoverText, setHoverText] = useState("");

  useEffect(() => {
    const cursor = cursorRef.current;
    const glow = glowRef.current;
    if (!cursor || !glow) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(glow, { xPercent: -50, yPercent: -50 });

    const xMove = gsap.quickTo(cursor, "x", { duration: 0.015, ease: "none" });
    const yMove = gsap.quickTo(cursor, "y", { duration: 0.015, ease: "none" });
    const xGlow = gsap.quickTo(glow, "x", { duration: 0.15, ease: "power2.out" });
    const yGlow = gsap.quickTo(glow, "y", { duration: 0.15, ease: "power2.out" });

    const moveCursor = (e) => {
      xMove(e.clientX);
      yMove(e.clientY);
      xGlow(e.clientX);
      yGlow(e.clientY);
    };

    const handleHover = (e) => setHoverText(e.detail);
    const handleLeave = () => setHoverText("");

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("cursorHover", handleHover);
    window.addEventListener("cursorLeave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("cursorHover", handleHover);
      window.removeEventListener("cursorLeave", handleLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-[120px] h-[120px] rounded-full pointer-events-none z-[9998] will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(220, 38, 38, 0.35) 0%, transparent 70%)' }}
      />
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 border-[1.5px] border-red-600 rounded-full pointer-events-none z-[9999] shadow-[0_0_10px_rgba(220,38,38,0.8)] flex items-center justify-center will-change-transform transition-[width,height,background-color,border-color] duration-150 ease-out ${hoverText ? 'w-16 h-16 bg-red-600/10 backdrop-blur-sm' : 'w-8 h-8'
          }`}
      >
        <span className={`text-[10px] font-mono tracking-widest text-white transition-opacity duration-150 ${hoverText ? 'opacity-100' : 'opacity-0'}`}>
          {hoverText}
        </span>
      </div>
    </>
  );
};

// ==========================================
// HACKER COMMAND PALETTE (Ctrl + K)
// ==========================================
const CommandPalette = ({ isOpen, onClose, scrollTo, lenisRef }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    { id: 'projects', label: 'Go to Featured Projects', category: 'NAVIGATION', action: () => scrollTo('projects') },
    { id: 'about', label: 'The Architect (Bio & Skills)', category: 'NAVIGATION', action: () => scrollTo('about') },
    { id: 'contact', label: 'Initiate Contact Protocol', category: 'NAVIGATION', action: () => scrollTo('contact-section') },
    { id: 'github', label: 'Open GitHub Profile', category: 'EXTERNAL', action: () => window.open('https://github.com/kshitijshinde22-hue', '_blank') },
    { id: 'clinic', label: 'Open Healthcare ERP Repo', category: 'PROJECT', action: () => window.open('https://github.com/kshitijshinde22-hue/dr-pakhare-clinic', '_blank') },
    { id: 'linkedin', label: 'Connect on LinkedIn', category: 'EXTERNAL', action: () => window.open('https://www.linkedin.com/in/kshitij-shinde-3b02622b5', '_blank') },
    { id: 'email', label: 'Send Email Directly', category: 'CONTACT', action: () => window.location.href = 'mailto:kshitijshinde12321@gmail.com' },
    { id: 'sound', label: 'Toggle Synthetic Audio FX', category: 'SYSTEM', action: () => soundFx.toggleSound() },
    { id: 'toman', label: 'Tokyo Manji Easter Egg // 無敵', category: 'SECRET', action: () => alert('🔥 TOKYO MANJI GANG - EST. 2026 // KSHITIJ SHINDE') },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase()) ||
    c.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-red-600/50 rounded-2xl p-4 shadow-[0_0_60px_rgba(220,38,38,0.25)] overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 px-2">
          <span className="text-red-500 font-mono text-sm">❯</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g. projects, github, email, toman)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white font-mono text-sm placeholder-zinc-500 focus:outline-none cursor-none"
          />
          <span className="text-zinc-500 font-mono text-[10px] border border-zinc-800 px-2 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Command Results */}
        <div className="mt-3 max-h-[320px] overflow-y-auto flex flex-col gap-1 pr-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  item.action();
                  onClose();
                }}
                onMouseEnter={() => soundFx.playHover()}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-950/30 border border-transparent hover:border-red-600/40 text-left transition-all cursor-none group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-red-500 font-mono text-xs opacity-60 group-hover:opacity-100">//</span>
                  <span className="text-zinc-200 font-mono text-sm group-hover:text-white font-medium">{item.label}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-red-400 uppercase tracking-widest border border-zinc-800 px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-zinc-500 font-mono text-xs">
              No matching protocol found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TOP NAVIGATION HEADER WITH AUDIO & CLOCK
// ==========================================
const Navbar = ({ lenisRef, onOpenCmd }) => {
  const [audioActive, setAudioActive] = useState(false);

  const handleAudioToggle = () => {
    const newState = soundFx.toggleSound();
    setAudioActive(newState);
  };

  const scrollTo = (id) => {
    soundFx.playClick();
    const elem = document.getElementById(id);
    if (elem) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(elem);
      } else {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 glass-nav px-6 py-4 flex items-center justify-between transition-all duration-300">
      {/* Brand Logo */}
      <div
        className="flex items-center gap-3 cursor-none"
        onMouseEnter={() => {
          soundFx.playHover();
          window.dispatchEvent(new CustomEvent("cursorHover", { detail: "TŌMAN" }));
        }}
        onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
        <span className="font-sans text-sm tracking-[0.2em] uppercase text-white font-black">
          KSHITIJ <span className="text-red-600 font-light opacity-50 px-1">|</span> TOKYO MANJI
        </span>
      </div>

      {/* Nav Anchors */}
      <nav className="hidden md:flex items-center gap-10 font-sans text-[11px] tracking-[0.15em] text-zinc-400 uppercase font-medium">
        <button
          onClick={() => scrollTo('projects')}
          onMouseEnter={() => {
            soundFx.playHover();
            window.dispatchEvent(new CustomEvent("cursorHover", { detail: "NAV" }));
          }}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
          className="hover:text-white transition-colors cursor-none relative group py-1"
        >
          FEATURED WORKS
          <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </button>
        <button
          onClick={() => scrollTo('about')}
          onMouseEnter={() => {
            soundFx.playHover();
            window.dispatchEvent(new CustomEvent("cursorHover", { detail: "NAV" }));
          }}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
          className="hover:text-white transition-colors cursor-none relative group py-1"
        >
          THE ARCHITECT
          <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </button>
        <button
          onClick={() => scrollTo('contact-section')}
          onMouseEnter={() => {
            soundFx.playHover();
            window.dispatchEvent(new CustomEvent("cursorHover", { detail: "NAV" }));
          }}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
          className="hover:text-white transition-colors cursor-none relative group py-1"
        >
          TRANSMIT MSG
          <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </button>
      </nav>

      {/* Right Controls: IST Clock + Cmd Palette + Audio Equalizer Toggle */}
      <div className="flex items-center gap-3">
        {/* Live Indian Timezone Clock */}
        <LiveClock />

        {/* Command Palette Trigger Button */}
        <button
          onClick={onOpenCmd}
          onMouseEnter={() => {
            soundFx.playHover();
            window.dispatchEvent(new CustomEvent("cursorHover", { detail: "CMD" }));
          }}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
          className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 px-3 py-1.5 rounded-md transition-all cursor-none"
        >
          <span>⌘</span>
          <span>CTRL + K</span>
        </button>

        {/* Audio Sound FX Toggle with Equalizer Waveform */}
        <button
          onClick={handleAudioToggle}
          onMouseEnter={() => {
            soundFx.playHover();
            window.dispatchEvent(new CustomEvent("cursorHover", { detail: "AUDIO" }));
          }}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
          className={`flex items-center gap-2 font-mono text-xs tracking-widest px-3 py-1.5 rounded-md border transition-all cursor-none ${audioActive
            ? 'border-red-600 text-red-500 bg-red-950/30 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
            : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
            }`}
        >
          {/* Animated Equalizer Waveform Bars */}
          {audioActive ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-0.5 bg-red-500 rounded-full eq-bar-1" />
              <span className="w-0.5 bg-red-500 rounded-full eq-bar-2" />
              <span className="w-0.5 bg-red-500 rounded-full eq-bar-3" />
              <span className="w-0.5 bg-red-500 rounded-full eq-bar-4" />
            </div>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          )}
          <span>AUDIO: {audioActive ? 'ON' : 'MUTED'}</span>
        </button>
      </div>
    </header>
  );
};

// ==========================================
// 3D TILT CARD COMPONENT WITH MODAL TRIGGER
// ==========================================
const TiltCard = ({ item, onSelect }) => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !glowRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.3,
      overwrite: "auto"
    });

    gsap.to(glowRef.current, {
      x: x - 100,
      y: y - 100,
      opacity: 1,
      ease: "power2.out",
      duration: 0.3,
      overwrite: "auto"
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      ease: "power3.out",
      duration: 0.5,
      overwrite: "auto"
    });
    gsap.to(glowRef.current, {
      opacity: 0,
      ease: "power3.out",
      duration: 0.5,
      overwrite: "auto"
    });
  };

  return (
    <div className="w-[85vw] md:w-[500px] shrink-0 h-[480px] select-none">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          soundFx.playHover();
          window.dispatchEvent(new CustomEvent("cursorHover", { detail: "OPEN" }));
        }}
        onMouseLeave={() => {
          handleMouseLeave();
          window.dispatchEvent(new CustomEvent("cursorLeave"));
        }}
        onClick={() => {
          soundFx.playClick();
          onSelect(item);
        }}
        className="relative w-full h-full bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-8 hover:border-red-600/60 transition-colors duration-500 cursor-none overflow-hidden flex flex-col justify-between"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          ref={glowRef}
          className="absolute top-0 left-0 w-[240px] h-[240px] bg-red-600/25 rounded-full blur-[70px] pointer-events-none opacity-0"
          style={{ transform: 'translateZ(0)' }}
        />

        <div style={{ transform: 'translateZ(40px)' }} className="pointer-events-none flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full">{item.id}</span>
              <span className="text-xs font-mono text-red-500 uppercase tracking-wider">{item.category}</span>
            </div>
            <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-red-500 transition-colors leading-tight">{item.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">{item.description}</p>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map((tag, idx) => (
                <span key={idx} className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800/60 px-3 py-1 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest font-semibold pt-4 border-t border-zinc-900">
              <span>EXPLORE SPECIFICATIONS</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// FOOTER & KINETIC MARQUEE SECTION
// ==========================================
const Footer = () => {
  const footerRef = useRef(null);

  useGSAP(() => {
    gsap.to(".marquee-track", {
      xPercent: -50,
      repeat: -1,
      duration: 22,
      ease: "linear",
    });
  }, { scope: footerRef });

  const links = [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/kshitij-shinde-3b02622b5' },
    { label: 'GitHub', url: 'https://github.com/kshitijshinde22-hue' },
    { label: 'Email', url: 'mailto:kshitijshinde12321@gmail.com' },
    { label: 'Instagram', url: 'https://instagram.com/kshitij_3332' }
  ];

  return (
    <footer ref={footerRef} id="contact" className="relative w-full bg-black border-t border-zinc-900 overflow-hidden z-40 pb-10">
      <div className="w-full py-5 border-b border-zinc-900 bg-red-950/20 flex whitespace-nowrap overflow-hidden">
        <div className="marquee-track flex gap-12 items-center text-red-600/80 font-mono text-xl tracking-widest uppercase w-max">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center shrink-0">
              <span>// KSHITIJ SHINDE</span>
              <span>// FULL STACK ARCHITECT</span>
              <span>// JAVA & MERN EXPERT</span>
              <span>// TOKYO MANJI CREW</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl pt-32 pb-16 flex flex-col items-center text-center">
        <h2 className="text-zinc-500 font-mono tracking-[0.3em] uppercase mb-6 text-xs md:text-sm">Initiate Protocol</h2>
        <h1
          className="text-[14vw] md:text-[9vw] font-black uppercase leading-none text-white hover:text-red-600 transition-colors duration-700 cursor-none"
          onMouseEnter={() => {
            soundFx.playHover();
            window.dispatchEvent(new CustomEvent("cursorHover", { detail: "CONNECT" }));
          }}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
          onClick={() => {
            soundFx.playClick();
            window.location.href = "mailto:kshitijshinde12321@gmail.com";
          }}
        >
          LET'S BUILD.
        </h1>

        <div className="flex flex-wrap gap-8 md:gap-16 mt-20 border-t border-zinc-900 pt-10 w-full justify-center">
          {links.map((link) => (
            <button
              key={link.label}
              className="text-zinc-400 hover:text-white font-mono text-sm tracking-widest uppercase transition-colors cursor-none bg-transparent border-none p-0"
              onMouseEnter={() => {
                soundFx.playHover();
                window.dispatchEvent(new CustomEvent("cursorHover", { detail: "LINK" }));
              }}
              onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
              onClick={() => {
                soundFx.playClick();
                if (link.url.startsWith('mailto:')) {
                  window.location.href = link.url;
                } else {
                  window.open(link.url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [loading, setLoading] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);

  const containerRef = useRef(null);
  const preloaderRef = useRef(null);
  const heroSectionRef = useRef(null);
  const characterRef = useRef(null);
  const heroTextRef = useRef(null);
  const horizontalSectionRef = useRef(null);
  const horizontalTrackRef = useRef(null);
  const lenisInstanceRef = useRef(null);

  // Global Ctrl + K / Cmd + K Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToSection = (id) => {
    const elem = document.getElementById(id);
    if (elem) {
      if (lenisInstanceRef.current) {
        lenisInstanceRef.current.scrollTo(elem);
      } else {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const words = [
    "नमस्ते",
    "नमस्कार",
    "Bonjour",
    "Hola",
    "Guten Tag",
    "やあ",
    "Ola",
    "Ciao",
    "आपका स्वागत है",
    "Welcome"
  ];

  const projects = [
    {
      id: "01",
      title: "Healthcare ERP & Dynamic Booking Engine",
      category: "ENTERPRISE HEALTHCARE SaaS",
      tags: ["Python", "Django", "MySQL", "AJAX", "JavaScript"],
      description: "Architected a multi-role clinical management system featuring an AJAX-driven SPA booking engine, real-time conflict-resolution scheduling, and secure RBAC with a compliance-focused MySQL backend.",
      details: "Engineered multi-tier RBAC (Patient, Doctor, Receptionist, Admin) with strict session validation. Built dynamic AJAX scheduling engine (/api/get-slots/) with real-time MySQL conflict prevention, timezone serialization, and SET_NULL database integrity constraints for historical patient invoices.",
      github: "https://github.com/kshitijshinde22-hue/dr-pakhare-clinic"
    },
    {
      id: "02",
      title: "Tokyo Manji 3D Cyberpunk Portfolio",
      category: "FRONTEND & UI ARCHITECTURE",
      tags: ["React", "GSAP", "Tailwind", "Lenis", "Web Audio"],
      description: "A high-performance cinematic developer portfolio built with React 19, GSAP ScrollTrigger pinned horizontal timelines, Lenis inertia scrolling, and synthetic Web Audio API sound synthesis.",
      details: "Orchestrated 60fps smooth scrolling with Lenis and GSAP ScrollTrigger. Engineered context-aware dynamic cursor followers, 3D card tilt physics, CRT scanline HUD overlays, and zero-asset Web Audio API synthesizers.",
      github: "https://github.com/kshitijshinde22-hue"
    },
    {
      id: "03",
      title: "High-Throughput Banking & Transaction Engine",
      category: "BACKEND & FINTECH SYSTEMS",
      tags: ["Java", "Spring Boot", "MySQL", "JPA/Hibernate", "REST APIs"],
      description: "Engineered a low-latency financial transaction engine featuring ACID-compliant fund transfers, database row-locking, and modular RESTful microservice architecture.",
      details: "Implemented @Transactional isolation levels to prevent race conditions during high-volume concurrent wallet transfers. Integrated connection pooling, modular service-repository architecture, and comprehensive exception handling.",
      github: "https://github.com/kshitijshinde22-hue"
    },
    {
      id: "04",
      title: "Real-Time Task & Inventory Management System",
      category: "ENTERPRISE MANAGEMENT SaaS",
      tags: ["Java", "Spring Boot", "Docker", "JWT", "MySQL"],
      description: "Containerized full-stack workflow engine with JWT role-based security, low-stock threshold triggers, and real-time order status pipelines.",
      details: "Built modular REST endpoints secured by stateless JWT authentication. Configured Docker multi-stage container deployment pipelines and optimized MySQL query indexing for inventory ledger reporting.",
      github: "https://github.com/kshitijshinde22-hue"
    },
  ];

  const skills = [
    { name: 'Core Java', level: 95 },
    { name: 'React & MERN', level: 92 },
    { name: 'Python / Django', level: 88 },
    { name: 'Docker & DevOps', level: 82 },
    { name: 'MySQL & Database', level: 90 },
    { name: 'GSAP & Motion UI', level: 86 }
  ];

  // 1. Initialize Lenis Smooth Scroll (Synced to GSAP Ticker for zero stutter)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisInstanceRef.current = lenis;

    // Direct synchronization between Lenis and ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  // 2. Preloader Text Cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => {
        if (prev < words.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // 4. GSAP Master Preloader & Entrance Animations
  useGSAP(() => {
    if (wordIndex === words.length - 1) {
      const timer = setTimeout(() => {
        const tl = gsap.timeline({ onComplete: () => setLoading(false) });

        tl.to(preloaderRef.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
          .fromTo(heroTextRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.4")
          .fromTo(characterRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }, "-=0.8");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, { dependencies: [wordIndex], scope: containerRef });

  // 5. GSAP Scroll Animations & Character Floating Animation
  useGSAP(() => {
    if (!loading) {
      gsap.to(characterRef.current, {
        y: -10, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut"
      });

      if (horizontalSectionRef.current && horizontalTrackRef.current) {
        const track = horizontalTrackRef.current;
        const totalScroll = track.scrollWidth - window.innerWidth + 120;

        gsap.to(track, {
          x: -totalScroll,
          ease: "none",
          scrollTrigger: {
            trigger: horizontalSectionRef.current,
            pin: true,
            scrub: 1,
            end: () => `+=${totalScroll}`,
            invalidateOnRefresh: true,
          }
        });
      }

      gsap.fromTo(
        ".about-reveal",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: ".about-section", start: "top 75%" } }
      );

      gsap.fromTo(
        ".skill-meter-fill",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".about-section", start: "top 60%" } }
      );
    }
  }, { dependencies: [loading], scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full bg-black text-white overflow-hidden font-sans select-none cursor-none">
      <CustomCursor />

      {/* HACKER COMMAND PALETTE (CTRL + K) */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        scrollTo={scrollToSection}
        lenisRef={lenisInstanceRef}
      />

      {/* FIXED TOP NAVBAR */}
      <Navbar lenisRef={lenisInstanceRef} onOpenCmd={() => setCmdOpen(true)} />

      {/* PRELOADER */}
      <div ref={preloaderRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden cursor-none">
        <div
          className="absolute w-[400px] h-[400px] rounded-full pointer-events-none animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.25) 0%, transparent 70%)' }}
        />
        <h1 className="relative z-10 text-4xl md:text-6xl font-normal tracking-widest uppercase text-zinc-200 drop-shadow-[0_0_15px_rgba(228,228,231,0.2)]">
          {words[wordIndex]}
        </h1>
      </div>

      {/* ========================================= */}
      {/* SCENE 1: REFINED HERO SECTION             */}
      {/* ========================================= */}
      <section ref={heroSectionRef} className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden pt-16">
        {/* Ambient Volumetric Red Light Gradients (Fast GPU 0% overhead) */}
        <div
          className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.2) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-10 -right-20 w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)' }}
        />

        {/* CRIMSON CYBER PARTICLES BACKGROUND CANVAS */}
        <ParticleCanvas />

        {/* Kanji Streetwear Vertical Badges */}
        <div className="absolute left-6 md:left-12 top-1/3 z-10 hidden md:flex flex-col items-center gap-3 pointer-events-none">
          <span className="font-mono text-[10px] text-red-600 tracking-widest uppercase writing-vertical border-l border-red-900/40 pl-2">
            東京卍會 // TOKYO MANJI
          </span>
        </div>
        <div className="absolute right-6 md:right-12 top-1/3 z-10 hidden md:flex flex-col items-center gap-3 pointer-events-none">
          <span className="font-mono text-[10px] text-zinc-600 tracking-widest uppercase writing-vertical border-r border-zinc-800 pr-2">
            初代総長 // FIRST GEN
          </span>
        </div>

        {/* UNIFIED HERO TYPOGRAPHY: CLEAN BATTLE DISPLAY */}
        <div ref={heroTextRef} className="absolute z-10 inset-x-0 flex flex-col items-center justify-center pointer-events-none text-center -translate-y-24 will-change-transform">
          {/* Main Display Title with Forward Action Italic Skew & Increased Height/Width */}
          <div className="relative origin-center transform -skew-x-12 scale-y-125 scale-x-105 my-3">
            <h1 className="text-[15vw] md:text-[16vw] lg:text-[17vw] font-black tracking-[0.14em] md:tracking-[0.16em] uppercase leading-none manga-battle-title select-none pl-[0.14em] md:pl-[0.16em]">
              KSHITIJ
            </h1>
            <h1 className="absolute inset-0 text-[15vw] md:text-[16vw] lg:text-[17vw] font-black tracking-[0.14em] md:tracking-[0.16em] uppercase leading-none manga-stroke-shadow opacity-50 select-none pl-[0.14em] md:pl-[0.16em] pointer-events-none mix-blend-screen">
              KSHITIJ
            </h1>
          </div>
        </div>

        {/* Mikey Character Image in Center */}
        <img
          ref={characterRef}
          src="/mikey-character.png"
          alt="Mikey"
          className="absolute bottom-0 z-20 h-[78vh] md:h-[90vh] object-contain will-change-transform drop-shadow-2xl"
        />

        {/* Corner HUD Telemetry Badges (Unobstructed by character) */}
        <div className="absolute bottom-10 left-6 md:left-12 z-30 hidden sm:flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] text-zinc-400 bg-zinc-950/80 border border-zinc-800/80 px-4 py-2 rounded-full backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-white font-bold">FULL STACK ARCHITECT</span>
          <span className="text-zinc-600">//</span>
          <span className="text-red-500">JAVA & MERN</span>
        </div>

        <div className="absolute bottom-10 right-6 md:right-12 z-30 hidden sm:flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] text-zinc-400 bg-zinc-950/80 border border-zinc-800/80 px-4 py-2 rounded-full backdrop-blur-md">
          <span className="text-red-500">卍</span>
          <span className="text-white font-bold">TOKYO MANJI CREW</span>
          <span className="text-zinc-600">//</span>
          <span>EST. 2026</span>
        </div>

        {/* Bottom Ambient Vignette Fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-30 pointer-events-none" />
      </section>

      {/* SCENE 2: PINNED HORIZONTAL GALLERY */}
      <section ref={horizontalSectionRef} id="projects" className="projects-section relative w-full h-screen bg-black z-40 border-t border-zinc-900 overflow-hidden flex flex-col justify-center">
        <div className="container mx-auto px-6 max-w-6xl mb-8 shrink-0">
          <p className="text-red-600 font-mono tracking-widest uppercase mb-2">// SELECTED WORKS (PINNED SCROLL)</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase">Featured Projects</h2>
        </div>

        <div className="w-full overflow-hidden pl-6 md:pl-24">
          <div ref={horizontalTrackRef} className="flex gap-8 items-center w-max pr-24">
            {projects.map((item) => (
              <TiltCard key={item.id} item={item} onSelect={(proj) => setSelectedProject(proj)} />
            ))}
          </div>
        </div>
      </section>

      {/* SCENE 4: ABOUT & EXPERTISE */}
      <section id="about" className="about-section relative w-full min-h-screen bg-black flex items-center py-24 z-40 border-t border-zinc-900 overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <p className="about-reveal text-red-600 font-mono tracking-widest uppercase mb-4">// THE ARCHITECT</p>
              <h2 className="about-reveal text-5xl md:text-7xl font-black uppercase mb-8 leading-none">
                Systematic.<br />Creative.<br />Relentless.
              </h2>
              <p className="about-reveal text-zinc-400 text-lg leading-relaxed mb-6">
                As a software developer stepping into the industry, I specialize in bridging the gap between heavy backend logic and sleek frontend execution. Whether I am structuring high-speed core Java processing, designing scalable database models with MySQL, or deploying modern web architecture via Docker, I build to last.
              </p>
              <p className="about-reveal text-zinc-400 text-lg leading-relaxed">
                Beyond the terminal, I am dedicated to continuous growth through platforms like LinkedIn Learning, and I strongly believe in sharing knowledge. I step into the role of an instructor, actively leading hands-on educational workshops to teach kids the fundamentals of technology and inspire the next generation of builders.
              </p>
            </div>

            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill, i) => (
                  <div
                    key={i}
                    className="about-reveal bg-zinc-950 border border-zinc-800/80 p-6 rounded-2xl hover:border-red-600/50 hover:bg-zinc-900/50 transition-colors group cursor-none"
                    onMouseEnter={() => {
                      soundFx.playHover();
                      window.dispatchEvent(new CustomEvent("cursorHover", { detail: `${skill.level}%` }));
                    }}
                    onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-red-600/60 font-mono text-xs block group-hover:text-red-500">0{i + 1}</span>
                      <span className="text-zinc-500 font-mono text-xs">{skill.level}%</span>
                    </div>
                    <h4 className="text-white font-bold text-lg mb-3">{skill.name}</h4>

                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="skill-meter-fill h-full bg-gradient-to-r from-red-800 to-red-600 origin-left rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER & MARQUEE */}
      <Footer />

      {/* PROJECT MODAL OVERLAY */}
      {selectedProject && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-red-600/40 rounded-3xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <button
              onClick={() => {
                soundFx.playClick();
                setSelectedProject(null);
              }}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white font-mono text-sm border border-zinc-800 px-3 py-1 rounded-full cursor-none"
              onMouseEnter={() => soundFx.playHover()}
            >
              [ ESC / CLOSE ]
            </button>

            <span className="text-xs font-mono text-red-500 uppercase tracking-widest mb-2 block">{selectedProject.category}</span>
            <h3 className="text-3xl font-black text-white mb-4 uppercase">{selectedProject.title}</h3>
            <p className="text-zinc-300 leading-relaxed mb-6">{selectedProject.description}</p>
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 mb-6 font-mono text-xs text-zinc-400 leading-relaxed">
              <span className="text-red-500 font-bold block mb-1">// TECHNICAL ARCHITECTURE:</span>
              {selectedProject.details}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {selectedProject.tags.map((tag, i) => (
                <span key={i} className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {selectedProject.github && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    window.open(selectedProject.github, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 font-mono text-xs font-bold tracking-widest text-center text-white uppercase rounded-xl transition-colors cursor-none"
                  onMouseEnter={() => soundFx.playHover()}
                >
                  [ VIEW ON GITHUB ↗ ]
                </button>
              )}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSelectedProject(null);
                }}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 font-mono text-xs font-bold tracking-widest text-white uppercase rounded-xl transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-none"
                onMouseEnter={() => soundFx.playHover()}
              >
                RETURN TO GALLERY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

