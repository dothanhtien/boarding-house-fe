import { NextRequest, NextResponse } from "next/server";
import { MARKER_COOKIE } from "@/utils/sessionMarker";

const PUBLIC_ONLY_PATHS = ["/signin", "/signup"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasMaker = req.cookies.get(MARKER_COOKIE)?.value === "1";

  const isPublicOnlyPath = PUBLIC_ONLY_PATHS.some((p) =>
    pathname.startsWith(p),
  );

  if (!hasMaker && !isPublicOnlyPath) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (hasMaker && isPublicOnlyPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico).*)"],
};
