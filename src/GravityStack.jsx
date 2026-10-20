import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

const { Engine, Bodies, Body, Composite, Constraint, Query, Events } = Matter;

/* ═══════════════════════ SKILL REGISTRY ════════════════════════ */
const CATS = {
  frontend: { label: 'FRONTEND',  color: '#06b6d4' },
  backend:  { label: 'BACKEND',   color: '#f59e0b' },
  data:     { label: 'DATABASES', color: '#3b82f6' },
  ops:      { label: 'DEVOPS',    color: '#10b981' },
};

const BANK   = 'High-Throughput Banking & Transaction Engine';
const HEALTH = 'Healthcare ERP & Booking Engine';
const FOLIO  = '3D Cyberpunk Portfolio';
const INV    = 'Real-Time Task & Inventory SaaS';

const SKILLS = [
  { name: 'Core Java',       icon: '☕',  cat: 'backend',  proof: BANK   },
  { name: 'Spring Boot',     icon: '🍃',  cat: 'backend',  proof: BANK   },
  { name: 'Python',          icon: '🐍',  cat: 'backend',  proof: HEALTH },
  { name: 'Django',          icon: '🎸',  cat: 'backend',  proof: HEALTH },
  { name: 'REST APIs',       icon: '🔌',  cat: 'backend',  proof: 'Banking & Inventory Systems' },
  { name: 'C',               icon: '⚙️',  cat: 'backend'                  },
  { name: 'React 19',        icon: '⚛️',  cat: 'frontend', proof: FOLIO  },
  { name: 'JavaScript ES6+', icon: '🟨',  cat: 'frontend', proof: FOLIO  },
  { name: 'HTML5',           icon: '🌐',  cat: 'frontend', proof: FOLIO  },
  { name: 'CSS3',            icon: '🎨',  cat: 'frontend', proof: FOLIO  },
  { name: 'Tailwind CSS',    icon: '🌊',  cat: 'frontend', proof: FOLIO  },
  { name: 'Bootstrap',       icon: '🅱️',  cat: 'frontend'                 },
  { name: 'GSAP & Motion',   icon: '🎞️',  cat: 'frontend', proof: FOLIO  },
  { name: 'Matter.js',       icon: '🧲',  cat: 'frontend', proof: 'This Interactive Gravity Engine' },
  { name: 'MySQL',           icon: '🐬',  cat: 'data',     proof: 'Healthcare ERP & Banking Engine' },
  { name: 'PostgreSQL',      icon: '🐘',  cat: 'data',     proof: 'Enterprise Architecture' },
  { name: 'Docker',          icon: '🐳',  cat: 'ops',      proof: INV    },
  { name: 'Git & GitHub',    icon: '🐙',  cat: 'ops',      proof: 'All Production Repositories' },
  { name: 'Vercel',          icon: '▲',   cat: 'ops',      proof: FOLIO  },
  { name: 'Linux / Shell',   icon: '🐧',  cat: 'ops'                      },
];

/* ═════════════════════ PHYSICS TUNING ═══════════════════════ */
const CFG = {
  repelR:  140,
  repel:   0.0032,
  hole:    0.003,
  swirl:   0.0013,
  burstR:  440,
  burst:   18,
  scroll:  0.000035,
  stagger: 75,
};

const STEP   = 1000 / 60;
const clamp  = (v, a, b) => Math.min(b, Math.max(a, v));
const rand   = (a, b) => a + Math.random() * (b - a);

/* hex '#rrggbb' → 'r,g,b' */
const hexRGB = (hex) => {
  const h = hex.replace('#', '');
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
};

