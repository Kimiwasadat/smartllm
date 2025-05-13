import { authMiddleware } from "@clerk/nextjs";
import { checkCanAccess } from "./app/utils/auth";

export default authMiddleware({
    async afterAuth(auth, req, evt) {
        // Handle public routes
        if (!auth.userId) {
            return;
        }

        // Check access for protected routes
        const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                               req.nextUrl.pathname.startsWith('/text-input');
        
        if (isProtectedRoute) {
            try {
                const hasAccess = await checkCanAccess();
                if (!hasAccess) {
                    // Redirect to home page if access is denied
                    const homeUrl = new URL('/', req.url);
                    return Response.redirect(homeUrl);
                }
            } catch (error) {
                console.error('Middleware access check failed:', error);
                const homeUrl = new URL('/', req.url);
                return Response.redirect(homeUrl);
            }
        }
    }
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 