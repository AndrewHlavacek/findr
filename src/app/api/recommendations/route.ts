import { NextResponse } from "next/server";

export async function GET() {
	try {
		// If you already have a proxy endpoint, set RECOMMENDATIONS_URL in env
		const endpoint = process.env.RECOMMENDATIONS_URL;
		if (endpoint) {
			const res = await fetch(endpoint, { cache: "no-store" });
			const data = await res.json();
			return NextResponse.json(data);
		}
		// Fallback mock to keep UI working before wiring external URL
		return NextResponse.json({
			tracks: [
				{
					spotify_id: "3n3Ppam7vgaVa1iaRUc9Lp",
					name: "Mr. Brightside",
					artist: "The Killers",
					album_art: "https://i.scdn.co/image/ab67616d0000b273b3a11f23e6bbf99aaef6e585",
				},
			],
		});
	} catch (e) {
		return NextResponse.json({ error: "failed" }, { status: 500 });
	}
}
