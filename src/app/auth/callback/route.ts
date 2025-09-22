import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const redirectTo = "/dashboard";
	if (code) {
		const supabase = getSupabaseServerClient();
		await supabase.auth.exchangeCodeForSession(code);
	}
	return NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_APP_URL));
}
