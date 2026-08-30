import { supabase } from "@/integrations/supabase/client";

export interface AppNotification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: number;
}

function rowToNotif(r: any): AppNotification {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    type: r.type,
    link: r.link,
    read: r.read,
    createdAt: new Date(r.created_at).getTime(),
  };
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("app_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("fetchNotifications", error);
    return [];
  }
  return (data || []).map(rowToNotif);
}

export async function pushNotification(
  userId: string,
  n: { title: string; body?: string; type?: string; link?: string },
) {
  const { error } = await supabase.from("app_notifications").insert({
    user_id: userId,
    title: n.title,
    body: n.body ?? null,
    type: n.type ?? "system",
    link: n.link ?? null,
  });
  if (error) console.error("pushNotification", error);
}

export async function markAllRead(userId: string) {
  await supabase.from("app_notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

export async function unreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("app_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count || 0;
}

export function subscribeNotifications(
  userId: string,
  onInsert: (n: AppNotification) => void,
) {
  const channel = supabase
    .channel(`notif_${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "app_notifications", filter: `user_id=eq.${userId}` },
      (payload) => onInsert(rowToNotif(payload.new)),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function seedWelcomeIfEmpty(userId: string) {
  const existing = await fetchNotifications(userId);
  if (existing.length > 0) return;
  await pushNotification(userId, {
    title: "👋 Welcome to Sonara",
    body: "You're in! Tap the bell anytime to see new followers, song approvals, and updates.",
    type: "system",
  });
}
