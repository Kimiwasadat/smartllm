'use server';

const { clerkClient, auth } = require('@clerk/nextjs/server');
const { checkRole } = require('@/app/utils/roles');
const { redirect } = require('next/navigation');

async function setRole(formData) {
  const client = await clerkClient();
  if (!checkRole('admin')) {
    return { message: 'You are not authorized to perform this action.' };
  }
  try {
    const res = await client.users.updateUserMetadata(formData.get('userId'), {
      publicMetadata: { role: formData.get('role') },
    });
    return { message: res.publicMetadata.role };
  } catch (error) {
    return { message: error };
  }
}

async function removeRole(formData) {
  const client = await clerkClient();
  if (!checkRole('admin')) {
    return { message: 'You are not authorized to perform this action.' };
  }
  try {
    const res = await client.users.updateUserMetadata(formData.get('userId'), {
      publicMetadata: { role: undefined },
    });
    return { message: res.publicMetadata.role };
  } catch (error) {
    return { message: error };
  }
}

module.exports = {
  setRole,
  removeRole,
};
