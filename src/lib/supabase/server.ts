import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

type MinimalCookieStore = {
	get: (name: string) => { value?: string } | undefined;
};

export async function getSupabaseServerClient(): Promise<SupabaseClient> {
	if (!env.supabaseUrl || !env.supabaseAnonKey) {
		throw new Error("Missing Supabase env vars");
	}

	function getCookie(name: string): string | undefined {
		try {
			const getter = cookies as unknown as () => MinimalCookieStore;
			const store = getter();
			return store.get(name)?.value;
		} catch {
			return undefined;
		}
	}

	return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return getCookie(name);
			},
			set() {
				// No-op in shared util
			},
			remove() {
				// No-op
			},
		},
	});
}
