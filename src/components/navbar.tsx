"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
	return (
		<header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/70 backdrop-blur">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2">
					<Image src="/findr-logo.svg" alt="findr" width={24} height={24} />
					<span className="text-white font-semibold">findr</span>
				</Link>
				<div className="flex items-center gap-2">
					<Link href="/dashboard">
						<Button variant="outline">Dashboard</Button>
					</Link>
				</div>
			</div>
		</header>
	);
}
