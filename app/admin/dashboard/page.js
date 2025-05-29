'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [tokenAmount, setTokenAmount] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        if (isLoaded && user?.publicMetadata?.role !== 'admin') {
            router.push('/');
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendUser = async (userId) => {
        try {
            const response = await fetch('/api/admin/suspend-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                toast.success('User suspended successfully');
                fetchUsers();
            } else {
                toast.error('Failed to suspend user');
            }
        } catch (error) {
            console.error('Error suspending user:', error);
            toast.error('Failed to suspend user');
        }
    };

    const handleTokenDeduction = async (userId) => {
        if (!tokenAmount || isNaN(tokenAmount) || tokenAmount <= 0) {
            toast.error('Please enter a valid token amount');
            return;
        }

        try {
            const response = await fetch('/api/admin/deduct-tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId, 
                    amount: parseInt(tokenAmount),
                    reason: 'Admin deduction'
                })
            });

            if (response.ok) {
                toast.success('Tokens deducted successfully');
                setTokenAmount('');
                fetchUsers();
            } else {
                toast.error('Failed to deduct tokens');
            }
        } catch (error) {
            console.error('Error deducting tokens:', error);
            toast.error('Failed to deduct tokens');
        }
    };

    if (!isLoaded || loading) {
        return <div>Loading...</div>;
    }

    // Fix Tabs value to only use valid values
    const allowedTabs = ['users', 'tokens'];
    const safeTab = allowedTabs.includes(activeTab) ? activeTab : 'users';

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            
            <Tabs value={safeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="tokens">Token Management</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Available Tokens</TableHead>
                                        <TableHead>Used Tokens</TableHead>
                                        <TableHead>Corrections Made</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users
                                        .filter(user => user.role === 'paid')
                                        .map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.role}</TableCell>
                                                <TableCell>{user.availableTokens}</TableCell>
                                                <TableCell>{user.usedTokens}</TableCell>
                                                <TableCell>{user.correctionsMade}</TableCell>
                                                <TableCell>{user.status}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleSuspendUser(user.id)}
                                                            disabled={user.status === 'suspended'}
                                                        >
                                                            Suspend
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setSelectedUser(user)}
                                                        >
                                                            Manage Tokens
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tokens">
                    <Card>
                        <CardHeader>
                            <CardTitle>Token Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedUser ? (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Managing tokens for: {selectedUser.email}
                                    </h3>
                                    <div className="flex gap-4">
                                        <Input
                                            type="number"
                                            placeholder="Enter token amount"
                                            value={tokenAmount}
                                            onChange={(e) => setTokenAmount(e.target.value)}
                                            min="1"
                                        />
                                        <Button onClick={() => handleTokenDeduction(selectedUser.id)}>
                                            Deduct Tokens
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedUser(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            ) : (
                                <p>Select a user to manage their tokens</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 