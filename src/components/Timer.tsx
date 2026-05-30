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
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const colors = {
    presente: "text-green-600",
    atraso: "text-yellow-500",
    expired: "text-red-500",
  };

  const labels = {
    presente: "PRESENTE",
    atraso: "ATRASO",
    expired: "CERRADA",
  };

  return (
    <div className="text-center">
      <p className={`text-6xl font-mono font-bold ${colors[phase]}`}>{display}</p>
      <p className={`text-xl mt-2 ${colors[phase]}`}>{labels[phase]}</p>
    </div>
  );
}
