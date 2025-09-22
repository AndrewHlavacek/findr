import { Button } from "@/components/ui/button";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
	const supabase = getSupabaseServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (session) {
		redirect("/dashboard");
	}

	async function signInWithSpotify() {
		"use server";
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "spotify",
			options: {
				redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
				scopes: "user-read-email user-read-private user-top-read user-read-recently-played",
			},
		});
		if (error) throw error;
		return redirect(data.url ?? "/");
	}

	return (
		<div className="min-h-screen grid place-items-center bg-black text-white">
			<div className="flex flex-col items-center gap-6">
				<Image src="/findr-logo.svg" alt="findr" width={80} height={80} />
				<h1 className="text-2xl font-semibold">Welcome to findr</h1>
				<form action={signInWithSpotify}>
					<Button type="submit" className="gap-2">
						<Image src="/spotify-white.svg" alt="Spotify" width={18} height={18} />
						Login with Spotify
					</Button>
				</form>
			</div>
		</div>
	);
}
