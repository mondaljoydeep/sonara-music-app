import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchNotifications,
  markAllRead,
  subscribeNotifications,
  seedWelcomeIfEmpty,
  type AppNotification,
} from "@/services/notificationsService";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationsBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    let cancel = false;
    (async () => {
      await seedWelcomeIfEmpty(user.id);
      const list = await fetchNotifications(user.id);
      if (!cancel) setItems(list);
    })();
    const unsub = subscribeNotifications(user.id, (n) => {
      setItems((prev) => [n, ...prev].slice(0, 50));
    });
    return () => {
      cancel = true;
      unsub();
    };
  }, [user?.id]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      setTimeout(() => document.addEventListener("mousedown", onClick), 0);
      return () => document.removeEventListener("mousedown", onClick);
    }
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open && unread > 0 && user) {
      await markAllRead(user.id);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-full bg-[#1a1a24] hover:bg-[#22222e] flex items-center justify-center text-[#b3b3b3]"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#1ed760] text-black text-[10px] font-bold flex items-center justify-center px-1">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-2xl bg-[#181824]/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-white/5 text-sm font-semibold flex items-center justify-between">
            <span>Notifications</span>
            {!user && <span className="text-[10px] text-[#b3b3b3]">Sign in to receive</span>}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[#b3b3b3]">No notifications yet</div>
          ) : (
            <ul className="py-1">
              {items.map((n) => (
                <li
                  key={n.id}
                  className="px-4 py-3 hover:bg-white/5 cursor-default border-b border-white/[0.03] last:border-0"
                >
                  <div className="text-sm font-semibold">{n.title}</div>
                  {n.body && <div className="text-xs text-[#b3b3b3] mt-0.5">{n.body}</div>}
                  <div className="text-[10px] text-[#535353] mt-1">{timeAgo(n.createdAt)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
