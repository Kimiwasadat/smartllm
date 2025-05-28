import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from 'next/server';
import { clerkClient } from "@clerk/clerk-sdk-node";

export default authMiddleware({
    publicRoutes: [
        "/",
        "/auth/signIn",
        "/auth/signUp",
        "/textInput",
        "/suspended",
        "/waiting",
        "/unauthorized"
    ],
    async afterAuth(auth, req) {
        // If the user is not signed in and trying to access a protected route
        if (!auth.userId && !auth.isPublicRoute) {
            const signInUrl = new URL('/auth/signIn', req.url);
            return Response.redirect(signInUrl);
        }

        // If the user is signed in
        if (auth.userId) {
            const user = auth.user;
            const role = user.publicMetadata?.role;
            const isAdmin = role === 'admin';
            const isSuspended = user.publicMetadata?.status === 'suspended';
            const isWaitingPage = req.nextUrl.pathname === '/waiting';
            const isAdminRoute = req.nextUrl.pathname.startsWith('/dashboard/admin') || 
                               req.nextUrl.pathname.startsWith('/api/admin');
            const isSignUpPage = req.nextUrl.pathname === '/auth/signUp';
            const isPaidRoute = req.nextUrl.pathname.startsWith('/dashboard/paid');
            const isFreeRoute = req.nextUrl.pathname.startsWith('/dashboard/free');
            const isTextInputPage = req.nextUrl.pathname === '/textInput';

            // Handle suspended users
            if (isSuspended && req.nextUrl.pathname !== '/suspended') {
                const suspendedUrl = new URL('/suspended', req.url);
                return NextResponse.redirect(suspendedUrl);
            }

            // Handle free user cooldown
            if (role === 'free') {
                const lastExceedTime = user.publicMetadata?.lastExceedTime;
                const cooldownPeriod = 3 * 60 * 1000; // 3 minutes in milliseconds

                if (lastExceedTime) {
                    const elapsed = Date.now() - Number(lastExceedTime);
                    
                    // If still in cooldown period
                    if (elapsed < cooldownPeriod) {
                        // If trying to access textInput or any protected route during cooldown
                        if (isTextInputPage || !auth.isPublicRoute) {
                            const signInUrl = new URL('/auth/signIn', req.url);
                            signInUrl.searchParams.set('error', 'cooldown');
                            signInUrl.searchParams.set('remaining', Math.ceil((cooldownPeriod - elapsed) / 1000));
                            return NextResponse.redirect(signInUrl);
                        }
                    } else {
                        // Cooldown period has ended, clear the metadata
                        try {
                            await clerkClient.users.updateUser(user.id, {
                                publicMetadata: {
                                    ...user.publicMetadata,
                                    lastExceedTime: null
                                }
                            });
                        } catch (error) {
                            console.error('Error clearing cooldown:', error);
                        }
                    }
                }
            }

            // Handle admin routes
            if (isAdminRoute && !isAdmin) {
                const unauthorizedUrl = new URL('/unauthorized', req.url);
                return NextResponse.redirect(unauthorizedUrl);
            }

            // Handle paid routes
            if (isPaidRoute && role !== 'paid') {
                const unauthorizedUrl = new URL('/unauthorized', req.url);
                return NextResponse.redirect(unauthorizedUrl);
            }

            // Handle free routes
            if (isFreeRoute && role !== 'free') {
                const unauthorizedUrl = new URL('/unauthorized', req.url);
                return NextResponse.redirect(unauthorizedUrl);
            }

            // If user just signed up, redirect to waiting page
            if (isSignUpPage) {
                const waitingUrl = new URL('/waiting', req.url);
                return Response.redirect(waitingUrl);
            }

            // If user is on waiting page but has a role, redirect to appropriate dashboard
            if (isWaitingPage && role) {
                if (role === 'paid') {
                    const dashboardUrl = new URL('/dashboard/paid', req.url);
                    return Response.redirect(dashboardUrl);
                } else if (role === 'free') {
                    const dashboardUrl = new URL('/dashboard/free', req.url);
                    return Response.redirect(dashboardUrl);
                } else if (role === 'admin') {
                    const dashboardUrl = new URL('/dashboard/admin', req.url);
                    return Response.redirect(dashboardUrl);
                }
            }
        }
    }
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 