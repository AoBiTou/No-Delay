"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface OpeningScreenProps {
  soundEnabled: boolean;
  onComplete: () => void;
}

interface ImpactWord {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

const CRACKS = [
  "M50 48 L38 32 L30 12",
  "M50 48 L61 31 L72 20 L84 8",
  "M50 48 L70 56 L88 54",
  "M50 48 L44 67 L50 88",
  "M50 48 L27 57 L9 73",
  "M38 32 L18 28 L6 20",
  "M61 31 L58 10",
  "M44 67 L27 85",
  "M70 56 L82 76 L96 83",
];

function playHit(strength: number, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(100 - strength * 3, context.currentTime);
    gain.gain.setValueAtTime(Math.min(0.08 + strength * 0.008, 0.18), context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08 + strength * 0.008);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
    oscillator.addEventListener("ended", () => void context.close());
  } catch {
    // Sound is optional; browser privacy settings may block it.
  }
}

export function OpeningScreen({ soundEnabled, onComplete }: OpeningScreenProps) {
  const [hits, setHits] = useState(0);
  const [words, setWords] = useState<ImpactWord[]>([]);
  const [broken, setBroken] = useState(false);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (finishTimer.current) clearTimeout(finishTimer.current);
  }, []);

  function hitBrick() {
    if (broken) return;
    const next = Math.min(hits + 1, 10);
    setHits(next);
    setWords((current) => [
      ...current.slice(-4),
      {
        id: Date.now() + next,
        x: 8 + Math.random() * 68,
        y: 12 + Math.random() * 62,
        rotate: -9 + Math.random() * 18,
        scale: 0.82 + Math.random() * 0.5,
      },
    ]);
    playHit(next, soundEnabled);
    if (navigator.vibrate) navigator.vibrate(next === 10 ? [50, 35, 90] : 18 + next * 2);

    if (next === 10) {
      setBroken(true);
      finishTimer.current = setTimeout(onComplete, 2100);
    }
  }

  return (
    <motion.main
      className="opening-screen"
      animate={hits > 0 && !broken ? { x: [0, -hits * 0.45, hits * 0.35, 0], y: [0, 1, -1, 0] } : {}}
      transition={{ duration: 0.18 }}
    >
      <div className="noise" />
      <header className="opening-header">
        <span>NO DELAY®</span>
        <span>启动协议 / 01</span>
      </header>

      <AnimatePresence>
        {!broken && (
          <motion.div className="opening-copy" exit={{ opacity: 0, y: -20 }}>
            <span className="eyebrow">今天还要拖吗？</span>
            <h1>打破<br />惯性。</h1>
            <p>请劈十块砖给自己鼓鼓劲</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {words.map((word) => (
          <motion.span
            key={word.id}
            className="impact-word"
            style={{ left: `${word.x}%`, top: `${word.y}%`, rotate: word.rotate }}
            initial={{ opacity: 0, scale: 2.2 }}
            animate={{ opacity: [0, 1, 1, 0], scale: word.scale }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.72, times: [0, 0.12, 0.68, 1] }}
          >
            绝不拖延
          </motion.span>
        ))}
      </AnimatePresence>

      <div className="brick-stage">
        <AnimatePresence mode="wait">
          {!broken ? (
            <motion.button
              key="brick"
              type="button"
              className="brick"
              aria-label={`击打砖块，已完成 ${hits} 次，共 10 次`}
              onClick={hitBrick}
              animate={{
                rotate: hits % 2 === 0 ? hits * 0.12 : -hits * 0.12,
                scale: 1 - hits * 0.007,
              }}
              whileTap={{ scale: 0.93 }}
              exit={{ opacity: 0, scale: 1.35, filter: "brightness(3)" }}
            >
              <span className="brick-shine" />
              <span className="brick-label">NO<br />DELAY</span>
              <svg className="cracks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {CRACKS.slice(0, hits).map((path, index) => (
                  <motion.path
                    key={path}
                    d={path}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.18 }}
                    style={{ strokeWidth: index > 5 ? 0.55 : 0.9 }}
                  />
                ))}
              </svg>
            </motion.button>
          ) : (
            <motion.div key="broken" className="break-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div
                className="break-title"
                initial={{ scale: 0.2, rotate: -8 }}
                animate={{ scale: [0.2, 1.12, 1], rotate: [-8, 2, 0] }}
                transition={{ duration: 0.55 }}
              >
                绝不拖延
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                开干。
              </motion.p>
              <div className="debris" aria-hidden="true">
                {Array.from({ length: 16 }).map((_, index) => (
                  <motion.i
                    key={index}
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos(index * 1.7) * (120 + (index % 4) * 32),
                      y: Math.sin(index * 1.7) * (90 + (index % 5) * 22),
                      rotate: index * 47,
                      opacity: 0,
                    }}
                    transition={{ duration: 1.05, ease: "easeOut" }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!broken && (
        <div className="hit-counter">
          <span>{String(hits).padStart(2, "0")} / 10</span>
          <div className="hit-track"><i style={{ width: `${hits * 10}%` }} /></div>
          <span>点击砖块</span>
        </div>
      )}
    </motion.main>
  );
}
