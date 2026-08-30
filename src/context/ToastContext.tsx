import { createContext, useCallback, useContext, useState, ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
}

const ToastContext = createContext<{ toast: (m: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setItems([{ id, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-32 lg:bottom-28 z-[100] pointer-events-none flex flex-col items-center gap-2">
        {items.map((i) => (
          <div
            key={i.id}
            className="px-5 py-3 rounded-full bg-[#22222e] border border-white/10 text-sm text-white shadow-2xl animate-fade-in"
          >
            {i.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used in ToastProvider");
  return ctx.toast;
}
