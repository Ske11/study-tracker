import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const ENV = import.meta.env.MODE;

export async function signInWithGitHub() {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
