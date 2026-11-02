"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional extra content rendered below the message (e.g. a password field) */
  children?: React.ReactNode;
}

const confirmStyles = {
  danger: "bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]",
  warning: "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]",
  default: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(76,192,63,0.4)]",
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  children,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-md rounded-3xl bg-[#08100E] border border-white/[0.08] backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] p-7 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {variant === "danger" && (
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
            )}
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">{message}</p>

        {children && <div className="space-y-3">{children}</div>}

        <div className="flex justify-end gap-3 pt-1">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-slate-300 text-sm font-medium transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${confirmStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
