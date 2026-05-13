import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
const parseDate = (dobStr) => {
  const parts = dobStr.split("/").map((p) => p.trim());
  if (parts.length !== 3) return null;
  const dd = Number(parts[0]);
  const mm = Number(parts[1]);
  const yyyy = Number(parts[2]);
  if (!dd || !mm || !yyyy || parts[0].length > 2 || parts[1].length > 2 || parts[2].length !== 4)
    return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return { dd, mm, yyyy };
};

const validateFullDOB = (val) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return false;
  return parseDate(val) !== null;
};

const GENDER = { BOY: "boy", GIRL: "girl", NEUTRAL: "neutral" };

const withHonorific = (name, gender) => {
  const n = (name || "").trim();
  if (!n) return "";
  if (gender === GENDER.BOY) return `Handsome ${n}`;
  if (gender === GENDER.GIRL) return `Princess ${n}`;
  return n;
};

const CLOSING_SENTIMENT =
  "We are already saving extra sparkle for your next birthday, and the one after that, until we can celebrate you as grandly as you deserve. This was only the beginning, and the best is still ahead.";

const compareDOB = (dob) => {
  const parsed = parseDate(dob);
  if (!parsed) return "belated";
  const today = new Date();
  const todayDD = today.getDate();
  const todayMM = today.getMonth() + 1;
  const { dd, mm } = parsed;

  const todayVal = todayMM * 100 + todayDD;
  const dobVal = mm * 100 + dd;

  if (dobVal === todayVal) return "birthday";
  if (dobVal > todayVal) return "advance";
  return "belated";
};

const getDaysUntil = (dob) => {
  const parsed = parseDate(dob);
  if (!parsed) return 0;
  const { dd, mm } = parsed;
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, mm - 1, dd);
  if (target < now) target = new Date(year + 1, mm - 1, dd);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

const getDaysSince = (dob) => {
  const parsed = parseDate(dob);
  if (!parsed) return 0;
  const { dd, mm } = parsed;
  const now = new Date();
  const year = now.getFullYear();
  const target = new Date(year, mm - 1, dd);
  return Math.floor((now - target) / (1000 * 60 * 60 * 24));
};

const generateWish = (name) => {
  const wishes = [
    `${name}, the universe paused for a moment the day you were born — and it's been more beautiful ever since. May this year bring you everything you've been quietly wishing for.`,
    `To ${name} — may your birthday be the opening chapter of your most extraordinary year yet. The world is richer for having you in it.`,
    `${name}, you have this rare gift of making ordinary moments feel like magic. Today, the magic belongs entirely to you. Happy Birthday.`,
    `Every year with ${name} in the world is a better year. Today we celebrate not just your birth, but everything you are and everything you're becoming.`,
    `${name} — some people light up a room. You light up entire seasons. Here's to you, today and always.`,
  ];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return wishes[hash % wishes.length];
};

// ─────────────────────────────────────────────
// PARTICLE BACKGROUND
// ─────────────────────────────────────────────
const ParticleCanvas = ({ count = 60, color = "#a78bfa" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────
const ConfettiCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const colors = ["#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f97316"];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H - H,
      w: Math.random() * 12 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      drot: (Math.random() - 0.5) * 0.15,
      dy: Math.random() * 3 + 1.5,
      dx: (Math.random() - 0.5) * 1.5,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.x += p.dx;
        p.y += p.dy;
        p.rot += p.drot;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
};

// ─────────────────────────────────────────────
// CELEBRATION AUDIO (primed on Continue click)
// ─────────────────────────────────────────────
let celebrationAudioCtx = null;

const primeCelebrationAudio = () => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!celebrationAudioCtx) celebrationAudioCtx = new AC();
  celebrationAudioCtx.resume?.();
  return celebrationAudioCtx;
};

