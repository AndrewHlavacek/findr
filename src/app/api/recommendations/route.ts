import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { averageCentroid, pickFallback, rankBySimilarity, toVector, type TrackMeta } from "@/lib/recommend";

async function getUserAccessToken() {
	// Access tokens from Supabase cookies are set by the OAuth flow; expose via getSession
	const supabase = getSupabaseServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session?.provider_token || session?.access_token || null;
}

async function fetchSpotifyMeta(spotifyId: string, token: string | null): Promise<Partial<TrackMeta>> {
	if (!token) return {};
	try {
		const res = await fetch(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) return {};
		const t = await res.json();
		return {
			name: t.name,
			artist: t.artists?.map((a: any) => a.name).join(", ") ?? undefined,
			album_art: t.album?.images?.[0]?.url,
		};
	} catch {
		return {};
	}
}

async function fetchSpotifyAudioFeatures(spotifyId: string, token: string | null) {
	if (!token) return null;
	try {
		const res = await fetch(`https://api.spotify.com/v1/audio-features/${spotifyId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) return null;
		const f = await res.json();
		return {
			danceability: f.danceability,
			energy: f.energy,
			valence: f.valence,
			tempo: f.tempo,
			acousticness: f.acousticness,
			instrumentalness: f.instrumentalness,
			liveness: f.liveness,
			speechiness: f.speechiness,
		};
	} catch {
		return null;
	}
}

export async function GET() {
	try {
		const supabase = getSupabaseServerClient();
		const token = await getUserAccessToken();

		// Get current user
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ tracks: [] });

		// Fetch user feedback joined with minimal track info
		const { data: feedbackRows } = await supabase
			.from("user_feedback")
			.select("liked, tracks:track_id(spotify_id, metadata)")
			.eq("user_id", user.id)
			.order("timestamp", { ascending: false })
			.limit(200);
		const likedVectors: number[][] = [];
		const dislikedVectors: number[][] = [];

		for (const row of feedbackRows || []) {
			const tMeta = (row as any).tracks?.metadata || {};
			const vec = toVector(tMeta.audio_features);
			if (!vec) continue;
			if ((row as any).liked) likedVectors.push(vec);
			else dislikedVectors.push(vec);
		}

		// Compute centroid; if none, fall back to recent liked tracks' metadata enrichment
		let centroid = averageCentroid(likedVectors);

		// Candidate pool: tracks not rated by user. Keep a small sample for now for speed.
		const { data: unrated } = await supabase
			.from("tracks")
			.select("id, spotify_id, metadata")
			.limit(200);

		// Enrich missing metadata features where possible (best-effort)
		const candidates: TrackMeta[] = [];
		for (const t of unrated || []) {
			let meta = (t.metadata as any) || {};
			if (!meta.name || !meta.artist || !meta.album_art) {
				meta = { ...meta, ...(await fetchSpotifyMeta(t.spotify_id, token)) };
			}
			if (!meta.audio_features) {
				const features = await fetchSpotifyAudioFeatures(t.spotify_id, token);
				if (features) meta.audio_features = features;
			}
			candidates.push({
				spotify_id: t.spotify_id,
				name: meta.name,
				artist: meta.artist,
				album_art: meta.album_art,
				audio_features: meta.audio_features,
			});
		}

		let ranked: TrackMeta[];
		if (centroid) {
			ranked = rankBySimilarity(centroid, candidates.filter((c) => toVector(c.audio_features)), 20);
		} else {
			ranked = pickFallback(candidates, 20);
		}

		return NextResponse.json({ tracks: ranked });
	} catch (e) {
		return NextResponse.json({ error: "failed" }, { status: 500 });
	}
}