/* ═══════════════════ AMBIENT EMBER PARTICLES ════════════════ */
class EmberSystem {
  constructor(W, H) {
    this.W = W; this.H = H;
    this.p = Array.from({ length: 32 }, () => this._mk(true));
  }
  _mk(init = false) {
    const cat  = Object.values(CATS)[Math.floor(Math.random() * 4)];
    return {
      x: rand(0, this.W),
      y: init ? rand(0, this.H) : this.H + 5,
      vx: rand(-0.15, 0.15),
      vy: rand(-0.38, -0.1),
      r:  rand(1, 2.5),
      a:  rand(0.06, 0.32),
      rgb: hexRGB(cat.color),
    };
  }
  step() {
    for (const p of this.p) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) Object.assign(p, this._mk());
      if (p.x < -10) p.x = this.W + 5;
      if (p.x > this.W + 10) p.x = -5;
    }
  }
  draw(ctx) {
    for (const p of this.p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 1.9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.rgb},${(p.a * 0.2).toFixed(3)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.rgb},${p.a.toFixed(3)})`;
      ctx.fill();
    }
  }
}

/* ══════════════════ MATRIX DATA STREAM ══════════════════════ */
const CHARS = '01アイウエオカキクケコサシスセソタチツナニネノハヒフヘ';
class MatrixStream {
  constructor(W, H) {
    this.resize(W, H);
  }
  resize(W, H) {
    this.W = W; this.H = H;
    const n = Math.floor(W / 32);
    this.cols = Array.from({ length: n }, (_, i) => ({
      x:    i * 32 + 16,
      y:    rand(-H, 0),
      spd:  rand(0.5, 1.2),
      txt:  Array.from({ length: 16 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
      tick: 0,
      int:  Math.floor(rand(5, 12)),
      a:    rand(0.025, 0.06),
    }));
  }
  step() {
    for (const c of this.cols) {
      c.y += c.spd;
      if (++c.tick >= c.int) {
        c.tick = 0;
        c.txt[Math.floor(Math.random() * c.txt.length)] =
          CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      if (c.y > this.H + 280) c.y = rand(-160, -30);
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.font = '11px monospace';
    ctx.textBaseline = 'top';
    for (const c of this.cols) {
      const L = c.txt.length;
      for (let j = 0; j < L; j++) {
        const fy = c.y - j * 18;
        if (fy < -20 || fy > this.H + 20) continue;
        const fade = (1 - j / L) * c.a;
        ctx.fillStyle = j === 0
          ? `rgba(255,255,255,${(fade * 2).toFixed(3)})`
          : `rgba(220,38,38,${fade.toFixed(3)})`;
        ctx.fillText(c.txt[j], c.x, fy);
      }
    }
    ctx.restore();
  }
}

/* ═════════════════ SCANLINE SWEEP ═══════════════════════════ */
class ScanSweep {
  constructor() { this.y = 0; }
  draw(ctx, W, H, now) {
    this.y = (now * 0.055) % H;
    ctx.save();
    const g = ctx.createLinearGradient(0, this.y - 10, 0, this.y + 10);
    g.addColorStop(0,   'rgba(220,38,38,0)');
    g.addColorStop(0.5, 'rgba(220,38,38,0.065)');
    g.addColorStop(1,   'rgba(220,38,38,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, this.y - 10, W, 20);
    ctx.fillStyle = 'rgba(239,68,68,0.18)';
    ctx.fillRect(0, this.y, W, 1);
    ctx.restore();
  }
}

/* ══════════════════════ MAIN COMPONENT ══════════════════════ */
export default function GravityStack({ onCollide, onHover }) {
  const boxRef    = useRef(null);
  const canvasRef = useRef(null);
  const chipRefs  = useRef([]);
  const tipRef    = useRef(null);
  const hudRef    = useRef(null);
  const api       = useRef({});
  const cb        = useRef({});

  const [tip,       setTip]       = useState(null);
  const [tilt,      setTilt]      = useState(false);
  const [phase,     setPhase]     = useState('IDLE');
  const [chipCount, setChipCount] = useState(0);

  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [coarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );

  useEffect(() => { cb.current = { onCollide, onHover }; });

  useEffect(() => {
    if (reduced) return;

    const box    = boxRef.current;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const els    = chipRefs.current;

    /* ── Matter.js setup ── */
    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    const world  = engine.world;

    /* ── runtime state ── */
    let W = 0, H = 0;
    let walls     = [];
    let ceilingOn = false;
    let chips     = [];
    const byId    = new Map();
    const timers  = new Set();

    let raf = 0, last = 0, acc = 0, frame = 0;
    let visible = false, dropped = false, dead = false;
    let lastSY = window.scrollY, sv = 0, lastSound = 0;
    let hovered = -1, mode = 'IDLE', cursorTxt = '';
    let tiltOn  = false;

    const ptr   = { x: 0, y: 0, in: false, down: false, hole: false };
    const grabC = { c: null };
    const g     = { x: 0, y: 1, tx: 0, ty: 1 };

    /* ── shockwave ring ── */
    const shock = { active: false, x: 0, y: 0, r: 0, maxR: 0, alpha: 0 };

    /* ── background systems (created after measure()) ── */
    let embers = null;
    let matrix = null;
    const scan = new ScanSweep();

    /* ── cursor bridge ── */
    const cursor = (t) => {
      if (t === cursorTxt) return;
      cursorTxt = t;
      window.dispatchEvent(new CustomEvent(t ? 'cursorHover' : 'cursorLeave', { detail: t }));
    };

    const setMode = (m) => {
      mode = m;
      setPhase(m);
    };

    /* ── walls ── */
    const buildWalls = () => {
      Composite.remove(world, walls);
      const T = 220;
      const o = { isStatic: true, friction: 0.35, restitution: 0.4, label: 'wall' };
      walls = [
        Bodies.rectangle(W / 2, H + T / 2,  W + T * 2, T, o),
        Bodies.rectangle(-T / 2, H / 2,      T, H * 4,  o),
        Bodies.rectangle(W + T / 2, H / 2,   T, H * 4,  o),
      ];
      if (ceilingOn) walls.push(Bodies.rectangle(W / 2, -T / 2, W + T * 2, T, o));
      Composite.add(world, walls);
    };

    const measure = () => {
      W = box.clientWidth;
      H = box.clientHeight;
      canvas.width  = W;
      canvas.height = H;
      if (embers) { embers.W = W; embers.H = H; }
      if (matrix) matrix.resize(W, H);
      chips.forEach((c) => {
        const w = c.el.offsetWidth, h = c.el.offsetHeight;
        if (Math.abs(w - c.w) > 2 || Math.abs(h - c.h) > 2) {
          Body.scale(c.body, w / c.w, h / c.h);
          c.w = w; c.h = h;
        }
        const nx = clamp(c.body.position.x, c.w / 2, W - c.w / 2);
        if (nx !== c.body.position.x)
          Body.setPosition(c.body, { x: nx, y: c.body.position.y });
      });
      buildWalls();
    };

    /* ═══════════════════════════════════════════════════════
       SPAWN  –  THE KEY FIX:
       Immediately apply the body's initial position as a CSS
       transform before making the element visible, so it never
       flashes at (0,0) / top-left.
    ═══════════════════════════════════════════════════════ */
    const spawn = (i) => {
      const el = els[i];
      if (!el || dead) return;
      const w = el.offsetWidth  || 100;
      const h = el.offsetHeight || 36;

      const startX = rand(w / 2 + 8, Math.max(w / 2 + 9, W - w / 2 - 8));
      const startY = -h - rand(20, 60);

      const body = Bodies.rectangle(startX, startY, w, h, {
        chamfer:    { radius: h * 0.46 },
        restitution: 0.46,
        friction:    0.22,
        frictionAir: 0.012,
        density:     0.0015,
        label:       `chip-${i}`,
      });
      const angle = rand(-0.6, 0.6);
      Body.setAngle(body, angle);
      Body.setVelocity(body, { x: rand(-2, 2), y: rand(1.5, 4) });
      Composite.add(world, body);

      /* ── apply initial transform immediately so the chip is
            positioned correctly the moment it becomes visible ── */
      el.style.transform = `translate3d(${startX - w / 2}px,${startY - h / 2}px,0) rotate(${angle}rad)`;

      const chip = { body, el, w, h, i, lx: startX, ly: startY, la: angle, hit: 0 };
      el.style.visibility = 'visible';

      chips.push(chip);
      byId.set(body.id, chip);
      setChipCount(chips.length);
    };

    /* ── burst shockwave ── */
    const burstShockwave = () => {
      chips.forEach(({ body: b }) => {
        const dx = b.position.x - ptr.x, dy = b.position.y - ptr.y;
        const d  = Math.hypot(dx, dy) || 1;
        const k  = Math.max(0, 1 - d / CFG.burstR) * CFG.burst;
        Body.setVelocity(b, {
          x: b.velocity.x + (dx / d) * k,
          y: b.velocity.y + (dy / d) * k,
        });
      });
      Object.assign(shock, { active: true, x: ptr.x, y: ptr.y, r: 0, maxR: CFG.burstR * 1.1, alpha: 0.9 });
    };

    const release = () => {
      if (grabC.c) { Composite.remove(world, grabC.c); grabC.c = null; }
      if (ptr.hole) { burstShockwave(); ptr.hole = false; }
      setMode(tiltOn ? 'TILT' : 'IDLE');
    };

    /* ── reset / drop all chips ── */
    const drop = () => {
      timers.forEach(clearTimeout); timers.clear();
      release();
      chips.forEach((c) => {
        Composite.remove(world, c.body);
        c.el.style.visibility = 'hidden';
        c.el.style.transform  = '';
        c.el.classList.remove('gs-hot', 'gs-hit');
      });
      chips = []; byId.clear();
      hovered = -1;
      setTip(null); setChipCount(0);
      ceilingOn = false;
      buildWalls();

      const order = SKILLS.map((_, i) => i).sort(() => Math.random() - 0.5);
      order.forEach((idx, n) =>
        timers.add(setTimeout(() => spawn(idx), n * CFG.stagger))
      );
      timers.add(setTimeout(() => {
        ceilingOn = true; buildWalls(); setMode('ACTIVE');
      }, order.length * CFG.stagger + 2400));
    };
    api.current.drop = drop;

    /* ── pointer helpers ── */
    const local = (cx, cy) => {
      const r = box.getBoundingClientRect();
      return { x: cx - r.left, y: cy - r.top };
    };
    const pick = (p) => {
      const hit = Query.point(chips.map(c => c.body), p)[0];
      return hit ? byId.get(hit.id) : null;
    };
    const setHover = (c) => {
      const idx = c ? c.i : -1;
      if (idx === hovered) return;
      if (hovered >= 0 && els[hovered]) els[hovered].classList.remove('gs-hot');
      hovered = idx;
      if (c) { c.el.classList.add('gs-hot'); setTip(SKILLS[idx]); cb.current.onHover?.(); }
      else setTip(null);
    };
    const grab = (c, p) => {
      const b = c.body;
      grabC.c = Constraint.create({
        pointA: { x: p.x, y: p.y },
        bodyB:  b,
        pointB: { x: p.x - b.position.x, y: p.y - b.position.y },
        stiffness: 0.2, damping: 0.15, length: 0,
      });
      Composite.add(world, grabC.c);
      setHover(c); setMode('GRAB'); cursor('GRAB');
    };

    /* ── mouse events ── */
    const onMove = (e) => {
      const p = local(e.clientX, e.clientY);
      ptr.x = p.x; ptr.y = p.y;
      ptr.in = p.x >= 0 && p.y >= 0 && p.x <= W && p.y <= H;
      if (grabC.c) { grabC.c.pointA.x = p.x; grabC.c.pointA.y = p.y; return; }
      if (ptr.hole) return;
      const c = ptr.in ? pick(p) : null;
      setHover(c);
      cursor(c ? 'GRAB' : '');
    };
    const onDown = (e) => {
      if (e.button !== 0) return;
      const p = local(e.clientX, e.clientY);
      ptr.x = p.x; ptr.y = p.y; ptr.down = true;
      const c = pick(p);
      if (c) grab(c, p);
      else { ptr.hole = true; setHover(null); setMode('SINGULARITY'); cursor('PULL'); }
    };
    const onUp = () => {
      if (!ptr.down) return;
      ptr.down = false; release(); cursor(hovered >= 0 ? 'GRAB' : '');
    };

    /* ── touch events ── */
    const onTS = (e) => {
      const t = e.touches[0];
      const p = local(t.clientX, t.clientY);
      const c = pick(p);
      if (c) { ptr.down = true; grab(c, p); }
    };
    const onTM = (e) => {
      if (!grabC.c) return;
      e.preventDefault();
      const t = e.touches[0];
      const p = local(t.clientX, t.clientY);
      grabC.c.pointA.x = p.x; grabC.c.pointA.y = p.y;
    };
    const onTE = (e) => {
      if (!ptr.down) return;
      if (e.cancelable) e.preventDefault();
      ptr.down = false; release(); setHover(null);
    };

    /* ── device tilt ── */
    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return;
      g.tx = clamp(e.gamma / 35, -1, 1);
      g.ty = clamp((e.beta - 10) / 35, -1, 1);
    };
    api.current.enableTilt = async () => {
      try {
        const D = window.DeviceOrientationEvent;
        if (D && typeof D.requestPermission === 'function') {
          if ((await D.requestPermission()) !== 'granted') return;
        }
        window.addEventListener('deviceorientation', onOrient);
        tiltOn = true; setTilt(true); setMode('TILT');
      } catch { /* denied */ }
    };

    /* ── collision flash + sound ── */
    Events.on(engine, 'collisionStart', (ev) => {
      const now = performance.now();
      for (const { bodyA: a, bodyB: b } of ev.pairs) {
        const rv = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
        if (rv < 2.8) continue;
        [a, b].forEach((x) => {
          const c = byId.get(x.id);
          if (c) { c.hit = now + 260; c.el.classList.add('gs-hit'); }
        });
        if (now - lastSound > 45) { lastSound = now; cb.current.onCollide?.(Math.min(1, rv / 16)); }
      }
    });

    /* ── physics step ── */
    const step = () => {
      g.x += (g.tx - g.x) * 0.08;
      g.y += (g.ty - g.y) * 0.08;
      engine.gravity.x = g.x;
      engine.gravity.y = g.y;

      const lift  = clamp(sv, -60, 60) * CFG.scroll;
      const repel = ptr.in && !ptr.hole && !grabC.c && !coarse;

      for (const { body: b } of chips) {
        const p = b.position;
        if (p.x < -100 || p.x > W + 100 || p.y > H + 100 || (ceilingOn && p.y < -100)) {
          Body.setPosition(b, { x: W / 2, y: H / 2 });
          Body.setVelocity(b, { x: 0, y: 0 });
          continue;
        }
        let fx = 0, fy = -lift * b.mass;
        const dx = ptr.x - p.x, dy = ptr.y - p.y;
        const d  = Math.hypot(dx, dy) || 1;
        if (ptr.hole) {
          const s = Math.min(1, 280 / d) * b.mass;
          fx += (dx / d) * CFG.hole  * s - (dy / d) * CFG.swirl * s;
          fy += (dy / d) * CFG.hole  * s + (dx / d) * CFG.swirl * s;
        } else if (repel && d < CFG.repelR) {
          const k = (1 - d / CFG.repelR) ** 2 * CFG.repel * b.mass;
          fx -= (dx / d) * k; fy -= (dy / d) * k;
        }
        Body.applyForce(b, p, { x: fx, y: fy });
      }
      Engine.update(engine, STEP);
    };

    /* ── canvas drawing ── */
    const draw = (now) => {
      ctx.clearRect(0, 0, W, H);

      /* background layers */
      if (matrix) { matrix.step(); matrix.draw(ctx); }
      if (embers) { embers.step(); embers.draw(ctx); }
      scan.draw(ctx, W, H, now);

      /* corner brackets */
      ctx.save();
      const L = 18, R = 8;
      const pulse = 0.4 + 0.4 * Math.sin(now / 700);
      ctx.strokeStyle = `rgba(239,68,68,${(0.22 + pulse * 0.13).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      for (const [cx, cy] of [[R, R], [W-R, R], [R, H-R], [W-R, H-R]]) {
        const sx = cx === R ? 1 : -1, sy = cy === R ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx + sx * L, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * L);
        ctx.stroke();
      }
      ctx.restore();

      /* repulsion glow */
      if (ptr.in && !ptr.hole && !grabC.c && !coarse) {
        ctx.save();
        const gr = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, CFG.repelR);
        gr.addColorStop(0, 'rgba(220,38,38,0.14)');
        gr.addColorStop(1, 'rgba(220,38,38,0)');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(ptr.x, ptr.y, CFG.repelR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(239,68,68,0.28)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.lineDashOffset = -now / 18;
        ctx.beginPath(); ctx.arc(ptr.x, ptr.y, CFG.repelR, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      /* singularity black hole */
      if (ptr.hole) {
        ctx.save();
        const t = now / 1000;
        const gr = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 175);
        gr.addColorStop(0,    'rgba(0,0,0,0.95)');
        gr.addColorStop(0.18, 'rgba(220,38,38,0.5)');
        gr.addColorStop(0.55, 'rgba(100,15,15,0.12)');
        gr.addColorStop(1,    'rgba(220,38,38,0)');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 175, 0, Math.PI * 2); ctx.fill();
        for (let k = 0; k < 4; k++) {
          const r2  = 22 + k * 26;
          const spd = (58 + k * 38) * (k % 2 ? -1 : 1);
          ctx.strokeStyle = `rgba(239,68,68,${(0.82 - k * 0.17).toFixed(3)})`;
          ctx.lineWidth = 1.3 - k * 0.18;
          ctx.setLineDash([5 + k * 4, 8 + k * 3]);
          ctx.lineDashOffset = -t * spd;
          ctx.beginPath(); ctx.arc(ptr.x, ptr.y, r2, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(239,68,68,0.65)';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SINGULARITY', ptr.x, ptr.y - 24);
        ctx.restore();
      }

      /* grab beam (dashed tether) */
      if (grabC.c) {
        ctx.save();
        const { x: ax, y: ay } = grabC.c.pointA;
        const { x: bx, y: by } = grabC.c.bodyB.position;
        const gr2 = ctx.createLinearGradient(ax, ay, bx, by);
        gr2.addColorStop(0, 'rgba(239,68,68,0.7)');
        gr2.addColorStop(1, 'rgba(239,68,68,0)');
        ctx.strokeStyle = gr2;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]); ctx.lineDashOffset = -now / 18;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(ax, ay, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      /* shockwave ring */
      if (shock.active) {
        ctx.save();
        shock.r    = shock.r    + (shock.maxR - shock.r) * 0.11;
        shock.alpha *= 0.88;
        ctx.strokeStyle = `rgba(239,68,68,${shock.alpha.toFixed(3)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(shock.x, shock.y, shock.r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${(shock.alpha * 0.32).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(shock.x, shock.y, shock.r * 0.65, 0, Math.PI * 2); ctx.stroke();
        if (shock.alpha < 0.02) shock.active = false;
        ctx.restore();
      }

      /* DOM chip sync */
      for (const c of chips) {
        const { position: p, angle: a } = c.body;
        if (Math.abs(p.x - c.lx) > 0.05 || Math.abs(p.y - c.ly) > 0.05 || Math.abs(a - c.la) > 0.001) {
          c.el.style.transform = `translate3d(${(p.x - c.w / 2).toFixed(2)}px,${(p.y - c.h / 2).toFixed(2)}px,0) rotate(${a.toFixed(4)}rad)`;
          c.lx = p.x; c.ly = p.y; c.la = a;
        }
        if (c.hit && now > c.hit) { c.hit = 0; c.el.classList.remove('gs-hit'); }
      }

      /* tooltip position */
      if (hovered >= 0 && tipRef.current) {
        const c = chips.find(k => k.i === hovered);
        if (c) {
          const below = c.body.position.y < 80;
          const tx = clamp(c.body.position.x, 115, Math.max(115, W - 115));
          const ty = c.body.position.y + (below ? c.h / 2 + 16 : -c.h / 2 - 16);
          tipRef.current.style.transform =
            `translate3d(${tx.toFixed(0)}px,${ty.toFixed(0)}px,0) translate(-50%,${below ? '0' : '-100%'})`;
        }
      }

      /* HUD readout */
      if (++frame % 10 === 0 && hudRef.current) {
        hudRef.current.textContent =
          `SYS // BODIES:${chips.length.toString().padStart(2,'0')} // G:${g.x.toFixed(2)},${g.y.toFixed(2)} // ${mode}`;
      }
    };

    /* ── RAF loop ── */
    const tick = (now) => {
      if (!visible || dead) { raf = 0; return; }
      raf = requestAnimationFrame(tick);
      acc += Math.min(now - (last || now), 100); last = now;
      const sy = window.scrollY;
      sv += ((sy - lastSY) - sv) * 0.25; lastSY = sy;
      while (acc >= STEP) { step(); acc -= STEP; }
      draw(now);
    };
    const start = () => {
      if (raf) return;
      last = 0; lastSY = window.scrollY;
      raf = requestAnimationFrame(tick);
    };

    /* ── lifecycle ── */
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !dropped && e.intersectionRatio >= 0.25) { dropped = true; drop(); }
        if (visible) start();
      },
      { threshold: [0, 0.25] }
    );

    const ro = new ResizeObserver(() => {
      if (Math.abs(box.clientWidth - W) > 1 || Math.abs(box.clientHeight - H) > 1) measure();
    });

    /* init after DOM + fonts are ready */
    els.forEach((el) => {
      if (el) { el.style.visibility = 'hidden'; el.style.transform = ''; }
    });

    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (dead) return;
      measure();
      embers = new EmberSystem(W, H);
      matrix = new MatrixStream(W, H);
      setMode('READY');
      io.observe(box);
      ro.observe(box);
    });

    /* event wiring */
    box.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('blur', onUp);
    box.addEventListener('touchstart', onTS, { passive: true });
    box.addEventListener('touchmove', onTM, { passive: false });
    box.addEventListener('touchend', onTE, { passive: false });
    box.addEventListener('touchcancel', onTE, { passive: false });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      io.disconnect(); ro.disconnect();
      box.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('blur', onUp);
      box.removeEventListener('touchstart', onTS);
      box.removeEventListener('touchmove', onTM);
      box.removeEventListener('touchend', onTE);
      box.removeEventListener('touchcancel', onTE);
      window.removeEventListener('deviceorientation', onOrient);
      Events.off(engine);
      Composite.clear(world, false);
      Engine.clear(engine);
      cursor('');
    };
  }, [reduced, coarse]);

  /* ══ RENDER ══ */
  const btnBase =
    'font-mono text-xs tracking-widest px-3.5 py-1.5 rounded-md border transition-all duration-200 cursor-none';

  return (
    <section
      id="stack"
      className="relative w-full bg-black py-24 md:py-32 z-40 border-t border-zinc-900 overflow-hidden"
    >
      <style>{`
        .gs-chip {
          border-color: color-mix(in srgb, var(--c) 35%, #27272a);
          box-shadow: inset 0 0 16px -8px var(--c);
          transition: border-color .2s, box-shadow .2s, color .2s;
        }
        .gs-chip.gs-hot {
          border-color: #dc2626;
          color: #fff;
          box-shadow: 0 0 20px rgba(220,38,38,.55), inset 0 0 14px -6px var(--c);
        }
        .gs-chip.gs-hit {
          border-color: var(--c);
          color: #fff;
          box-shadow: 0 0 26px -2px var(--c), inset 0 0 14px -6px var(--c);
        }
        .gs-dot {
          width: 5px; height: 5px;
          border-radius: 9999px;
          background: var(--c);
          box-shadow: 0 0 7px var(--c);
          flex-shrink: 0;
        }
        .gs-phase {
          animation: gs-blink 1.1s step-end infinite;
        }
        @keyframes gs-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>

      <div className="container mx-auto px-6 max-w-6xl">

        {/* label */}
        <p className="text-red-600 font-mono tracking-widest uppercase mb-4 text-xs md:text-sm flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
          // COMMAND MATRIX // PHYSICS-ENABLED TECH ARSENAL
        </p>

        {/* title + controls */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-black uppercase leading-none mb-4 tracking-tight">
              Interactive<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-amber-500">
                Stack
              </span>
            </h2>
            <p className="font-mono text-[11px] tracking-widest text-zinc-500">
              {coarse
                ? '[DRAG CHIPS · ENABLE TILT FOR GRAVITY SHIFT]'
                : '[HOVER TO REPEL · DRAG TO THROW · HOLD SPACE = SINGULARITY]'}
            </p>
          </div>

          {!reduced && (
            <div className="flex items-center gap-3">
              {/* mode badge */}
              <span
                className={`font-mono text-[10px] tracking-widest border px-2.5 py-1 rounded-full uppercase ${
                  phase === 'SINGULARITY'
                    ? 'border-red-600/80 text-red-500 bg-red-950/30'
                    : phase === 'GRAB'
                    ? 'border-amber-500/60 text-amber-400 bg-amber-950/20'
                    : phase === 'TILT'
                    ? 'border-cyan-500/60 text-cyan-400 bg-cyan-950/20'
                    : 'border-zinc-800 text-zinc-600'
                } ${['SINGULARITY','GRAB','TILT'].includes(phase) ? 'gs-phase' : ''}`}
              >
                {phase}
              </span>

              {coarse && (
                <button
                  type="button"
                  disabled={tilt}
                  onClick={() => api.current.enableTilt?.()}
                  className={`${btnBase} ${
                    tilt
                      ? 'border-red-600 text-red-500 bg-red-950/30'
                      : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {tilt ? 'TILT: ON' : 'ENABLE TILT'}
                </button>
              )}

              <button
                type="button"
                onClick={() => api.current.drop?.()}
                className={`${btnBase} border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700`}
              >
                ↺ RESET
              </button>
            </div>
          )}
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 font-mono text-[10px] tracking-widest text-zinc-500">
          {Object.values(CATS).map((c) => (
            <span key={c.label} className="flex items-center gap-2">
              <span className="gs-dot" style={{ '--c': c.color }} />
              {c.label}
            </span>
          ))}
          <span className="ml-auto text-zinc-700 hidden md:block">
            {chipCount.toString().padStart(2, '0')}&nbsp;/&nbsp;{SKILLS.length.toString().padStart(2, '0')}&nbsp;LOADED
          </span>
        </div>

        {/* physics arena */}
        <div
          ref={boxRef}
          className={
            reduced
              ? 'flex flex-wrap gap-3 p-6 rounded-3xl border border-zinc-800/80 bg-zinc-950'
              : 'relative rounded-3xl border border-zinc-800/80 bg-zinc-950 overflow-hidden cursor-none select-none'
          }
          style={
            reduced
              ? {}
              : {
                  height: 'clamp(580px, 62vw, 700px)',
                  WebkitTouchCallout: 'none',
                  backgroundImage: [
                    'radial-gradient(ellipse at 50% 110%, rgba(220,38,38,0.1), transparent 58%)',
                    'radial-gradient(ellipse at 20% 20%, rgba(6,182,212,0.04), transparent 45%)',
                    'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
                    'linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
                  ].join(','),
                  backgroundSize: '100% 100%, 100% 100%, 38px 38px, 38px 38px',
                }
          }
          aria-label="Interactive physics skills playground"
        >
          {/* canvas overlay */}
          {!reduced && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          )}

          {/* chip DOM elements */}
          {SKILLS.map((s, i) => (
            <div
              key={s.name}
              ref={(el) => { chipRefs.current[i] = el; }}
              className={[
                'gs-chip',
                reduced
                  ? ''
                  : 'absolute top-0 left-0 will-change-transform pointer-events-none',
                'flex items-center gap-2.5 whitespace-nowrap rounded-full border',
                'bg-zinc-950/95 backdrop-blur-sm',
                'px-6 py-3 sm:px-8 sm:py-3.5',
                'font-mono text-xs sm:text-sm uppercase tracking-wider text-zinc-300',
              ].join(' ')}
              style={{ '--c': CATS[s.cat].color, visibility: reduced ? 'visible' : 'hidden' }}
            >
              <span className="text-xl sm:text-2xl leading-none">{s.icon}</span>
              <span className="font-semibold">{s.name}</span>
              <span className="gs-dot" />
            </div>
          ))}

          {/* tooltip */}
          {!reduced && (
            <div
              ref={tipRef}
              className={`absolute top-0 left-0 z-20 pointer-events-none rounded-lg border border-red-600/60 bg-black/92 px-3 py-2 font-mono text-[10px] tracking-widest text-zinc-200 whitespace-nowrap shadow-[0_0_18px_rgba(220,38,38,0.4)] transition-opacity duration-150 ${
                tip ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {tip && (
                <>
                  <span className="text-red-500">{tip.proof ? 'USED IN: ' : 'STACK // '}</span>
                  {tip.proof ?? CATS[tip.cat].label}
                </>
              )}
            </div>
          )}

          {/* HUD */}
          {!reduced && (
            <div
              ref={hudRef}
              className="absolute bottom-3 left-10 right-10 text-center font-mono text-[9px] tracking-widest text-zinc-700 pointer-events-none"
            />
          )}

          {/* desktop hint */}
          {!reduced && (
            <p className="absolute top-3 left-0 right-0 text-center font-mono text-[10px] tracking-[0.2em] text-zinc-700 pointer-events-none hidden md:block">
              HOLD ON EMPTY SPACE → SINGULARITY MODE
            </p>
          )}
        </div>

        {/* screen-reader list */}
        <ul className="sr-only">
          {SKILLS.map((s) => (
            <li key={s.name}>
              {s.name}{s.proof ? `, used in ${s.proof}` : ''}
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
