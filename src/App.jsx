import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { soundFx } from './soundFx';
import GravityStack from './GravityStack';
import './App.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ==========================================
// CRIMSON CYBER PARTICLE CONFIGURATION
// (Tweak these numbers anytime to adjust particle looks!)
// ==========================================
const PARTICLE_CONFIG = {
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

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    }, { threshold: 0.05 });
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const render = () => {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }
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
      if (canvas.parentElement) observer.unobserve(canvas.parentElement);
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
      <span>{time || '00:00:00'} IST</span>
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
        <span className={`text-[9px] font-mono tracking-wider text-white text-center leading-tight px-1 block transition-opacity duration-150 ${hoverText ? 'opacity-100' : 'opacity-0'}`}>
          {hoverText}
        </span>
      </div>
    </>
  );
};

// ==========================================
// HACKER COMMAND PALETTE (Ctrl + K)
// ==========================================
const CommandPalette = ({ isOpen, onClose, scrollTo, audioActive, onToggleAudio }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'projects',
      label: 'Go to Featured Projects',
      category: 'NAVIGATION',
      icon: '📌',
      action: () => scrollTo('projects')
    },
    {
      id: 'manifesto',
      label: 'Engineering Profile & Core',
      category: 'NAVIGATION',
      icon: '📌',
      action: () => scrollTo('manifesto')
    },
    {
      id: 'stack',
      label: 'Interactive Physics Stack',
      category: 'NAVIGATION',
      icon: '📌',
      action: () => scrollTo('stack')
    },
    {
      id: 'about',
      label: 'Capabilities & Scope (Services)',
      category: 'NAVIGATION',
      icon: '📌',
      action: () => scrollTo('about')
    },
    {
      id: 'contact',
      label: 'Transmit Protocol (Contact)',
      category: 'NAVIGATION',
      icon: '📌',
      action: () => scrollTo('contact')
    },
    {
      id: 'sound',
      label: audioActive ? 'Mute Synthetic Audio FX' : 'Enable Synthetic Audio FX',
      category: 'SYSTEM',
      icon: '🔊',
      action: () => {
        if (onToggleAudio) onToggleAudio();
        else soundFx.toggleSound();
      }
    },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase()) ||
    c.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundFx.playClick();
          handleClose();
        }
      }}
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[130] flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-xl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-zinc-950 border border-red-600/50 rounded-2xl p-4 shadow-[0_0_60px_rgba(220,38,38,0.25)] overflow-hidden"
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 px-2">
          <span className="text-red-500 font-mono text-sm">❯</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or navigate (e.g. projects, stack, audio)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                soundFx.playClick();
                handleClose();
              }
            }}
            className="w-full bg-transparent text-white font-mono text-sm placeholder-zinc-500 focus:outline-none cursor-none"
          />
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              handleClose();
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="text-zinc-400 hover:text-white font-mono text-[10px] border border-zinc-800 hover:border-red-600/60 px-2 py-0.5 rounded transition-all cursor-none bg-zinc-900/60 hover:bg-zinc-800 shrink-0"
          >
            [ ESC ]
          </button>
        </div>

        {/* Command Results - Exactly 6 options, perfectly fitting with NO scrollbar */}
        <div className="mt-3 flex flex-col gap-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  item.action();
                  handleClose();
                }}
                onMouseEnter={() => soundFx.playHover()}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-950/30 border border-transparent hover:border-red-600/40 text-left transition-all cursor-none group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{item.icon}</span>
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
const Navbar = ({ lenisRef, onOpenCmd, audioActive, onToggleAudio }) => {
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
        className="flex items-center gap-3 cursor-none group"
        onMouseEnter={() => {
          soundFx.playHover();
          window.dispatchEvent(new CustomEvent("cursorHover", { detail: "CODE" }));
        }}
        onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
        <div className="flex items-center">
          <span className="font-sans text-sm tracking-[0.2em] uppercase text-white font-black">
            KSHITIJ
          </span>
          <span className="text-red-600/60 font-light px-2 select-none text-xs">|</span>
          <span className="font-mono text-xs tracking-[0.16em] uppercase text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">
            WEB DESIGN & CODE
          </span>
        </div>
      </div>

      {/* Nav Anchors — Mathematically Centered in Screen Viewport */}
      <nav className="hidden md:flex items-center gap-8 lg:gap-10 font-sans text-[11px] tracking-[0.15em] text-zinc-400 uppercase font-medium absolute left-1/2 -translate-x-1/2 pointer-events-auto">
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
          onClick={() => scrollTo('contact')}
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
          className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 px-3 py-1.5 rounded-full transition-all cursor-none"
        >
          <span>⌘</span>
          <span>CTRL + K</span>
        </button>

        {/* Audio Sound FX Toggle with Equalizer Waveform */}
        <button
          onClick={onToggleAudio}
          onMouseEnter={() => {
            soundFx.playHover();
            window.dispatchEvent(new CustomEvent("cursorHover", { detail: "AUDIO" }));
          }}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
          className={`flex items-center gap-2 font-mono text-xs tracking-widest px-3 py-1.5 rounded-full border transition-all cursor-none ${audioActive
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
    { label: 'GitHub', url: 'https://github.com/kshitijshinde22-hue' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/kshitij-shinde-3b02622b5' },
    { label: 'Instagram', url: 'https://www.instagram.com/know_the_kshitij/' },
    { label: 'Email', url: 'mailto:kshitijshinde1870@gmail.com' }
  ];

  return (
    <footer ref={footerRef} id="contact" className="relative w-full bg-black border-t border-zinc-900 overflow-hidden z-40 pb-10">
      <div className="w-full py-5 border-b border-zinc-900 bg-red-950/20 flex whitespace-nowrap overflow-hidden">
        <div className="marquee-track flex gap-12 items-center text-red-600/80 font-mono text-xl tracking-widest uppercase w-max">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center shrink-0">
              <span>// KSHITIJ</span>
              <span>// FULL STACK ARCHITECT</span>
              <span>// PREMIUM CLIENT SERVICES</span>
              <span>// HIGH PERFORMANCE SYSTEMS</span>
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
            window.location.href = "mailto:kshitijshinde1870@gmail.com";
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
// THE ARCHITECT PROFILE SECTION (PHOTO + INTERACTIVE FULL STACK MANIFESTO)
// ==========================================
const ArchitectProfileSection = ({ loading }) => {
  const sectionRef = useRef(null);
  const photoCardRef = useRef(null);
  const photoGlowRef = useRef(null);

  useGSAP(() => {
    // Single continuous kinetic marquee track (infinite loop)
    gsap.to(".marquee-single-track", {
      xPercent: -50,
      repeat: -1,
      duration: 25,
      ease: "linear",
    });

    if (loading) return;

    // Left Photo 3D Entrance ScrollTrigger (Scrubbed with smooth entrance)
    gsap.fromTo(
      ".profile-photo-container",
      { x: -60, opacity: 0, scale: 0.94, rotateY: 15 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        rotateY: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".mini-about-section",
          start: "top 80%",
          end: "top 35%",
          scrub: 0.15,
        },
      }
    );

    // Right Content Progressive Stagger ScrollTrigger
    gsap.fromTo(
      ".profile-content-stagger",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".profile-right-content",
          start: "top 80%",
          end: "top 40%",
          scrub: 0.15,
        },
      }
    );

    // Interactive 8 Tech Nodes Staggered Entrance ScrollTrigger
    gsap.fromTo(
      ".tech-power-node",
      { y: 45, opacity: 0, scale: 0.94 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".tech-nodes-grid",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Tech Power Bar Animation (Smooth fill on scroll)
    gsap.fromTo(
      ".tech-power-bar",
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 0.85,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".tech-nodes-grid",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
  }, { dependencies: [loading], scope: sectionRef });

  // Photo 3D Mouse Tilt Handlers
  const handlePhotoMouseMove = (e) => {
    const card = photoCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1000,
    });

    if (photoGlowRef.current) {
      gsap.to(photoGlowRef.current, {
        x,
        y,
        opacity: 1,
        duration: 0.3,
      });
    }
  };

  const handlePhotoMouseLeave = () => {
    const card = photoCardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "power2.out",
    });
    if (photoGlowRef.current) {
      gsap.to(photoGlowRef.current, { opacity: 0, duration: 0.5 });
    }
  };

  const techArsenal = [
    {
      id: "java",
      name: "Core Java & Spring",
      icon: "☕",
      badge: "ENTERPRISE BACKEND",
      desc: "High-concurrency multithreading, REST microservices, low-latency execution.",
      border: "border-red-600/60",
      tag: "ENTERPRISE CORE",
      tagColor: "text-red-400 bg-red-950/60 border-red-800/50",
    },
    {
      id: "python",
      name: "Python & Django",
      icon: "🐍",
      badge: "DATA & API ENGINES",
      desc: "Robust backend services, dynamic AJAX engines, scalable SaaS architectures.",
      border: "border-amber-500/60",
      tag: "BACKEND & APIs",
      tagColor: "text-amber-400 bg-amber-950/60 border-amber-800/50",
    },
    {
      id: "react",
      name: "React 19 & GSAP",
      icon: "⚛️",
      badge: "60FPS MOTION UI",
      desc: "State-of-the-art interactive frontends, WebGL/Canvas, Lenis inertia scroll.",
      border: "border-cyan-500/60",
      tag: "60FPS MOTION UI",
      tagColor: "text-cyan-400 bg-cyan-950/60 border-cyan-800/50",
    },
    {
      id: "mysql",
      name: "MySQL Relational DB",
      icon: "🐬",
      badge: "ACID TRANSACTIONS",
      desc: "Row-level locking, complex indexing, bulletproof data consistency.",
      border: "border-blue-500/60",
      tag: "ACID TRANSACTIONS",
      tagColor: "text-blue-400 bg-blue-950/60 border-blue-800/50",
    },
    {
      id: "postgres",
      name: "PostgreSQL Engine",
      icon: "🐘",
      badge: "HIGH-VOLUME DATA",
      desc: "JSONB document querying, relational integrity, enterprise schema modeling.",
      border: "border-indigo-500/60",
      tag: "HIGH CONCURRENCY",
      tagColor: "text-indigo-400 bg-indigo-950/60 border-indigo-800/50",
    },
    {
      id: "git",
      name: "Git & GitHub",
      icon: "🐙",
      badge: "VCS & COLLABORATION",
      desc: "Trunk-based development, branch rebasing, PR code reviews, and GitHub Actions CI.",
      border: "border-orange-500/60",
      tag: "VCS & WORKFLOWS",
      tagColor: "text-orange-400 bg-orange-950/60 border-orange-800/50",
    },
    {
      id: "deploy",
      name: "Cloud & Deployment",
      icon: "☁️",
      badge: "CONTAINER & INFRA",
      desc: "Multi-stage Docker containerization, Nginx reverse proxy, and zero-downtime pipelines.",
      border: "border-purple-500/60",
      tag: "CI/CD & DOCKER",
      tagColor: "text-purple-400 bg-purple-950/60 border-purple-800/50",
    },
    {
      id: "client",
      name: "Client Systems & Portfolios",
      icon: "💼",
      badge: "PRODUCTION DELIVERY",
      desc: "Architecting, building, and deploying custom web systems and bespoke portfolio applications delivered to real clients.",
      border: "border-emerald-500/60",
      tag: "COMMERCIAL DELIVERY",
      tagColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/50",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="mini-about-section relative w-full bg-black py-28 md:py-36 px-6 border-t border-zinc-900 overflow-hidden z-30 min-h-screen flex flex-col justify-center"
    >
      {/* Background Volumetric Ambient Lights */}
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.08) 0%, transparent 70%)' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b08_1px,transparent_1px),linear-gradient(to_bottom,#18181b08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* SINGLE BACKGROUND KINETIC MARQUEE LINE */}
      <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 pointer-events-none opacity-15 overflow-hidden select-none -rotate-1 scale-105 z-0">
        <div className="w-full flex whitespace-nowrap overflow-hidden">
          <div className="marquee-single-track flex gap-12 items-center text-6xl md:text-8xl font-black uppercase text-red-600/70 tracking-wider">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12 items-center shrink-0">
                <span>✦ HIGH PERFORMANCE SYSTEMS</span>
                <span>✦ FULL STACK ARCHITECT</span>
                <span>✦ JAVA & PYTHON CONCURRENCY</span>
                <span>✦ REACT & 60FPS MOTION</span>
                <span>✦ MYSQL & POSTGRESQL</span>
                <span>✦ PREMIUM CLIENT SERVICES</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ========================================================= */}
          {/* LEFT COLUMN: INTERACTIVE CYBER PHOTO FRAME WITH ANIMATIONS */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 profile-photo-container lg:sticky lg:top-24 flex flex-col items-center">

            {/* Top Identity HUD Pill */}
            <div className="w-full flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span className="font-mono text-xs tracking-[0.25em] text-red-500 uppercase font-bold">
                  // ENGINEERING PROFILE
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE / AVAILABLE
              </span>
            </div>

            {/* 3D Holographic Photo Card */}
            <div
              ref={photoCardRef}
              onMouseMove={handlePhotoMouseMove}
              onMouseLeave={handlePhotoMouseLeave}
              onMouseEnter={() => {
                soundFx.playHover();
                window.dispatchEvent(new CustomEvent("cursorHover", { detail: "KSHITIJ" }));
              }}
              className="relative w-full aspect-[4/5] rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3.5 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden group cursor-none transition-colors duration-500 hover:border-red-600/60"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Radial Cursor Follower Glow inside Card */}
              <div
                ref={photoGlowRef}
                className="absolute top-0 left-0 w-64 h-64 bg-red-600/25 rounded-full blur-3xl pointer-events-none opacity-0 -translate-x-1/2 -translate-y-1/2"
              />

              {/* Holographic Red Laser Scanner Animation Overlay */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.9)] opacity-70 z-30 pointer-events-none animate-cyberScan" />

              {/* Main Portrait Image */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-900">
                <img
                  src="/kshitij-portrait.jpg"
                  alt="Kshitij - Software Architect"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out filter contrast-105"
                />

                {/* Gradient Vignette Shade Over Image Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                {/* Overlaid Badges on Photo */}
                <div className="absolute bottom-4 inset-x-4 z-20 flex flex-col gap-1.5 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                      <span className="text-red-500 text-sm">✦</span>
                      <span>KSHITIJ</span>
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-400 tracking-wider">
                    SOFTWARE ARCHITECT // CODE ✦ BUILD ✦ SCALE
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Status Bar Below Photo */}
            <div className="w-full mt-4 bg-zinc-950/70 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between font-mono text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚡</span>
                <span className="text-zinc-300">Independent Architect</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-600">//</span>
                <span className="text-red-500 font-bold">EST. 2026</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: STYLED FULL STACK PROFILE & NARRATIVE       */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 profile-right-content flex flex-col gap-8">

            {/* 1. Header & Dynamic Title (Aligned in level with Photo) */}
            <div className="profile-content-stagger">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <span className="font-mono text-xs tracking-[0.3em] uppercase text-red-500 font-bold">
                  // THE ARCHITECT MANIFESTO // SYSTEM CORE
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white tracking-tight leading-[1.12]">
                Architecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-amber-500">Resilient Full-Stack Systems</span> with Zero Compromise.
              </h2>
            </div>

            {/* 2. Stylized Modern Narrative with Cyber Accents */}
            <div className="profile-content-stagger space-y-4 text-zinc-300 text-sm md:text-base leading-relaxed bg-zinc-950/60 border border-zinc-850 p-6 md:p-8 rounded-3xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-widest bg-zinc-900/80 border-b border-l border-zinc-800 rounded-bl-2xl">
                CORE_NARRATIVE
              </div>

              <p className="font-normal text-zinc-300">
                I am a passionate <span className="text-white font-bold border-b border-red-600 pb-0.5">Full Stack Engineer</span> specializing in engineering high-concurrency enterprise backends and fusing them with smooth, 60fps GPU-accelerated web experiences.
              </p>

              <p className="text-zinc-400">
                My engineering stack spans robust backend services with <strong className="text-zinc-200">Java</strong> and <strong className="text-zinc-200">Python</strong>, dynamic interactive motion with <strong className="text-zinc-200">React</strong> & GSAP, and rock-solid relational database integrity using <strong className="text-zinc-200">MySQL</strong> and <strong className="text-zinc-200">PostgreSQL</strong>.
              </p>

              {/* "Eager to Learn" Special Spotlight Callout */}
              <div className="mt-4 p-4 rounded-2xl bg-red-950/20 border border-red-900/40 flex items-start gap-3">
                <span className="text-xl text-red-500 shrink-0 mt-0.5">⚡</span>
                <div>
                  <h4 className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
                    Insatiable Curiosity & Continuous Evolution
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Always eager to explore and master emerging technologies, microservice designs, AI workflows, and performance optimization techniques to push beyond ordinary boundaries.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Bottom Quick Telemetry Badges (Brought up into right column for vertical balance) */}
            <div className="profile-content-stagger flex flex-wrap gap-3 pt-2 font-mono text-xs">
              <div className="px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Zero-Lag 60fps UI</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                <span className="text-red-500">✦</span>
                <span>ACID Database Row-Locking</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                <span className="text-emerald-400">✦</span>
                <span>Always Eager to Learn</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* FULL-WIDTH COMMAND MATRIX: 8 HORIZONTAL PRODUCTION NODES  */}
        {/* ========================================================= */}
        <div className="mt-14 md:mt-18">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span className="font-mono text-xs text-red-500 tracking-[0.25em] uppercase font-bold">
                // COMMAND MATRIX // PRIMARY ARSENAL
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline-block">
              HOVER TO INSPECT CAPABILITIES · 8 PRODUCTION NODES
            </span>
          </div>

          <div className="tech-nodes-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techArsenal.map((tech) => (
              <div
                key={tech.id}
                onMouseEnter={() => {
                  soundFx.playHover();
                  window.dispatchEvent(new CustomEvent("cursorHover", { detail: tech.id.toUpperCase() }));
                }}
                onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
                className={`tech-power-node bg-zinc-950/80 border border-zinc-800/80 p-5 rounded-2xl hover:${tech.border} hover:bg-zinc-900/40 transition-all duration-300 group cursor-none relative overflow-hidden flex flex-col justify-between`}
              >
                <div>
                  <div className="w-full h-1 bg-zinc-900/80 rounded-full overflow-hidden mb-3">
                    <div className="tech-power-bar h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 rounded-full origin-left" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{tech.icon}</span>
                      <h4 className="text-white font-bold text-sm group-hover:text-red-400 transition-colors">
                        {tech.name}
                      </h4>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-2">
                    {tech.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-900/80 flex items-center justify-between">
                  <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                    CAPABILITY
                  </span>
                  <span className={`font-mono text-[9px] px-2.5 py-0.5 rounded-full border ${tech.tagColor}`}>
                    {tech.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
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
  const [audioActive, setAudioActive] = useState(false);

  const handleAudioToggle = () => {
    const newState = soundFx.toggleSound();
    setAudioActive(newState);
  };

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
      details: "Engineered multi-tier RBAC (Patient, Doctor, Receptionist, Admin) with strict session validation. Built dynamic AJAX scheduling engine (/api/get-slots/) with real-time MySQL conflict prevention, timezone serialization, and SET_NULL database integrity constraints for historical patient invoices."
    },
    {
      id: "02",
      title: "High-Performance 3D Cyberpunk Portfolio",
      category: "FRONTEND & UI ARCHITECTURE",
      tags: ["React", "GSAP", "Tailwind", "Lenis", "Web Audio"],
      description: "A high-performance cinematic developer portfolio built with React 19, GSAP ScrollTrigger pinned horizontal timelines, Lenis inertia scrolling, and synthetic Web Audio API sound synthesis.",
      details: "Orchestrated 60fps smooth scrolling with Lenis and GSAP ScrollTrigger. Engineered context-aware dynamic cursor followers, 3D card tilt physics, CRT scanline HUD overlays, and zero-asset Web Audio API synthesizers."
    },
    {
      id: "03",
      title: "High-Throughput Banking & Transaction Engine",
      category: "BACKEND & FINTECH SYSTEMS",
      tags: ["Java", "Spring Boot", "MySQL", "JPA/Hibernate", "REST APIs"],
      description: "Engineered a low-latency financial transaction engine featuring ACID-compliant fund transfers, database row-locking, and modular RESTful microservice architecture.",
      details: "Implemented @Transactional isolation levels to prevent race conditions during high-volume concurrent wallet transfers. Integrated connection pooling, modular service-repository architecture, and comprehensive exception handling."
    },
    {
      id: "04",
      title: "Real-Time Task & Inventory Management System",
      category: "ENTERPRISE MANAGEMENT SaaS",
      tags: ["Java", "Spring Boot", "Docker", "JWT", "MySQL"],
      description: "Containerized full-stack workflow engine with JWT role-based security, low-stock threshold triggers, and real-time order status pipelines.",
      details: "Built modular REST endpoints secured by stateless JWT authentication. Configured Docker multi-stage container deployment pipelines and optimized MySQL query indexing for inventory ledger reporting."
    },
  ];

  const services = [
    {
      num: "01",
      title: "Enterprise Backend Development",
      category: "CORE SYSTEMS",
      desc: "High-concurrency Java & Python microservices, thread-safe asynchronous workflows, and robust REST APIs built for scale.",
      border: "hover:border-red-600/60",
    },
    {
      num: "02",
      title: "Motion-Rich Web Frontends",
      category: "60FPS MOTION",
      desc: "Cutting-edge React 19 web applications with bespoke GSAP motion, WebGL shaders, and silky smooth GPU-accelerated interfaces.",
      border: "hover:border-cyan-500/60",
    },
    {
      num: "03",
      title: "Database Design & Optimization",
      category: "DATA INTEGRITY",
      desc: "Relational schema architecture, ACID row-locking, complex indexing, and high-volume PostgreSQL/MySQL query tuning.",
      border: "hover:border-blue-500/60",
    },
    {
      num: "04",
      title: "DevOps & Containerization",
      category: "INFRASTRUCTURE",
      desc: "Multi-stage Docker container packaging, Nginx reverse proxies, cloud staging, and automated CI/CD deployment pipelines.",
      border: "hover:border-purple-500/60",
    },
    {
      num: "05",
      title: "Performance & Security Audits",
      category: "OPTIMIZATION",
      desc: "Root-cause diagnostics, eliminating memory leaks, JWT session hardening, and tuning API latency below 100ms budgets.",
      border: "hover:border-amber-500/60",
    },
    {
      num: "06",
      title: "Custom Portfolios & Client Systems",
      category: "PRODUCTION DELIVERY",
      desc: "Turnkey design and development of bespoke portfolio websites and custom management systems built and deployed for real clients.",
      border: "hover:border-emerald-500/60",
    },
  ];

  // 1. Initialize Lenis Smooth Scroll (Synced to GSAP Ticker for zero stutter)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

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
    gsap.ticker.lagSmoothing(1000, 16);

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
  }, [words.length]);

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
            scrub: 0.2,
            end: () => `+=${totalScroll}`,
            invalidateOnRefresh: true,
          }
        });
      }

      // About Section: Narrative Stagger Reveal
      gsap.fromTo(
        ".about-reveal",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-section",
            start: "top 75%",
            toggleActions: "play none none reverse",
          }
        }
      );

      // About Section: 6 Service Cards Staggered Cascade
      gsap.fromTo(
        ".service-card-reveal",
        { y: 45, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".services-grid",
            start: "top 80%",
            toggleActions: "play none none reverse",
          }
        }
      );

      // Refresh ScrollTrigger to sync pin spacers and exact section offsets
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
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
        audioActive={audioActive}
        onToggleAudio={handleAudioToggle}
      />

      {/* FIXED TOP NAVBAR */}
      <Navbar
        lenisRef={lenisInstanceRef}
        onOpenCmd={() => setCmdOpen(true)}
        audioActive={audioActive}
        onToggleAudio={handleAudioToggle}
      />

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
      <section ref={heroSectionRef} className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
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

        {/* Streetwear Vertical Badges */}
        <div className="absolute left-6 md:left-12 top-1/3 z-10 hidden md:flex flex-col items-center gap-3 pointer-events-none">
          <span className="font-mono text-[10px] text-red-500 tracking-widest uppercase writing-vertical border-l border-red-900/50 pl-2">
            SYSTEM // ARCHITECTURE
          </span>
        </div>
        <div className="absolute right-6 md:right-12 top-1/3 z-10 hidden md:flex flex-col items-center gap-3 pointer-events-none">
          <span className="font-mono text-[10px] text-zinc-400 tracking-widest uppercase writing-vertical border-r border-zinc-800 pr-2">
            CORE // ENGINEERING
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

        {/* Subtle Backlight Rim Glow directly behind Character */}
        <div
          className="absolute bottom-10 z-15 w-[320px] md:w-[450px] h-[320px] md:h-[450px] rounded-full pointer-events-none opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(220, 38, 38, 0.4) 0%, transparent 70%)' }}
        />

        {/* Main Character Image in Center */}
        <img
          ref={characterRef}
          src="/kshitij-hero.png"
          alt="Kshitij Shinde"
          className="absolute bottom-0 z-20 h-[78vh] md:h-[90vh] object-contain will-change-transform hero-character-graded"
        />

        {/* Bottom Ambient Vignette Fade (Kept underneath HUD badges at z-25) */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-black via-black/80 to-transparent z-25 pointer-events-none" />

        {/* Corner HUD Telemetry Badges (Unboxed, Borderless, Dimmed ~25-30% Further for Subtle Atmospheric Telemetry) */}
        <div className="absolute bottom-10 left-6 md:left-12 z-40 hidden sm:flex items-center gap-2.5 font-mono text-[10px] tracking-[0.22em] select-none pointer-events-none opacity-75">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-zinc-400 font-normal">FULL STACK ARCHITECT</span>
          <span className="text-zinc-600">//</span>
          <span className="text-red-500/80 font-normal">JAVA & MERN</span>
        </div>

        <div className="absolute bottom-10 right-6 md:right-12 z-40 hidden sm:flex items-center gap-2.5 font-mono text-[10px] tracking-[0.22em] select-none pointer-events-none opacity-75">
          <span className="text-red-600/80 text-xs">✦</span>
          <span className="text-zinc-400 font-normal">CREATIVE WEB DESIGNER</span>
          <span className="text-zinc-600">//</span>
          <span className="text-zinc-500 font-normal">EST. 2026</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TRANSITION SECTION: THE ARCHITECT (PHOTO + FULL STACK PROFILE MANIFESTO) */}
      {/* ========================================================================= */}
      <ArchitectProfileSection loading={loading} />

      {/* SCENE 2: PINNED HORIZONTAL GALLERY */}
      <section ref={horizontalSectionRef} id="projects" className="projects-section relative w-full h-screen bg-black z-40 border-t border-zinc-900 overflow-hidden flex flex-col justify-center">
        <div className="container mx-auto px-6 max-w-6xl mb-8 shrink-0">
          <p className="text-red-600 font-mono tracking-widest uppercase mb-2">// SELECTED WORKS</p>
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

      {/* GRAVITY PHYSICS STACK (IN BETWEEN PROJECTS & ABOUT) */}
      <GravityStack
        onCollide={(v) => soundFx.playCollision?.(v)}
        onHover={() => soundFx.playHover()}
      />

      {/* SCENE 4: CAPABILITIES & SCOPE */}
      <section id="about" className="about-section relative w-full min-h-screen bg-black flex items-center py-24 z-40 border-t border-zinc-900 overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <div className="flex-1">
              <p className="about-reveal text-red-600 font-mono tracking-widest uppercase mb-4 text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                // CAPABILITIES & SCOPE
              </p>
              <h2 className="about-reveal text-5xl md:text-7xl font-black uppercase mb-8 leading-[1.05]">
                Systematic.<br />
                Resilient.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-amber-500">
                  Driven.
                </span>
              </h2>
              <p className="about-reveal text-zinc-300 text-base md:text-lg leading-relaxed mb-6 font-light">
                I partner with forward-thinking businesses and engineering teams to transform ambitious product ideas into production-ready, high-throughput digital systems. I approach every challenge through the lens of a systems architect — ensuring that the foundation beneath the surface is just as bulletproof as the visual interface on top.
              </p>
              <p className="about-reveal text-zinc-400 text-sm md:text-base leading-relaxed mb-8">
                Whether designing thread-safe backend architectures, eliminating database bottlenecks, or choreographing 60fps GPU interactions, my standard is absolute precision with zero technical compromise.
              </p>

              <div className="about-reveal flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850">
                <span className="text-2xl text-red-500">✦</span>
                <div>
                  <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-0.5">
                    End-to-End Execution Standard
                  </h4>
                  <p className="text-xs text-zinc-400">
                    From initial schema architecture to cloud deployment and ongoing optimization.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full lg:pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 services-grid">
                {services.map((service) => (
                  <div
                    key={service.num}
                    className={`service-card-reveal bg-zinc-950/90 border border-zinc-850/80 p-6 rounded-2xl ${service.border} hover:bg-zinc-900/50 transition-all duration-300 group cursor-none flex flex-col justify-between`}
                    onMouseEnter={() => {
                      soundFx.playHover();
                      window.dispatchEvent(new CustomEvent("cursorHover", { detail: service.category }));
                    }}
                    onMouseLeave={() => window.dispatchEvent(new CustomEvent("cursorLeave"))}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-red-500 font-mono text-xs font-bold group-hover:text-red-400 transition-colors">
                          {service.num}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest border border-zinc-800/80 px-2.5 py-0.5 rounded-full">
                          {service.category}
                        </span>
                      </div>
                      <h4 className="text-white font-bold text-base md:text-lg mb-2 group-hover:text-red-400 transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {service.desc}
                      </p>
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

