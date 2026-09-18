import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/pos", request.url));
  }

  if (!token && pathname.startsWith("/pos")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/pos/:path*"],
};
