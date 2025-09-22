"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
	if (client) return client;
	if (!env.supabaseUrl || !env.supabaseAnonKey) {
		throw new Error("Missing Supabase env vars");
	}
	client = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
	return client;
}
