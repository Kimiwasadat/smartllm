import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import { clerkClient } from "@clerk/clerk-sdk-node";

// Matches paths for admin-only access
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// These routes should not trigger any redirects, even for cooldown
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/signIn',
  '/auth/signUp',
  '/textInput', // ✅ Allow direct access
]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();

  // 🔒 Redirect non-admins away from admin routes
  if (isAdminRoute(req) && sessionClaims?.role !== 'admin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  // 🔄 Cooldown enforcement for signed-in users only
  if (userId && !isPublicRoute(req)) {
    const user = await clerkClient.users.getUser(userId);
    const lastExceedTime = user.publicMetadata?.lastExceedTime;
    
    if (lastExceedTime) {
      const elapsed = Date.now() - Number(lastExceedTime);
      const cooldown = 3 * 60 * 1000; // 3 minutes

      if (elapsed < cooldown) {
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
