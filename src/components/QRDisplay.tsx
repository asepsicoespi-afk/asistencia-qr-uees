"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRDisplayProps {
  token: string;
}

export default function QRDisplay({ token }: QRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/asistencia/${token}`;
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [token]);

  if (!qrDataUrl) return <p>Generando QR...</p>;

  return (
    <div className="flex flex-col items-center">
      <img src={qrDataUrl} alt="QR de asistencia" className="w-80 h-80" />
      <p className="text-sm text-gray-400 mt-2 font-mono">{token.slice(0, 8)}...</p>
    </div>
  );
}