const playFirecrackerSnap = (ctx) => {
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  if (ctx.state !== "running") return;
  const t = ctx.currentTime;
  const duration = 0.14;
  const n = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    ch[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 1.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 900 + Math.random() * 800;
  bp.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.95, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start(t);
  src.stop(t + duration + 0.02);

  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180 + Math.random() * 80, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
  og.gain.setValueAtTime(0.48, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  osc.connect(og);
  og.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.25);

  const t2 = t + 0.03;
  const src2 = ctx.createBufferSource();
  src2.buffer = buf;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.28, t2);
  g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.08);
  src2.connect(g2);
  g2.connect(ctx.destination);
  src2.start(t2);
  src2.stop(t2 + 0.1);
};

// ─────────────────────────────────────────────
// FIRECRACKER / FIREWORK CANVAS
// ─────────────────────────────────────────────
const FirecrackerCanvas = ({ intensity = 1, onBurst }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const sparks = [];
    const colors = ["#fbbf24", "#f97316", "#ef4444", "#facc15", "#fb7185", "#a78bfa", "#ffffff"];

    const spawnBurst = (x, y, loud) => {
      const count = Math.floor((24 + Math.random() * 36) * intensity);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 7;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 1,
          life: 1,
          decay: 0.012 + Math.random() * 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * 2.5,
        });
      }
      if (loud && onBurst) onBurst();
    };

    let nextBurst = performance.now() + 400;
    let raf;

    const tick = (now) => {
      if (now > nextBurst) {
        const x = W * (0.15 + Math.random() * 0.7);
        const y = H * (0.12 + Math.random() * 0.45);
        spawnBurst(x, y, Math.random() > 0.2);
        nextBurst = now + (220 + Math.random() * 650) / intensity;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.life -= p.decay;
        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.95;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [intensity, onBurst]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }} />;
};

const CelebrationFireworks = ({ soundOn }) => {
  const onBurst = useCallback(() => {
    if (!soundOn) return;
    if (Math.random() > 0.05) playFirecrackerSnap(celebrationAudioCtx);
  }, [soundOn]);

  return <FirecrackerCanvas intensity={1.45} onBurst={onBurst} />;
};

// ─────────────────────────────────────────────
// RAIN CANVAS
// ─────────────────────────────────────────────
const RainCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const drops = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      len: Math.random() * 20 + 10,
      speed: Math.random() * 4 + 2,
      alpha: Math.random() * 0.3 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.len);
        ctx.strokeStyle = `rgba(147,197,253,${d.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        d.y += d.speed;
        if (d.y > H) { d.y = -d.len; d.x = Math.random() * W; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
};

// ─────────────────────────────────────────────
// TYPING TEXT
// ─────────────────────────────────────────────
const TypingText = ({ text, speed = 35 }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return (
    <span>
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// ─────────────────────────────────────────────
// GLASS CARD
// ─────────────────────────────────────────────
const GlassCard = ({ children, className = "", style }) => (
  <div
    className={`rounded-3xl border border-white/10 ${className}`}
    style={{
      background: "rgba(15,10,40,0.55)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      boxShadow: "0 8px 64px rgba(139,92,246,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────
// FLOATING BALLOONS
// ─────────────────────────────────────────────
const Balloons = () => {
  const balloons = [
    { color: "#f43f5e", x: "8%", delay: 0 },
    { color: "#a78bfa", x: "18%", delay: 0.4 },
    { color: "#fbbf24", x: "80%", delay: 0.2 },
    { color: "#34d399", x: "90%", delay: 0.7 },
    { color: "#60a5fa", x: "50%", delay: 1.1 },
  ];
  return (
    <>
      {balloons.map((b, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none select-none"
          style={{ left: b.x, bottom: "-20px", zIndex: 2 }}
          animate={{ y: [0, -window.innerHeight - 100] }}
          transition={{ duration: 8 + i, delay: b.delay, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative flex flex-col items-center">
            <div
              className="w-12 h-14 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 35%, white 0%, ${b.color} 60%)`,
                boxShadow: `0 0 20px ${b.color}88`,
              }}
            />
            <div className="w-px h-16 opacity-40" style={{ background: b.color }} />
          </div>
        </motion.div>
      ))}
    </>
  );
};

