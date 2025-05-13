import { auth, currentUser, signOut } from "@clerk/nextjs/server";

export async function fetchUserRole() {
    try {
        const { userId } = auth();
        console.log('🔑 Auth check - userId:', userId);

        if (!userId) {
            console.log('❌ No userId found');
            throw new Error("User is not authenticated");
        }

        const user = await currentUser();
        console.log('👤 User data:', {
            id: user?.id,
            role: user?.publicMetadata?.role,
            canAccess: user?.publicMetadata?.canAccess,
            email: user?.emailAddresses?.[0]?.emailAddress
        });

        if (!user) {
            console.log('❌ No user found');
            throw new Error("User not found");
        }

        const role = user.publicMetadata?.role;
        if (!role) {
            console.log('❌ No role found in metadata');
            throw new Error("User role not found");
        }

        return role;
    } catch (error) {
        console.error('❌ Error in fetchUserRole:', error);
        throw error;
    }
}

export async function checkPaidAccess() {
    try {
        const role = await fetchUserRole();
        console.log('🔒 Checking paid access - Role:', role);
        
        if (role === 'paid') {
            console.log('✅ User has paid access');
            return true;
        }
        
        console.log('❌ User does not have paid access');
        return false;
    } catch (error) {
        console.error("❌ Error checking paid access:", error);
        return false;
    }
}

export async function checkCanAccess() {
    try {
        const { userId } = auth();
        if (!userId) {
            console.log('❌ No userId found');
            return false;
        }

        const user = await currentUser();
        if (!user) {
            console.log('❌ No user found');
            return false;
        }

        const role = user.publicMetadata?.role;
        const canAccess = user.publicMetadata?.canAccess;

        // If user is admin, they always have access
        if (role === 'admin') {
            console.log('✅ Admin user has access');
            return true;
        }

        // For non-admin users, check canAccess metadata
        if (canAccess === true) {
            console.log('✅ User has canAccess permission');
            return true;
        }

        // If canAccess is false, sign out the user
        if (canAccess === false) {
            console.log('❌ User access revoked, signing out...');
            await signOut();
            return false;
        }

        console.log('❌ User does not have canAccess permission');
        return false;
    } catch (error) {
        console.error('❌ Error checking canAccess:', error);
        return false;
    }
}

export async function checkDashboardAccess() {
    try {
        const hasAccess = await checkCanAccess();
        if (!hasAccess) {
            throw new Error("Access denied");
        }
        return true;
    } catch (error) {
        console.error('❌ Dashboard access denied:', error);
        throw error;
    }
}

export async function ensureAuth() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("Authentication required");
    }
    return userId;
} 