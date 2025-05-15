'use client';
import { useState } from 'react';

export default function AdminDashboardPage() {
  const [blacklistedUsers, setBlacklistedUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data - in real app would fetch from API
  const users = [
    { id: 1, name: 'User 1', email: 'user1@example.com', status: 'active' },
    { id: 2, name: 'User 2', email: 'user2@example.com', status: 'blacklisted' }
  ];

  const mockComplaints = [
    { id: 1, userId: 1, description: 'Inappropriate content', status: 'pending' },
    { id: 2, userId: 2, description: 'Spam messages', status: 'resolved' }
  ];

  const handleBlacklist = (userId) => {
    setBlacklistedUsers([...blacklistedUsers, userId]);
  };

  const handleRemoveBlacklist = (userId) => {
    setBlacklistedUsers(blacklistedUsers.filter(id => id !== userId));
  };

  const handleResolveComplaint = (complaintId) => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId 
        ? {...complaint, status: 'resolved'}
        : complaint
    ));
  };

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="border p-4 rounded">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Status:</strong> {user.status}</p>
                  {user.status === 'active' ? (
                    <button 
                      onClick={() => handleBlacklist(user.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                    >
                      Blacklist User
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRemoveBlacklist(user.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                    >
                      Remove from Blacklist
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Complaints</h2>
            <div className="space-y-4">
              {mockComplaints.map(complaint => (
                <div key={complaint.id} className="border p-4 rounded">
                  <p><strong>User ID:</strong> {complaint.userId}</p>
                  <p><strong>Description:</strong> {complaint.description}</p>
                  <p><strong>Status:</strong> {complaint.status}</p>
                  {complaint.status === 'pending' && (
                    <button
                      onClick={() => handleResolveComplaint(complaint.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="space-y-4">
              <p><strong>Total Users:</strong> {users.length}</p>
              <p><strong>Blacklisted Users:</strong> {blacklistedUsers.length}</p>
              <p><strong>Active Complaints:</strong> {mockComplaints.filter(c => c.status === 'pending').length}</p>
              <p><strong>Resolved Complaints:</strong> {mockComplaints.filter(c => c.status === 'resolved').length}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
