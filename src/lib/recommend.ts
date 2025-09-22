export type AudioFeatures = {
	danceability?: number;
	energy?: number;
	valence?: number;
	tempo?: number;
	acousticness?: number;
	instrumentalness?: number;
	liveness?: number;
	speechiness?: number;
};

export type TrackMeta = {
	spotify_id: string;
	name?: string;
	artist?: string;
	album_art?: string;
	audio_features?: AudioFeatures;
};

const FEATURE_KEYS: Array<keyof AudioFeatures> = [
	"danceability",
	"energy",
	"valence",
	"tempo",
	"acousticness",
	"instrumentalness",
	"liveness",
	"speechiness",
];

export function toVector(features: AudioFeatures | null | undefined): number[] | null {
	if (!features) return null;
	const vec = FEATURE_KEYS.map((k) => {
		const v = features[k];
		return typeof v === "number" ? v : NaN;
	});
	if (vec.some((v) => Number.isNaN(v))) return null;
	return vec;
}

export function averageCentroid(vectors: number[][]): number[] | null {
	if (vectors.length === 0) return null;
	const dims = vectors[0].length;
	const sum = new Array(dims).fill(0);
	for (const v of vectors) {
		for (let i = 0; i < dims; i++) sum[i] += v[i];
	}
	return sum.map((s) => s / vectors.length);
}

export function cosineSimilarity(a: number[], b: number[]): number {
	let dot = 0;
	let na = 0;
	let nb = 0;
	for (let i = 0; i < a.length; i++) {
		dot += a[i] * b[i];
		na += a[i] * a[i];
		nb += b[i] * b[i];
	}
	const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
	return dot / denom;
}

export function rankBySimilarity(
	centroid: number[],
	candidates: TrackMeta[],
	limit = 10
): TrackMeta[] {
	const scored = candidates
		.map((c) => ({
			candidate: c,
			score: cosineSimilarity(centroid, toVector(c.audio_features) as number[]),
		}))
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((s) => s.candidate);
	return scored;
}

export function pickFallback(candidates: TrackMeta[], limit = 10): TrackMeta[] {
	return candidates.slice(0, limit);
}
