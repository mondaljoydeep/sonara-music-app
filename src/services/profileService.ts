import { supabase } from "@/integrations/supabase/client";

export type UserRole = "listener" | "creator";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  verified: boolean;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("getMyProfile", error);
    return null;
  }
  return data as Profile | null;
}

export async function updateMyProfile(userId: string, patch: Partial<Profile>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Profile;
}

export async function listCreators(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "creator")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("listCreators", error);
    return [];
  }
  return (data || []) as Profile[];
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  return (data as Profile) || null;
}
