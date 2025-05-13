import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import { clerkClient } from "@clerk/clerk-sdk-node";

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPublicRoute = createRouteMatcher(['/', '/auth/signIn', '/auth/signUp']);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();

  // Check admin routes
  if (isAdminRoute(req) && sessionClaims?.role !== 'admin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  // Check cooldown for signed-in users
  if (userId && !isPublicRoute(req)) {
    // Fetch the latest user metadata directly from Clerk
    const user = await clerkClient.users.getUser(userId);
    const lastExceedTime = user.publicMetadata?.lastExceedTime;
    if (lastExceedTime) {
      const timeSinceExceed = Date.now() - Number(lastExceedTime);
      const threeMinutesInMs = 180000; // 3 minutes in milliseconds
      
      if (timeSinceExceed < threeMinutesInMs) {
        // User is in cooldown, redirect to sign-in with error
        const signInUrl = new URL('/auth/signIn', req.url);
        signInUrl.searchParams.set('error', 'cooldown');
        return NextResponse.redirect(signInUrl);
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/api/:path*'],
};
