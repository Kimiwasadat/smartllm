import { currentUser } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';

// This is a wrapper that returns a functional React component
export function withRoleCheck(allowedRoles, PageComponent) {
    return async function PageWrapper() {
        const user = await currentUser();

        if (!user) {
            console.log('❌ No user found, returning notFound');
            return notFound();
        }

        const role = user.publicMetadata?.role;

        if (!allowedRoles.includes(role)) {
            console.log(`❌ Access denied for role '${role}'`);
            return notFound();
        }

        console.log(`✅ Access granted for role '${role}'`);

        return <PageComponent user={user} role={role} />;
    };
}
