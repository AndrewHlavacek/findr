import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const isLoggedIn = req.cookies.has("sb-access-token") || req.cookies.has("sb:token");
	const { pathname } = req.nextUrl;

	if (!isLoggedIn && pathname.startsWith("/dashboard")) {
		return NextResponse.redirect(new URL("/login", req.url));
	}
	if (isLoggedIn && pathname === "/") {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/dashboard/:path*"],
};
