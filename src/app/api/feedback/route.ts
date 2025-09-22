import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { trackSpotifyId, liked } = body as { trackSpotifyId: string; liked: boolean };
		if (!trackSpotifyId || typeof liked !== "boolean") {
			return NextResponse.json({ error: "invalid" }, { status: 400 });
		}
		const supabase = getSupabaseServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

		const { data: trackRow } = await supabase
			.from("tracks")
			.select("id")
			.eq("spotify_id", trackSpotifyId)
			.maybeSingle();
		let trackId = trackRow?.id as string | undefined;
		if (!trackId) {
			const { data: inserted, error: insertErr } = await supabase
				.from("tracks")
				.insert({ spotify_id: trackSpotifyId, metadata: {} })
				.select("id")
				.single();
			if (insertErr) throw insertErr;
			trackId = inserted.id as string;
		}

		const { error } = await supabase.from("user_feedback").insert({
			user_id: user.id,
			track_id: trackId,
			liked,
		});
		if (error) throw error;
		return NextResponse.json({ ok: true });
	} catch (e) {
		return NextResponse.json({ error: "failed" }, { status: 500 });
	}
}
