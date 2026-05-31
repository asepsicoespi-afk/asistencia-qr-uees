"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  endTime: number;
  onExpire: () => void;
  presenteDeadline: number;
}

export default function Timer({ endTime, onExpire, presenteDeadline }: TimerProps) {
  const [remaining, setRemaining] = useState(0);
  const [phase, setPhase] = useState<"presente" | "atraso" | "expired">("presente");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, endTime - now);
      setRemaining(left);

      if (now >= endTime) {
        setPhase("expired");
        onExpire();
        clearInterval(interval);
      } else if (now >= presenteDeadline) {
        setPhase("atraso");
      } else {
        setPhase("presente");
      }
    }, 200);

    return () => clearInterval(interval);
  }, [endTime, presenteDeadline, onExpire]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const colors = {
    presente: "text-[var(--present)]",
    atraso: "text-[var(--late)]",
    expired: "text-[var(--absent)]",
  };

  const bgColors = {
    presente: "bg-[var(--present)]/10",
    atraso: "bg-[var(--late)]/10",
    expired: "bg-[var(--absent)]/10",
  };

  const labels = {
    presente: "PRESENTE",
    atraso: "ATRASO",
    expired: "CERRADA",
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-baseline gap-1 ${colors[phase]}`}>
        <span className="text-7xl font-mono font-bold tabular-nums">{minutes}</span>
        <span className="text-5xl font-mono font-bold animate-pulse">:</span>
        <span className="text-7xl font-mono font-bold tabular-nums">
          {seconds.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="mt-3">
        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${colors[phase]} ${bgColors[phase]}`}>
          {labels[phase]}
        </span>
      </div>
    </div>
  );
}
