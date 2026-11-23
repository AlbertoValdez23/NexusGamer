import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const edgeBase = `https://${projectId}.supabase.co/functions/v1/make-server-77879402`;

export async function loadCloudState(userId: string) {
  const { data, error } = await supabase
    .from("shop_states")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.state ?? null;
}

export async function saveCloudState(userId: string, state: unknown) {
  const { error } = await supabase
    .from("shop_states")
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}
