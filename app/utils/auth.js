import { getAuth, currentUser } from "@clerk/nextjs/server";

export async function fetchUserRole() {
    try {
        const { userId } = getAuth();
        console.log('🔑 Auth check - userId:', userId);

        if (!userId) {
            console.log('❌ No userId found');
            throw new Error("User is not authenticated");
        }

        const user = await currentUser();
        console.log('👤 User data:', {
            id: user?.id,
            role: user?.publicMetadata?.role,
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

export async function ensureAuth() {
    const { userId } = getAuth();
    if (!userId) {
        throw new Error("Authentication required");
    }
    return userId;
} 