import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(); // <- NO options passed

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
