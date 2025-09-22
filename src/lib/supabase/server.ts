"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function getSupabaseServerClient(): SupabaseClient {
	const cookieStore = cookies();
	if (!env.supabaseUrl || !env.supabaseAnonKey) {
		throw new Error("Missing Supabase env vars");
	}

	return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value;
			},
			set() {
				// No-op in server util
			},
			remove() {
				// No-op
			},
		},
	});
}
