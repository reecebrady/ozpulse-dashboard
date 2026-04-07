import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import type { Database } from "./schema";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return supabaseCreateClient<Database>(supabaseUrl, supabaseKey);
}