// ─────────────────────────────────────────────
// SPARKLES
// ─────────────────────────────────────────────
const Sparkles = () => {
  const sparkles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 1.5,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }}>
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ top: s.top, left: s.left }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="#fbbf24">
            <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// CAKE ANIMATION
// ─────────────────────────────────────────────
const Cake = () => (
  <motion.div
    className="flex flex-col items-center select-none"
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    {/* Candles */}
    <div className="flex gap-3 mb-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: "#fbbf24", boxShadow: "0 0 8px #fbbf24" }}
            animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          />
          <div className="w-2 h-5 rounded-sm" style={{ background: `hsl(${i * 60 + 200},80%,60%)` }} />
        </div>
      ))}
    </div>
    {/* Cake body */}
    <div className="w-28 h-10 rounded-t-lg" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)", boxShadow: "0 4px 24px #ec489966" }} />
    <div className="w-36 h-12 rounded-b-lg" style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)" }} />
    {/* Plate */}
    <div className="w-40 h-3 rounded-full opacity-60" style={{ background: "rgba(255,255,255,0.15)" }} />
  </motion.div>
);

// ─────────────────────────────────────────────
// GIFT BOX
// ─────────────────────────────────────────────
const GiftBox = ({ delay = 0, color = "#8b5cf6" }) => (
  <motion.div
    className="relative select-none"
    animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    <div className="w-16 h-14 rounded-lg" style={{ background: `linear-gradient(135deg,${color},${color}aa)`, boxShadow: `0 8px 24px ${color}66` }}>
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-lg" style={{ background: "rgba(255,255,255,0.3)" }} />
      <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2" style={{ background: "rgba(255,255,255,0.5)" }} />
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2" style={{ background: "rgba(255,255,255,0.5)" }} />
    </div>
    <div className="absolute -top-3 inset-x-0 flex justify-center">
      <div className="w-4 h-4" style={{ filter: "drop-shadow(0 0 4px white)" }}>
        <svg viewBox="0 0 24 24" fill="white"><path d="M12 2 C8 2 4 6 4 10 C4 14 8 18 12 22 C16 18 20 14 20 10 C20 6 16 2 12 2Z" /></svg>
      </div>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────
// COUNTDOWN TIMER
// ─────────────────────────────────────────────
const CountdownTimer = ({ targetDDMM, label }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const calc = () => {
      const parsed = parseDate(targetDDMM);
      if (!parsed) return;
      const { dd, mm } = parsed;
      const now = new Date();
      const year = now.getFullYear();
      let target = new Date(year, mm - 1, dd);
      if (target <= now) target = new Date(year + 1, mm - 1, dd);
      const diff = target - now;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDDMM]);
  const units = [
    { val: time.days, label: "Days" },
    { val: time.hours, label: "Hours" },
    { val: time.mins, label: "Mins" },
    { val: time.secs, label: "Secs" },
  ];
  return (
    <div className="text-center">
      <p className="text-white/50 text-sm uppercase tracking-widest mb-4">{label}</p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-full px-1">
        {units.map((u) => (
          <GlassCard key={u.label} className="px-3 py-3 sm:px-4 min-w-[52px] sm:min-w-[64px]">
            <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Mono', monospace" }}>
              {String(u.val).padStart(2, "0")}
            </div>
            <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">{u.label}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CELEBRATION LAYER (post-login: fireworks + sound toggle)
// ─────────────────────────────────────────────
const CelebrationSoundLayer = ({ showFireworks = true }) => {
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => {
    if (showFireworks) primeCelebrationAudio();
  }, [showFireworks]);

  return (
    <>
      {showFireworks && <CelebrationFireworks soundOn={soundOn} />}
      {showFireworks && (
      <motion.button
        type="button"
        aria-pressed={soundOn}
        className="fixed z-[70] flex items-center gap-2 px-4 py-3 sm:py-2.5 rounded-full border border-white/15 text-white/85 text-xs shadow-lg pointer-events-auto max-w-[calc(100vw-2rem)]"
        style={{
          bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
          right: "max(1rem, env(safe-area-inset-right, 0px))",
          background: "rgba(15,10,40,0.75)",
          backdropFilter: "blur(12px)",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onClick={() => {
          primeCelebrationAudio();
          setSoundOn((v) => !v);
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-base shrink-0">{soundOn ? "🧨" : "🔕"}</span>
        <span className="text-left leading-tight">{soundOn ? "Cracker sound on" : "Cracker sound off"}</span>
      </motion.button>
      )}
    </>
  );
};

const pickNarrationVoice = () => {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => /^en(-|$)/i.test((v.lang || "").trim()));
  const female = (v) =>
    /Samantha|Victoria|Karen|Zira|Sara|Moira|Tessa|Serena|Fiona|Allison|Ava|Google UK English Female|Microsoft (Susan|Zira|Jenny|Aria)|Female/i.test(v.name);
  const male = (v) =>
    /Daniel|Fred|Tom|David|Mark|George|Microsoft (David|Mark|Guy)|Google UK English Male|Male|Richard/i.test(v.name);
  return en.find(female) || en.find((v) => !male(v)) || en[0] || null;
};

const speakNarrationLine = (text) =>
  new Promise((resolve) => {
    if (!text?.trim() || !window.speechSynthesis) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text.trim());
    u.rate = 0.9;
    u.pitch = 1.05;
    u.volume = 1;
    const voice = pickNarrationVoice();
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang || "en-US";
    } else {
      u.lang = "en-US";
    }
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });

const waitForVoices = () =>
  new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    if (window.speechSynthesis.getVoices().length) {
      resolve();
      return;
    }
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    setTimeout(done, 600);
  });

const useNarrationSequence = (lines, runKey) => {
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const genRef = useRef(0);
  useEffect(() => {
    if (!runKey || !linesRef.current?.length) return;
    const myGen = ++genRef.current;
    let cancelled = false;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 1400));
      if (cancelled || genRef.current !== myGen) return;
      window.speechSynthesis.cancel();
      await waitForVoices();
      if (cancelled || genRef.current !== myGen) return;
      for (const line of linesRef.current) {
        if (cancelled || genRef.current !== myGen) break;
        await speakNarrationLine(line);
        await new Promise((r) => setTimeout(r, 380));
      }
    };

    run();
    return () => {
      cancelled = true;
      genRef.current += 1;
      window.speechSynthesis.cancel();
    };
  }, [runKey]);
};

