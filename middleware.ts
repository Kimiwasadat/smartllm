import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  if (isAdminRoute(req) && sessionClaims?.role !== 'admin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
