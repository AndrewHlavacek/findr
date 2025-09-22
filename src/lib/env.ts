export const env = {
	appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
	supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
	supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
	spotifyClientId: process.env.SPOTIFY_CLIENT_ID || "",
	spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
	spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI || "",
	recommendationsUrl: process.env.RECOMMENDATIONS_URL || "",
};

export function assertEnv() {
	if (!env.supabaseUrl || !env.supabaseAnonKey) {
		throw new Error("Missing Supabase env vars");
	}
}
