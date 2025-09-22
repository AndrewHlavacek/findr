"use client";

import Image from "next/image";
import useSWR from "swr";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsDown, ThumbsUp, History } from "lucide-react";

type Track = {
	spotify_id: string;
	name: string;
	artist: string;
	album_art: string;
};

async function fetcher(url: string) {
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) throw new Error("Failed to fetch");
	return res.json();
}

export default function DashboardPage() {
	const { data, mutate, isLoading } = useSWR<{ tracks: Track[] }>("/api/recommendations", fetcher);
	const [historyOpen, setHistoryOpen] = useState(false);
	const [feedback, setFeedback] = useState<Array<{ track: Track; liked: boolean }>>([]);

	const current = useMemo(() => data?.tracks?.[0], [data]);

	const swipe = useCallback(
		async (liked: boolean) => {
			if (!current) return;
			setFeedback((prev) => [{ track: current, liked }, ...prev]);
			await fetch("/api/feedback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ trackSpotifyId: current.spotify_id, liked }),
			});
			mutate(
				(prev) => ({ tracks: (prev?.tracks || []).slice(1) }),
				{ revalidate: true }
			);
		},
		[current, mutate]
	);

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="mx-auto max-w-md p-4">
				{isLoading || !current ? (
					<div className="grid place-items-center h-[70vh] text-white/60">Loading…</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>{current.name}</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center gap-4">
							<Image
								src={current.album_art}
								alt={current.name}
								width={300}
								height={300}
								className="rounded-lg shadow"
							/>
							<p className="text-white/70">{current.artist}</p>
						</CardContent>
						<CardFooter className="flex items-center justify-between">
							<Button variant="outline" size="lg" onClick={() => swipe(false)} className="gap-2">
								<ThumbsDown className="h-5 w-5" /> Dislike
							</Button>
							<Button variant="default" size="lg" onClick={() => swipe(true)} className="gap-2">
								<ThumbsUp className="h-5 w-5" /> Like
							</Button>
							<Button variant="ghost" onClick={() => setHistoryOpen((v) => !v)}>
								<History className="h-5 w-5" />
							</Button>
						</CardFooter>
					</Card>
				)}

				{historyOpen && (
					<div className="mt-4 rounded-lg border border-white/10 p-4 bg-[#0b0b0b]">
						<h3 className="font-semibold mb-2">History</h3>
						<ul className="space-y-2 max-h-64 overflow-y-auto">
							{feedback.map((f, idx) => (
								<li key={idx} className="flex items-center justify-between text-sm">
									<span className="text-white/80">{f.track.name}</span>
									<span className={f.liked ? "text-[#1DB954]" : "text-red-400"}>
										{f.liked ? "Liked" : "Disliked"}
									</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
