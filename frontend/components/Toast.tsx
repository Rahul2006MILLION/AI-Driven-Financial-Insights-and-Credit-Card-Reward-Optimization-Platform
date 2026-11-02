"use client";

import React, { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  error: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  warning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  info: "bg-sky-500/15 border-sky-500/30 text-sky-300",
};

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = "success",
  duration = 3500,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = icons[variant];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-sm font-medium max-w-sm w-full ${styles[variant]}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="p-0.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ToastContainer — place once in layout or use inline
// ---------------------------------------------------------------------------

export interface ToastItem {
  id: string;
  message: string;
  variant?: ToastVariant;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast
            message={t.message}
            variant={t.variant}
            onClose={() => onClose(t.id)}
          />
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// useToast hook
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
