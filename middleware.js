import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from 'next/server';

export default authMiddleware({
    publicRoutes: ["/suspended"],
    async afterAuth(auth, req) {
        // If the user is not signed in and trying to access a protected route
        if (!auth.userId && !auth.isPublicRoute) {
            const signInUrl = new URL('/auth/sign-in', req.url);
            return Response.redirect(signInUrl);
        }

        // If the user is signed in
        if (auth.userId) {
            const user = auth.user;
            const isApproved = user.publicMetadata?.isApproved;
            const isAdmin = user.publicMetadata?.role === 'admin';
            const isWaitingPage = req.nextUrl.pathname === '/waiting';
            const isAdminRoute = req.nextUrl.pathname.startsWith('/dashboard/admin') || 
                               req.nextUrl.pathname.startsWith('/api/admin');
            const isSignUpPage = req.nextUrl.pathname === '/auth/sign-up';

            // If trying to access admin routes but not an admin
            if (isAdminRoute && !isAdmin) {
                return new NextResponse('Forbidden', { status: 403 });
            }

            // If user is not approved and not on waiting page, redirect to waiting
            if (!isApproved && !isWaitingPage) {
                const waitingUrl = new URL('/waiting', req.url);
                return Response.redirect(waitingUrl);
            }

            // If user is approved and on waiting page, redirect to home
            if (isApproved && isWaitingPage) {
                const homeUrl = new URL('/', req.url);
                return Response.redirect(homeUrl);
            }

            // If user just signed up, redirect to waiting page
            if (isSignUpPage) {
                const waitingUrl = new URL('/waiting', req.url);
                return Response.redirect(waitingUrl);
            }

            // If the user is logged in and suspended, redirect to warning page
            if (user.publicMetadata?.status === 'suspended' && req.nextUrl.pathname !== '/suspended') {
                const warningUrl = new URL('/suspended', req.url);
                return NextResponse.redirect(warningUrl);
            }
        }
    }
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 