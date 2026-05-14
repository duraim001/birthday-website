import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useAnimationFrame, useInView } from "framer-motion";
import priyaExclusivePhoto from "./WhatsApp Image 2026-05-14 at 5.36.14 PM.jpeg";
import fp1 from "./1.jpeg";
import fp2 from "./2.jpeg";
import fp3 from "./3.jpeg";
import fp4 from "./4.jpeg";
import fp5 from "./5.jpeg";
import fp6 from "./6.jpeg";
import fp7 from "./7.jpeg";
import fpW from "./WhatsApp Image 2026-05-14 at 6.46.23 PM.jpeg";
import { CuttingCake } from "./CakeLayers.jsx";

const FLOAT_PHOTO_SRCS = [fp1, fp2, fp3, fp4, fp5, fp6, fp7, fpW];

/** Stable default — avoid `extraSrcs = []` which is a new array every render */
const NO_EXTRA_PHOTOS = [];

const useViewport = () => {
  const [vp, setVp] = useState(() =>
    typeof window !== "undefined"
      ? { w: window.innerWidth, h: window.innerHeight, mobile: window.innerWidth < 768 }
      : { w: 1200, h: 800, mobile: false }
  );
  useEffect(() => {
    const onResize = () =>
      setVp({ w: window.innerWidth, h: window.innerHeight, mobile: window.innerWidth < 768 });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vp;
};

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

const CLOSING_SENTIMENT = "Here’s to you — a bright year ahead.";

/** Scroll-driven copy: enters from below, slides up */
const scrollUpReveal = {
  initial: { opacity: 0, y: 48 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18, margin: "0px 0px -14% 0px" },
  transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
};

const NEXT_BIRTHDAY_PROMISE =
  "When your birthday returns to the calendar, we’ll gather the stars again and make the next celebration even grander—until then, carry this light quietly with you.";

const LIFE_QUOTES = [
  "Life is loveliest when we walk gently with hope and leave room for wonder.",
  "The years ask little of us except courage, kindness, and a heart willing to begin again.",
  "Every ordinary day holds a door—gratitude is the key that turns it.",
  "Grow slowly if you must, but grow true; roots deepen where love waters them.",
  "You are not behind; you are simply on your own river, flowing toward your own sea.",
];

const LifeQuoteLine = ({ tone = "fuchsia" }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % LIFE_QUOTES.length), 7200);
    return () => clearInterval(id);
  }, []);
  const color =
    tone === "cyan"
      ? "text-cyan-950/80"
      : tone === "sky"
        ? "text-sky-950/80"
        : "text-fuchsia-950/78";
  return (
    <div className="w-full max-w-2xl mx-auto px-3 mb-8 min-h-[3.25rem] flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          role="status"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`text-center text-sm sm:text-[15px] leading-snug italic ${color}`}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {LIFE_QUOTES[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

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
  let y = now.getFullYear();
  let target = new Date(y, mm - 1, dd);
  if (target > now) target = new Date(y - 1, mm - 1, dd);
  return Math.max(0, Math.floor((now - target) / (1000 * 60 * 60 * 24)));
};

const generateWish = (name) => {
  const wishes = [
    `${name}, happy birthday — today is all yours.`,
    `Cheers, ${name}! May this year sparkle.`,
    `${name}, you make the world brighter. Celebrate big!`,
    `Happy birthday, ${name}! Cake, confetti, and joy.`,
    `${name}, wishing you laughter and sunshine today.`,
  ];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return wishes[hash % wishes.length];
};

const PRIYA_DOB = "14/05/1999";

