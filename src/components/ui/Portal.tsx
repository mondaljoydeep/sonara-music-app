import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Portals children into document.body so `position: fixed` escapes any ancestor
 * that has `transform`, `perspective`, `filter` or `will-change` (which turn a
 * fixed descendant into an ancestor-contained element).
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
