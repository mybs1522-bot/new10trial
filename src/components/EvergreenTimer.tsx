import { useState, useEffect } from "react";
import { Clock, ArrowRight } from "lucide-react";

const TOTAL_SECONDS = 2 * 3600 + 27 * 60 + 32;
const STORAGE_KEY = "evergreen_timer_start";

function getTimeLeft(): number {
  let start = localStorage.getItem(STORAGE_KEY);
  if (!start) {
    start = String(Date.now());
    localStorage.setItem(STORAGE_KEY, start);
  }
  const elapsed = Math.floor((Date.now() - Number(start)) / 1000);
  return TOTAL_SECONDS - (elapsed % TOTAL_SECONDS);
}

function getTimeParts(s: number) {
  return {
    h: Math.floor(s / 3600),
    m: Math.floor((s % 3600) / 60),
    sec: s % 60,
  };
}

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display font-bold text-foreground text-sm tabular-nums">{value}</span>
      <span className="text-[7px] uppercase tracking-wider text-muted-foreground/50 font-semibold">{label}</span>
    </div>
  );
}

export function EvergreenTimer({ onCtaClick }: { onCtaClick?: () => void }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const { h, m, sec } = getTimeParts(timeLeft);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md px-4 pb-4">
        <button
          onClick={onCtaClick}
          className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl bg-foreground text-white shadow-lift hover:shadow-green-lg transition-all duration-300 group"
        >
          <Clock className="h-3.5 w-3.5 text-white/50 flex-shrink-0" />
          <span className="text-[10px] font-medium text-white/50">Offer ends in</span>

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tabular-nums text-white">{String(h).padStart(2, "0")}</span>
            <span className="text-white/30 text-xs font-bold">:</span>
            <span className="text-sm font-bold tabular-nums text-white">{String(m).padStart(2, "0")}</span>
            <span className="text-white/30 text-xs font-bold">:</span>
            <span className="text-sm font-bold tabular-nums text-accent">{String(sec).padStart(2, "0")}</span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