const normalizeNameLetters = (name) =>
  (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

/** Photo bounce animation: only Priyadharshini + 14/05/1999 on birthday page */
const PRIYA_PHOTO_ANIMATION_SRCS = [priyaExclusivePhoto, ...FLOAT_PHOTO_SRCS];

/** Show exclusive photo + animation only for Priyadharshini (name variants) + 14/05/1999 */
const isPriyaExclusiveProfile = (rawName, dob) => {
  const d = (dob || "").replace(/\s/g, "");
  if (d !== PRIYA_DOB) return false;
  const k = normalizeNameLetters(rawName);
  const okName =
    k === "priyadharshini" ||
    k === "priyadharshinij" ||
    k === "priyadharchinij" ||
    (k.startsWith("priyadh") && k.includes("chini") && k.endsWith("j"));
  return okName;
};

// ─────────────────────────────────────────────
// PARTICLE BACKGROUND
// ─────────────────────────────────────────────
const ParticleCanvas = ({ count = 60, color = "#a78bfa", zIndex = 0 }) => {
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
  }, [count, color, zIndex]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex }}
    />
  );
};

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────
const ConfettiCanvas = () => {
  const canvasRef = useRef(null);
  const [pieceCount, setPieceCount] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 64 : 110
  );
  useEffect(() => {
    const mq = () => setPieceCount(window.innerWidth < 768 ? 64 : 110);
    mq();
    window.addEventListener("resize", mq);
    return () => window.removeEventListener("resize", mq);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const colors = ["#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f97316"];
    const pieces = Array.from({ length: pieceCount }, () => ({
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
  }, [pieceCount]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
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
        ctx.strokeStyle = `rgba(59,130,246,${d.alpha * 0.55 + 0.12})`;
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
// HEAVY STORM RAIN (belated)
// ─────────────────────────────────────────────
const HeavyRainCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const dropCount = W < 768 ? 220 : 520;

    const drops = Array.from({ length: dropCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      len: 14 + Math.random() * 42,
      speed: 9 + Math.random() * 16,
      drift: -1.2 + Math.random() * 2.4,
      thick: 0.5 + Math.random() * 1.8,
      alpha: 0.08 + Math.random() * 0.42,
    }));

    const splashes = [];
    const mist = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "rgba(148,163,184,0.12)");
      g.addColorStop(0.45, "rgba(226,232,240,0.02)");
      g.addColorStop(1, "rgba(59,130,246,0.08)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      mist();

      drops.forEach((d) => {
        const x1 = d.x;
        const y1 = d.y;
        const x2 = d.x + d.drift * (d.len * 0.08);
        const y2 = d.y + d.len;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(100,116,139,${d.alpha})`;
        ctx.lineWidth = d.thick;
        ctx.stroke();

        d.y += d.speed;
        d.x += d.drift * 0.35;
        if (d.y > H + 40) {
          if (Math.random() < 0.35) {
            splashes.push({ x: d.x, y: H - 4 - Math.random() * 8, life: 1, r: 2 + Math.random() * 5 });
          }
          d.y = -d.len;
          d.x = Math.random() * W;
          d.len = 14 + Math.random() * 42;
          d.speed = 9 + Math.random() * 16;
        }
      });

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.life -= 0.04;
        if (s.life <= 0) {
          splashes.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.r * (2 - s.life), s.r * 0.45 * s.life, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${0.25 * s.life})`;
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255,255,255,0.03)";
      for (let i = 0; i < 3; i++) {
        const y = ((performance.now() * 0.02 + i * 200) % (H + 80)) - 40;
        ctx.fillRect(0, y, W, 50);
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
};

// ─────────────────────────────────────────────
// TYPING TEXT
// ─────────────────────────────────────────────
const TypingText = ({ text, speed = 35, requireVisible = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2, margin: "0px 0px -12% 0px" });
  const [displayed, setDisplayed] = useState("");
  const visibleActive = !requireVisible || isInView;

  useEffect(() => {
    if (!visibleActive) {
      setDisplayed("");
      return undefined;
    }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, visibleActive]);

  return (
    <span ref={ref}>
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
    className={`rounded-3xl border border-pink-200/35 ${className}`}
    style={{
      background: "transparent",
      boxShadow: "none",
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
// PHOTOS — physics bounce off viewport edges
// ─────────────────────────────────────────────
const PhotoEdgeBounceField = ({ active = true, extraSrcs = NO_EXTRA_PHOTOS }) => {
  const { mobile } = useViewport();
  const merged = useMemo(() => {
    const m = [...extraSrcs, ...FLOAT_PHOTO_SRCS];
    const u = [];
    m.forEach((s) => {
      if (!u.includes(s)) u.push(s);
    });
    return u;
  }, [extraSrcs]);

  const [photoSlots, setPhotoSlots] = useState([]);
  const imgRefs = useRef([]);
  const bodies = useRef([]);

  useLayoutEffect(() => {
    if (!active) {
      setPhotoSlots([]);
      bodies.current = [];
      return;
    }
    const n = mobile ? 5 : 8;
    const size = mobile ? 56 : 72;
    setPhotoSlots(
      Array.from({ length: n }, (_, i) => ({
        id: `${i}-${merged[i % merged.length]}`,
        src: merged[i % merged.length],
        size,
      }))
    );
  }, [active, mobile, merged]);

  useLayoutEffect(() => {
    if (!photoSlots.length) {
      bodies.current = [];
      return;
    }
    const W = window.innerWidth;
    const H = window.innerHeight;
    bodies.current = photoSlots.map((p) => {
      const hw = p.size / 2;
      const hh = (p.size * 5) / 4 / 2;
      /* Spawn along bottom band, drift upward then bounce */
      const x = W * (0.08 + Math.random() * 0.84);
      const y = H - hh - 6 - Math.random() * Math.min(100, H * 0.12);
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 5.2,
        vy: -2.8 - Math.random() * 2.8,
        hw,
        hh,
      };
    });
  }, [photoSlots, mobile]);

  useAnimationFrame(() => {
    if (!active || !bodies.current.length) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const damp = 0.86;
    bodies.current.forEach((b, i) => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < b.hw) {
        b.x = b.hw;
        b.vx = Math.abs(b.vx) * damp;
      } else if (b.x > W - b.hw) {
        b.x = W - b.hw;
        b.vx = -Math.abs(b.vx) * damp;
      }
      if (b.y < b.hh) {
        b.y = b.hh;
        b.vy = Math.abs(b.vy) * damp;
      } else if (b.y > H - b.hh) {
        b.y = H - b.hh;
        b.vy = -Math.abs(b.vy) * damp;
      }
      const el = imgRefs.current[i];
      if (el) {
        const rot = Math.sin(performance.now() / 480 + i * 0.7) * 6;
        el.style.transform = `translate3d(${b.x}px,${b.y}px,0) translate(-50%,-50%) rotate(${rot}deg)`;
      }
    });
  });

  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[4] overflow-hidden" aria-hidden>
      {photoSlots.map((slot, i) => (
        <img
          key={slot.id}
          ref={(el) => {
            imgRefs.current[i] = el;
          }}
          src={slot.src}
          alt=""
          draggable={false}
          width={slot.size}
          className="gpu-layer absolute left-0 top-0 rounded-lg border border-white/45 object-cover shadow-lg"
          style={{
            width: slot.size,
            aspectRatio: "4/5",
            height: "auto",
            willChange: "transform",
            boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
          }}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// SPARKLES
// ─────────────────────────────────────────────
const Sparkles = () => {
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
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
      <p className="text-fuchsia-700/80 text-sm uppercase tracking-widest mb-4 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-full px-1">
        {units.map((u) => (
          <GlassCard key={u.label} className="px-3 py-3 sm:px-4 min-w-[52px] sm:min-w-[64px]">
            <div className="text-3xl font-bold text-fuchsia-900" style={{ fontFamily: "'Space Mono', monospace" }}>
              {String(u.val).padStart(2, "0")}
            </div>
            <div className="text-xs text-fuchsia-600/80 mt-1 uppercase tracking-wider font-medium">{u.label}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

const ClosingFooter = () => (
  <motion.div className="w-full max-w-xl mt-6 mb-14 px-1 scroll-reveal-mask" {...scrollUpReveal}>
    <GlassCard className="p-5 sm:p-6 text-center border-pink-100">
      <p className="text-fuchsia-900/85 text-sm sm:text-base leading-relaxed font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {CLOSING_SENTIMENT}
      </p>
      <p
        className="mt-6 pt-5 border-t border-pink-200/25 text-fuchsia-900/90 text-sm sm:text-[15px] leading-relaxed italic"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {NEXT_BIRTHDAY_PROMISE}
      </p>
    </GlassCard>
  </motion.div>
);

// ─────────────────────────────────────────────
// 3D tilt wrapper (birthday hero)
// ─────────────────────────────────────────────
const BirthdayHero3D = ({ children }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [finePointer, setFinePointer] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const onMove = (e) => {
    if (!finePointer) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: py * -11, ry: px * 14 });
  };
  const reset = () => setTilt({ rx: 0, ry: 0 });
  return (
    <div
      ref={ref}
      className="mb-6 w-full max-w-4xl mx-auto px-1"
      style={{ perspective: "1200px" }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const { mobile } = useViewport();
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
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    onLogin(username.trim(), password, gender);
  };

  const inputBase =
    "w-full px-4 py-3.5 rounded-xl text-fuchsia-950 placeholder-fuchsia-300 outline-none transition-all duration-200 text-sm border border-pink-200 bg-white/95";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(165deg,#fff7fb 0%,#fef9c3 38%,#e0f2fe 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(251,207,232,0.65), transparent), radial-gradient(ellipse 50% 45% at 100% 100%, rgba(167,243,208,0.45), transparent)",
        }}
      />
      <ParticleCanvas count={mobile ? 14 : 22} color="#f472b6" />

      <motion.div
        className="relative w-full max-w-[min(380px,calc(100vw-1.25rem))] mx-auto rounded-2xl border border-pink-200/90 bg-white/92 shadow-[0_20px_56px_rgba(236,72,153,0.16)] backdrop-blur-xl"
        style={{ zIndex: 10 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="px-5 py-7 sm:px-8 sm:py-9">
          <h1 className="text-center text-2xl font-bold text-fuchsia-950 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your surprise
          </h1>
          <p className="text-center text-xs text-fuchsia-700/75 mb-7 font-medium">Name · birthday · continue</p>

          <div className="space-y-4">
            <div>
              <label
                className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${focusedField === "name" ? "text-sky-600" : "text-fuchsia-600/70"}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                placeholder="How we’ll cheer for you"
                className={inputBase}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderColor: focusedField === "name" ? "rgba(14,165,233,0.65)" : undefined,
                  boxShadow: focusedField === "name" ? "0 0 0 3px rgba(14,165,233,0.2)" : "none",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <label
                className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${focusedField === "dob" ? "text-sky-600" : "text-fuchsia-600/70"}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Birthday
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
                  borderColor: focusedField === "dob" ? "rgba(14,165,233,0.65)" : undefined,
                  boxShadow: focusedField === "dob" ? "0 0 0 3px rgba(14,165,233,0.2)" : "none",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-600/80 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Title
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: GENDER.BOY, label: "Male", sub: "" },
                  { value: GENDER.GIRL, label: "Female", sub: "" },
                  { value: GENDER.NEUTRAL, label: "Neutral", sub: "" },
                ].map((opt) => {
                  const active = gender === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGender(opt.value)}
                      className="py-3 px-1 rounded-xl text-center text-xs font-semibold transition-all border min-h-[44px] flex flex-col justify-center"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        background: active ? "linear-gradient(135deg,rgba(251,207,232,0.9),rgba(254,249,255,0.95))" : "rgba(255,255,255,0.75)",
                        borderColor: active ? "rgba(236,72,153,0.55)" : "rgba(251,207,232,0.9)",
                        color: active ? "#86198f" : "#a21caf",
                      }}
                    >
                      <span className="block">{opt.label}</span>
                      {opt.sub ? <span className="block text-[10px] text-fuchsia-600/70 mt-0.5 font-medium">{opt.sub}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-sm text-rose-600 flex items-center gap-2 font-medium"
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
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: loading ? "#cbd5e1" : "linear-gradient(90deg,#ec4899,#a855f7,#38bdf8)",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 12px 32px rgba(236,72,153,0.35)",
                border: "none",
              }}
              whileHover={!loading ? { filter: "brightness(1.05)" } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2 text-slate-600">
                  <motion.span
                    className="inline-block h-4 w-4 border-2 border-fuchsia-400 border-t-fuchsia-900 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                  />
                  One moment…
                </span>
              ) : (
                "Continue"
              )}
            </motion.button>
          </div>

          <p className="text-center text-fuchsia-600/45 text-[10px] mt-5 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            On your device only.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────
// HAPPY BIRTHDAY PAGE
// ─────────────────────────────────────────────
const BirthdayPage = ({ displayName, dob, rawName }) => {
  const wish = generateWish(displayName);
  const showPriyaPhoto = isPriyaExclusiveProfile(rawName, dob);
  const { mobile } = useViewport();

  return (
    <div
      className="min-h-screen relative overflow-hidden scroll-reveal-mask cursor-site"
      style={{
        background:
          "linear-gradient(180deg,#fffbeb 0%,#fce7f3 25%,#e0f2fe 55%,#fef9c3 100%)",
      }}
    >
      <ParticleCanvas count={mobile ? 38 : 70} color="#fb7185" zIndex={0} />
      <ParticleCanvas count={mobile ? 14 : 26} color="#fde68a" zIndex={3} />
      <ConfettiCanvas />
      <Sparkles />
      <Balloons />
      {showPriyaPhoto ? <PhotoEdgeBounceField active extraSrcs={PRIYA_PHOTO_ANIMATION_SRCS} /> : null}

      <div
        className="relative z-10 flex flex-col items-center pt-10 sm:pt-14 pb-24 px-3 sm:px-4"
        style={{ minHeight: "100vh" }}
      >
        <BirthdayHero3D>
          <motion.div className="text-center mb-2" {...scrollUpReveal}>
            <motion.div
              className="text-5xl sm:text-7xl md:text-8xl font-black mb-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                background: "linear-gradient(135deg,#f59e0b,#ec4899,#a855f7,#0ea5e9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 4px 0 rgba(251,191,36,0.35))",
                transform: "translateZ(24px)",
              }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              Happy Birthday!
            </motion.div>
            <div
              className="text-xl sm:text-3xl md:text-4xl font-bold text-fuchsia-900 drop-shadow-sm"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.02em", transform: "translateZ(12px)" }}
            >
              {displayName} 🎈
            </div>
          </motion.div>

          <motion.div className="flex justify-center" style={{ transform: "translateZ(40px)" }} {...scrollUpReveal}>
            <CuttingCake variant="party" />
          </motion.div>
        </BirthdayHero3D>

        <LifeQuoteLine />

        <motion.div className="w-full max-w-lg mb-8" {...scrollUpReveal}>
          <GlassCard className="p-6 sm:p-7 text-center border-amber-100">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-fuchsia-900 text-base sm:text-lg leading-snug font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <TypingText text={wish} speed={22} />
            </p>
          </GlassCard>
        </motion.div>

        <motion.div className="w-full max-w-md mb-6" {...scrollUpReveal}>
          <GlassCard className="p-5 text-center border-violet-100">
            <p className="text-fuchsia-800/90 text-sm font-medium italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              Smiles today, memories tomorrow.
            </p>
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
  const { mobile } = useViewport();
  const days = getDaysUntil(dob);
  const advanceWish = `${displayName}, your day is in ${days} days — we’re already celebrating you.`;

  return (
    <div
      className="min-h-screen relative overflow-hidden scroll-reveal-mask cursor-site"
      style={{
        background: "linear-gradient(180deg,#ecfeff 0%,#eef2ff 40%,#fdf4ff 100%)",
      }}
    >
      <ParticleCanvas count={mobile ? 32 : 56} color="#22d3ee" />
      <Sparkles />

      <div
        className="fixed pointer-events-none inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 35%,rgba(34,211,238,0.2),transparent 72%)" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 py-16 sm:py-20 w-full max-w-[100vw]">
        <motion.div className="text-center mb-10" {...scrollUpReveal}>
          <div className="text-6xl mb-4">🎁</div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg,#0891b2,#6366f1,#c026d3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Almost your day!
          </h1>
          <p className="text-lg text-cyan-900/80 font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {displayName}
          </p>
        </motion.div>

        <LifeQuoteLine tone="cyan" />

        <motion.div className="flex gap-8 mb-12 flex-wrap justify-center" {...scrollUpReveal}>
          <GiftBox delay={0} color="#8b5cf6" />
          <GiftBox delay={0.5} color="#06b6d4" />
          <GiftBox delay={1} color="#ec4899" />
        </motion.div>

        <motion.div className="mb-10 w-full max-w-lg" {...scrollUpReveal}>
          <CountdownTimer targetDDMM={dob} label="Countdown" />
        </motion.div>

        <motion.div className="w-full max-w-lg" {...scrollUpReveal}>
          <GlassCard className="p-6 sm:p-7 text-center border-cyan-100">
            <p className="text-fuchsia-900 text-base sm:text-lg leading-snug font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <TypingText text={advanceWish} speed={22} requireVisible />
            </p>
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
  const { mobile } = useViewport();
  const days = getDaysSince(dob);
  const belatedWish = `${displayName}, belated happy birthday — love, just fashionably late.`;

  return (
    <div
      className="min-h-screen relative overflow-hidden scroll-reveal-mask cursor-site"
      style={{
        background: "linear-gradient(180deg,#e0f2fe 0%,#ede9fe 45%,#fff7ed 100%)",
      }}
    >
      <ParticleCanvas count={mobile ? 24 : 40} color="#64748b" />
      <HeavyRainCanvas />

      <div
        className="fixed pointer-events-none inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 35%,rgba(148,163,184,0.22),transparent 72%)" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 py-16 sm:py-20 w-full max-w-[100vw]">
        <motion.div className="text-center mb-10" {...scrollUpReveal}>
          <motion.div className="text-6xl sm:text-7xl mb-4" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
            💌
          </motion.div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg,#2563eb,#7c3aed,#db2777)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Belated cheers!
          </h1>
          <p className="text-lg text-sky-900/80 font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {displayName}
          </p>
        </motion.div>

        <LifeQuoteLine tone="sky" />

        <motion.div className="mb-8" {...scrollUpReveal}>
          <GlassCard className="px-6 sm:px-10 py-6 text-center border-sky-100">
            <p className="text-sky-700/80 text-xs uppercase tracking-widest mb-1 font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Birthday was
            </p>
            <p className="text-fuchsia-900 text-4xl font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
              {days}
            </p>
            <p className="text-sky-700/80 text-xs uppercase tracking-widest mt-1 font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              days ago
            </p>
          </GlassCard>
        </motion.div>

        <motion.div className="mb-10 w-full max-w-xl flex justify-center px-2" {...scrollUpReveal}>
          <CuttingCake variant="belated" />
        </motion.div>

        <motion.div className="w-full max-w-lg mb-8" {...scrollUpReveal}>
          <GlassCard className="p-6 sm:p-7 text-center border-violet-100">
            <p className="text-fuchsia-900 text-base sm:text-lg leading-snug font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <TypingText text={belatedWish} speed={22} requireVisible />
            </p>
          </GlassCard>
        </motion.div>

        <motion.div className="w-full max-w-md" {...scrollUpReveal}>
          <GlassCard className="px-6 py-5 border-indigo-100">
            <p className="text-center text-fuchsia-800/90 text-sm font-medium italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              Late wishes still sparkle.
            </p>
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
    <div className="min-h-[100dvh]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div key="login" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : result === "birthday" ? (
          <motion.div key="bday" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <BirthdayPage displayName={user.displayName} dob={user.dob} rawName={user.name} />
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
