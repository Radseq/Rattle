import { getAuth, withClerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withClerkMiddleware((req: NextRequest) => {
	const { userId } = getAuth(req)

	const { nextUrl, url, geo } = req

	if (geo) {
		if (geo.country) {
			nextUrl.searchParams.set("country", geo.country)
		}
		if (geo.region) {
			nextUrl.searchParams.set("region", geo.region)
		}
		if (geo.city) {
			nextUrl.searchParams.set("city", geo.city)
		}
	}

	// redirect sing in user to home page
	if (nextUrl.pathname === "/" && userId) {
		return NextResponse.redirect(new URL("/home", url))
	}
	return NextResponse.rewrite(nextUrl)
})

// Stop Middleware running on static files
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next
		 * - static (static files)
		 * - favicon.ico (favicon file)
		 */
		"/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)",
		"/",
	],
}
