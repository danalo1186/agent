"use client";

import { useRef } from "react";
import SignaturePad from "signature_pad";

export default function SignaturePadComponent({ onSave }: { onSave: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);

  function initPad() {
    if (canvasRef.current && !padRef.current) {
      padRef.current = new SignaturePad(canvasRef.current);
    }
  }

  function handleSave() {
    if (padRef.current) {
      const dataUrl = padRef.current.toDataURL();
      onSave(dataUrl);
    }
  }

  function handleClear() {
    padRef.current?.clear();
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="border w-full"
        onMouseEnter={initPad}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