const replayNarration = async (lines) => {
  window.speechSynthesis.cancel();
  await waitForVoices();
  for (const line of lines) {
    await speakNarrationLine(line);
    await new Promise((r) => setTimeout(r, 320));
  }
};

const NarrationReplay = ({ lines }) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return (
    <button
      type="button"
      onClick={() => replayNarration(lines)}
      className="mt-4 text-xs uppercase tracking-widest text-white/45 hover:text-cyan-300/90 transition-colors px-2 py-2 min-h-[44px] sm:min-h-0"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      Replay voice messages
    </button>
  );
};

const ClosingFooter = () => (
  <motion.div
    className="w-full max-w-2xl mt-4 mb-16 px-1"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.55 }}
  >
    <GlassCard className="p-6 sm:p-8 text-center border border-white/10">
      <p className="text-white/75 text-sm sm:text-base leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
        {CLOSING_SENTIMENT}
      </p>
    </GlassCard>
  </motion.div>
);

// ─────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState(GENDER.NEUTRAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!validateFullDOB(password)) {
      setError("Use a real date in DD/MM/YYYY (e.g. 13/05/1998).");
      return;
    }
    setError("");
    primeCelebrationAudio();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    onLogin(username.trim(), password, gender);
  };

  const inputBase =
    "w-full px-4 py-3.5 rounded-lg text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 text-sm border";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(165deg,#020617 0%,#0f172a 45%,#020617 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -15%, rgba(51,65,85,0.35), transparent), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(30,58,138,0.12), transparent)",
        }}
      />
      <ParticleCanvas count={18} color="#475569" />

      <motion.div
        className="relative w-full max-w-[min(440px,calc(100vw-1.25rem))] mx-auto rounded-2xl border border-slate-700/90 bg-slate-950/85 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        style={{ zIndex: 10 }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="px-5 py-8 sm:px-10 sm:py-10">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="h-11 w-11 rounded-lg border border-slate-600 flex items-center justify-center text-slate-300 text-sm font-semibold tracking-tight"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              IN
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Private access
              </p>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-100 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Secure entry
              </h1>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Sign in with your details. What follows is intentionally hidden until you continue — a surprise experience, not a corporate announcement.
          </p>

          <div className="space-y-5">
            <div>
              <label
                className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${focusedField === "name" ? "text-sky-400" : "text-slate-500"}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Full name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                placeholder="As you’d like it shown"
                className={inputBase}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: "rgba(15,23,42,0.85)",
                  borderColor: focusedField === "name" ? "rgba(56,189,248,0.55)" : "rgba(51,65,85,0.9)",
                  boxShadow: focusedField === "name" ? "0 0 0 1px rgba(56,189,248,0.25)" : "none",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <label
                className={`block text-[11px] font-medium uppercase tracking-wider mb-2 ${focusedField === "dob" ? "text-sky-400" : "text-slate-500"}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Date of birth
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("dob")}
                onBlur={() => setFocusedField(null)}
                placeholder="DD/MM/YYYY"
                maxLength={10}
                autoComplete="bday"
                className={inputBase}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "0.06em",
                  background: "rgba(15,23,42,0.85)",
                  borderColor: focusedField === "dob" ? "rgba(56,189,248,0.55)" : "rgba(51,65,85,0.9)",
                  boxShadow: focusedField === "dob" ? "0 0 0 1px rgba(56,189,248,0.25)" : "none",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Greeting title (spoken messages always use a clear female voice)
              </p>
              <p className="text-[11px] text-slate-500 mb-3 leading-snug" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <strong className="text-slate-400">Male</strong> and <strong className="text-slate-400">Female</strong> here only change the title before your name (Handsome / Princess). The automatic voice-over on the next screen is always a female voice for everyone.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: GENDER.BOY, label: "Male title", sub: "“Handsome …”" },
                  { value: GENDER.GIRL, label: "Female title", sub: "“Princess …”" },
                  { value: GENDER.NEUTRAL, label: "Neutral", sub: "No title" },
                ].map((opt) => {
                  const active = gender === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGender(opt.value)}
                      className="py-3 sm:py-2.5 px-2 rounded-lg text-left sm:text-center text-xs font-medium transition-all border min-h-[48px] flex flex-col justify-center"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        background: active ? "rgba(56,189,248,0.12)" : "rgba(15,23,42,0.7)",
                        borderColor: active ? "rgba(56,189,248,0.5)" : "rgba(51,65,85,0.85)",
                        color: active ? "#e2e8f0" : "#94a3b8",
                      }}
                    >
                      <span className="block font-semibold">{opt.label}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5 font-normal">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-sm text-rose-400 flex items-center gap-2"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <span aria-hidden>⚠</span> {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-sm font-semibold text-slate-950 transition-all"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: loading ? "#334155" : "linear-gradient(180deg,#e2e8f0,#cbd5e1)",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 1px 0 rgba(255,255,255,0.5) inset, 0 8px 24px rgba(15,23,42,0.45)",
                border: "none",
              }}
              whileHover={!loading ? { filter: "brightness(1.05)" } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2 text-slate-200">
                  <motion.span
                    className="inline-block h-4 w-4 border-2 border-slate-500 border-t-slate-200 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                  />
                  Verifying…
                </span>
              ) : (
                "Continue securely"
              )}
            </motion.button>
          </div>

          <p className="text-center text-slate-600 text-[11px] mt-8 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Client-side only. No data is uploaded to a server from this page.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────
// HAPPY BIRTHDAY PAGE
// ─────────────────────────────────────────────
const BirthdayPage = ({ displayName, dob }) => {
  const wish = generateWish(displayName);
  const narrationLines = useMemo(() => [wish, CLOSING_SENTIMENT], [wish]);
  useNarrationSequence(narrationLines, `bday|${displayName}|${dob}`);

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#0a0015 0%,#0d0525 40%,#070020 100%)" }}>
      <ParticleCanvas count={80} color="#f59e0b" />
      <ConfettiCanvas />
      <CelebrationSoundLayer />
      <Sparkles />
      <Balloons />

      <div className="relative z-10 flex flex-col items-center pt-12 sm:pt-16 pb-28 sm:pb-24 px-3 sm:px-4" style={{ minHeight: "100vh" }}>
        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, type: "spring", bounce: 0.4 }}
        >
          <motion.div
            className="text-6xl md:text-8xl font-black mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg,#fbbf24,#f59e0b,#ec4899,#a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              filter: "drop-shadow(0 0 30px #fbbf2466)",
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Happy Birthday!
          </motion.div>
          <div
            className="text-2xl md:text-4xl font-semibold text-white/90"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.02em" }}
          >
            🎉 {displayName} 🎉
          </div>
        </motion.div>

        {/* Cake */}
        <motion.div className="mb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Cake />
        </motion.div>

        {/* Wish Card */}
        <motion.div
          className="w-full max-w-2xl mb-10"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-4">💫</div>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              <TypingText text={wish} speed={30} />
            </p>
            <NarrationReplay lines={narrationLines} />
          </GlassCard>
        </motion.div>

        {/* Quote card */}
        <motion.div
          className="w-full max-w-lg mb-10"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
        >
          <GlassCard className="px-8 py-6">
            <div className="flex items-start gap-4">
              <span className="text-5xl text-purple-400 opacity-60 leading-none" style={{ fontFamily: "serif" }}>"</span>
              <p className="text-white/60 italic text-sm leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                Count your life by smiles, not tears. Count your age by friends, not years. And may today be the most beautiful of all your years.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Photo Gallery placeholder */}
        <motion.div
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
        >
          <GlassCard className="p-8">
            <h3 className="text-white/70 text-center text-sm uppercase tracking-widest mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Memory Gallery
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {["🌅", "🌊", "🌸", "🏔️", "🌙", "⭐"].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="aspect-square rounded-xl flex items-center justify-center text-3xl cursor-pointer"
                  style={{ background: `hsla(${i * 60},60%,40%,0.2)`, border: "1px solid rgba(255,255,255,0.06)" }}
                  whileHover={{ scale: 1.05, filter: "brightness(1.3)" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1 + i * 0.08 }}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <ClosingFooter />

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ADVANCE BIRTHDAY PAGE
// ─────────────────────────────────────────────
const AdvancePage = ({ displayName, dob }) => {
  const days = getDaysUntil(dob);
  const advanceWish = `${displayName}, your birthday is just around the corner — and the universe is already preparing something spectacular. ${days} days from now, we celebrate you.`;
  const narrationLines = useMemo(() => [advanceWish, CLOSING_SENTIMENT], [advanceWish]);
  useNarrationSequence(narrationLines, `adv|${displayName}|${dob}`);

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#00071a 0%,#050f30 50%,#000d22 100%)" }}>
      <ParticleCanvas count={60} color="#06b6d4" />
      <CelebrationSoundLayer />
      <Sparkles />

      {/* Glow */}
      <div className="fixed pointer-events-none inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%,rgba(6,182,212,0.08),transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 py-16 sm:py-20 w-full max-w-[100vw]">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        >
          <div className="text-6xl mb-6">🎁</div>
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-black mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg,#06b6d4,#818cf8,#c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 30px #06b6d444)",
            }}
          >
            Advance Birthday!
          </h1>
          <p className="text-xl text-white/60" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            For the wonderful {displayName}
          </p>
        </motion.div>

        {/* Gift boxes */}
        <motion.div
          className="flex gap-8 mb-14 flex-wrap justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          <GiftBox delay={0} color="#8b5cf6" />
          <GiftBox delay={0.5} color="#06b6d4" />
          <GiftBox delay={1} color="#ec4899" />
        </motion.div>

        {/* Countdown */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        >
          <CountdownTimer targetDDMM={dob} label={`${displayName}'s birthday arrives in`} />
        </motion.div>

        {/* Message card */}
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        >
          <GlassCard className="p-8 text-center" style={{ boxShadow: "0 8px 64px rgba(6,182,212,0.15)" }}>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              <TypingText text={advanceWish} speed={28} />
            </p>
            <NarrationReplay lines={narrationLines} />
          </GlassCard>
        </motion.div>

        <ClosingFooter />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// BELATED BIRTHDAY PAGE
// ─────────────────────────────────────────────
const BelatedPage = ({ displayName, dob }) => {
  const days = getDaysSince(dob);
  const belatedWish = `${displayName}, life got busy — but our love for you never did. Though these words arrive fashionably late, they carry every ounce of warmth your birthday deserved. Wishing you a year that makes up for every second we almost missed.`;
  const narrationLines = useMemo(() => [belatedWish, CLOSING_SENTIMENT], [belatedWish]);
  useNarrationSequence(narrationLines, `late|${displayName}|${dob}`);

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#060010 0%,#0d0520 50%,#060010 100%)" }}>
      <ParticleCanvas count={50} color="#60a5fa" />
      <RainCanvas />

      {/* Soft glow */}
      <div className="fixed pointer-events-none inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%,rgba(147,197,253,0.05),transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 py-16 sm:py-20 w-full max-w-[100vw]">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-6xl sm:text-7xl mb-6"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🥺
          </motion.div>
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-black mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg,#93c5fd,#c4b5fd,#f9a8d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 30px #93c5fd33)",
            }}
          >
            Belated Wishes!
          </h1>
          <p className="text-xl text-white/50" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            Better late than never, {displayName}
          </p>
        </motion.div>

        {/* Days since */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          <GlassCard className="px-6 sm:px-10 py-6 text-center" style={{ boxShadow: "0 8px 64px rgba(147,197,253,0.1)" }}>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your birthday was</p>
            <p className="text-white text-4xl font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>{days}</p>
            <p className="text-white/40 text-xs uppercase tracking-widest mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>days ago</p>
          </GlassCard>
        </motion.div>

        {/* Message card */}
        <motion.div
          className="w-full max-w-2xl mb-10"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        >
          <GlassCard className="p-8 text-center">
            <p className="text-white/70 text-base sm:text-lg leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              <TypingText text={belatedWish} speed={28} />
            </p>
            <NarrationReplay lines={narrationLines} />
          </GlassCard>
        </motion.div>

        {/* Quote */}
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
        >
          <GlassCard className="px-8 py-6">
            <div className="flex items-start gap-4">
              <span className="text-5xl text-blue-400 opacity-60 leading-none" style={{ fontFamily: "serif" }}>"</span>
              <p className="text-white/50 italic text-sm leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                A birthday wish sent late still carries all the love of one sent on time — it just traveled a longer, more thoughtful road.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <ClosingFooter />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);

  const handleLogin = (name, dob, gender) => {
    const res = compareDOB(dob);
    const displayName = withHonorific(name, gender);
    setUser({ name, dob, gender, displayName });
    setResult(res);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div key="login" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : result === "birthday" ? (
          <motion.div key="bday" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <BirthdayPage displayName={user.displayName} dob={user.dob} />
          </motion.div>
        ) : result === "advance" ? (
          <motion.div key="advance" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <AdvancePage displayName={user.displayName} dob={user.dob} />
          </motion.div>
        ) : (
          <motion.div key="belated" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <BelatedPage displayName={user.displayName} dob={user.dob} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
