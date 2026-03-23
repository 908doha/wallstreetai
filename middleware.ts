import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Admin routes require admin role
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // My page requires authentication
  if (pathname.startsWith("/mypage")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/mypage/:path*"],
};
