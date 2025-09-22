import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { averageCentroid, pickFallback, rankBySimilarity, toVector, type TrackMeta } from "@/lib/recommend";

async function getUserAccessToken() {
	const supabase = await getSupabaseServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session?.provider_token || session?.access_token || null;
}

type SpotifyArtist = { name?: string };
type SpotifyImage = { url?: string };
type SpotifyTrackResponse = {
	name?: string;
	artists?: SpotifyArtist[];
	album?: { images?: SpotifyImage[] };
};

async function fetchSpotifyMeta(spotifyId: string, token: string | null): Promise<Partial<TrackMeta>> {
	if (!token) return {};
	try {
		const res = await fetch(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) return {};
		const t = (await res.json()) as SpotifyTrackResponse;
		return {
			name: t.name,
			artist: t.artists?.map((a) => a.name).filter(Boolean).join(", ") ?? undefined,
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
		const f = (await res.json()) as Record<string, unknown>;
		return {
			danceability: Number(f.danceability ?? NaN),
			energy: Number(f.energy ?? NaN),
			valence: Number(f.valence ?? NaN),
			tempo: Number(f.tempo ?? NaN),
			acousticness: Number(f.acousticness ?? NaN),
			instrumentalness: Number(f.instrumentalness ?? NaN),
			liveness: Number(f.liveness ?? NaN),
			speechiness: Number(f.speechiness ?? NaN),
		};
	} catch {
		return null;
	}
}

type TrackRel = { spotify_id: string; metadata: unknown };

type FeedbackRow = {
	liked: boolean;
	tracks: TrackRel | TrackRel[] | null;
};

type TrackRow = { id: string; spotify_id: string; metadata: unknown };

function asTrackMeta(obj: unknown): Partial<TrackMeta> {
	return obj && typeof obj === "object" ? (obj as Partial<TrackMeta>) : {};
}

function normalizeTrackRel(rel: FeedbackRow["tracks"]): TrackRel | null {
	if (!rel) return null;
	if (Array.isArray(rel)) return rel[0] ?? null;
	return rel;
}

export async function GET() {
	try {
		const supabase = await getSupabaseServerClient();
		const token = await getUserAccessToken();

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ tracks: [] });

		const { data: feedbackRowsRaw } = await supabase
			.from("user_feedback")
			.select("liked, tracks:track_id(spotify_id, metadata)")
			.eq("user_id", user.id)
			.order("timestamp", { ascending: false })
			.limit(200);
		const feedbackRows = (feedbackRowsRaw as unknown as FeedbackRow[]) ?? [];

		const likedVectors: number[][] = [];
		const dislikedVectors: number[][] = [];

		for (const row of feedbackRows) {
			const tRel = normalizeTrackRel(row.tracks);
			const tMeta = asTrackMeta(tRel?.metadata);
			const vec = toVector(tMeta.audio_features);
			if (!vec) continue;
			if (row.liked) likedVectors.push(vec);
			else dislikedVectors.push(vec);
		}

		const centroid = averageCentroid(likedVectors);

		const { data: unratedRaw } = await supabase
			.from("tracks")
			.select("id, spotify_id, metadata")
			.limit(200);
		const unrated = (unratedRaw ?? []) as TrackRow[];

		const candidates: TrackMeta[] = [];
		for (const t of unrated) {
			let meta = asTrackMeta(t.metadata);
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
	} catch {
		return NextResponse.json({ error: "failed" }, { status: 500 });
	}
}
