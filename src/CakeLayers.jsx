import { motion } from "framer-motion";

/** Realistic tiered cake with CSS 3D perspective — slow orbit, no interaction */
export function CuttingCake({ variant = "party" }) {
  const belated = variant === "belated";
  const topIcing = belated
    ? "linear-gradient(135deg,#fff1f2 0%,#fda4af 45%,#e11d48 100%)"
    : "linear-gradient(135deg,#fdf2f8 0%,#fbcfe8 40%,#db2777 100%)";
  const midIcing = "linear-gradient(135deg,#faf5ff 0%,#ddd6fe 35%,#7c3aed 95%)";
  const baseIcing = belated
    ? "linear-gradient(135deg,#f0fdfa 0%,#5eead4 40%,#0f766e 100%)"
    : "linear-gradient(135deg,#ecfeff 0%,#7dd3fc 38%,#0284c7 100%)";

  return (
    <div
      className="mx-auto flex justify-center py-2"
      style={{ perspective: "1300px", perspectiveOrigin: "50% 28%" }}
    >
      <motion.div
        className="relative gpu-layer"
        style={{
          width: "min(260px, 72vw)",
          height: "min(300px, 52vw)",
          transformStyle: "preserve-3d",
        }}
        initial={false}
        animate={{ rotateY: [-22, 26, -22], rotateX: [10, 14, 10] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Soft ground shadow */}
        <div
          className="pointer-events-none absolute left-1/2 bottom-[6%] h-10 w-[88%] -translate-x-1/2 rounded-[50%] opacity-40 blur-md"
          style={{
            background: "radial-gradient(ellipse at center, rgba(15,23,42,0.45), transparent 70%)",
            transform: "rotateX(82deg)",
            transformOrigin: "center center",
          }}
        />

        {/* Pedestal plate (3D disc) */}
        <div
          className="pointer-events-none absolute left-1/2 bottom-[4%]"
          style={{
            width: "108%",
            height: "42px",
            marginLeft: "-54%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 50% 28%, #ffffff 0%, #e2e8f0 42%, #94a3b8 100%)",
            transform: "rotateX(76deg)",
            transformOrigin: "center bottom",
            boxShadow: "0 24px 40px rgba(15,23,42,0.25), inset 0 2px 0 rgba(255,255,255,0.85)",
          }}
        />

        {/* Cake stack — lifted in 3D */}
        <div
          className="absolute inset-x-0 bottom-[10%] top-[8%] flex flex-col items-center justify-end"
          style={{ transform: "rotateX(8deg)", transformStyle: "preserve-3d" }}
        >
          {/* Candles — slightly toward camera */}
          <div
            className="relative z-30 mb-1 flex justify-center gap-4"
            style={{ transform: "translateZ(42px)" }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  className="h-2 w-2 rounded-full bg-amber-200"
                  style={{
                    boxShadow: "0 0 10px #fde047, 0 0 18px rgba(251,191,36,0.65)",
                  }}
                  animate={{ opacity: [1, 0.55, 1], scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.45 + i * 0.06, repeat: Infinity }}
                />
                <div
                  className="mt-0.5 h-5 w-[5px] rounded-sm"
                  style={{
                    background: "linear-gradient(180deg,#fef9c3,#ca8a04)",
                    boxShadow: "inset -1px 0 2px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top tier — smallest */}
          <div className="relative z-[25] w-[42%]" style={{ transform: "translateZ(28px)" }}>
            <div
              className="pointer-events-none absolute -top-2 left-[8%] right-[8%] h-5 rounded-[50%]"
              style={{
                background: "linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.2))",
                transform: "scaleY(0.45)",
                transformOrigin: "center bottom",
              }}
            />
            <div
              className="relative h-[48px] rounded-[18px] border border-rose-300/40"
              style={{
                background: topIcing,
                boxShadow:
                  "inset 0 -14px 22px rgba(0,0,0,0.12), inset 8px 0 18px rgba(255,255,255,0.35), 0 16px 28px rgba(190,24,93,0.22)",
              }}
            />
          </div>

          {/* Middle tier */}
          <div className="relative z-[20] -mt-3 w-[62%]" style={{ transform: "translateZ(12px)" }}>
            <div
              className="pointer-events-none absolute -top-2 left-[6%] right-[6%] h-6 rounded-[50%]"
              style={{
                background: "linear-gradient(180deg,rgba(255,255,255,0.9),transparent)",
                transform: "scaleY(0.42)",
                transformOrigin: "center bottom",
              }}
            />
            <div
              className="relative h-[58px] rounded-[14px] border border-violet-300/35"
              style={{
                background: midIcing,
                boxShadow:
                  "inset 0 -18px 26px rgba(0,0,0,0.1), inset 10px 0 22px rgba(255,255,255,0.28), 0 20px 32px rgba(91,33,182,0.2)",
              }}
            />
          </div>

          {/* Base tier */}
          <div className="relative z-[15] -mt-3 w-[86%]" style={{ transform: "translateZ(0px)" }}>
            <div
              className="pointer-events-none absolute -top-2 left-[5%] right-[5%] h-7 rounded-[50%]"
              style={{
                background: "linear-gradient(180deg,rgba(255,255,255,0.88),transparent)",
                transform: "scaleY(0.4)",
                transformOrigin: "center bottom",
              }}
            />
            <div
              className="relative h-[76px] rounded-[20px] border border-cyan-300/35"
              style={{
                background: baseIcing,
                boxShadow:
                  "inset 0 -22px 32px rgba(0,0,0,0.12), inset 12px 0 26px rgba(255,255,255,0.3), 0 26px 40px rgba(8,47,73,0.22)",
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
