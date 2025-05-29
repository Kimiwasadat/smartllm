'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, Typography, Button, Input, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [tokenAmount, setTokenAmount] = useState('');
    const [activeTab, setActiveTab] = useState(0);

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
    const allowedTabs = [0, 1];
    const safeTab = allowedTabs.includes(activeTab) ? activeTab : 0;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <Tabs value={safeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="User Management" value={0} />
                <Tab label="Token Management" value={1} />
            </Tabs>
            {safeTab === 0 && (
                <Card sx={{ mt: 2 }}>
                    <CardHeader title={<Typography variant="h6">All Users</Typography>} />
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Available Tokens</TableCell>
                                    <TableCell>Used Tokens</TableCell>
                                    <TableCell>Corrections Made</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
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
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <Button
                                                        color="error"
                                                        variant="contained"
                                                        onClick={() => handleSuspendUser(user.id)}
                                                        disabled={user.status === 'suspended'}
                                                    >
                                                        Suspend
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
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
            )}
            {safeTab === 1 && (
                <Card sx={{ mt: 2 }}>
                    <CardHeader title={<Typography variant="h6">Token Management</Typography>} />
                    <CardContent>
                        {selectedUser ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Typography variant="subtitle1">
                                    Managing tokens for: {selectedUser.email}
                                </Typography>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <Input
                                        type="number"
                                        placeholder="Enter token amount"
                                        value={tokenAmount}
                                        onChange={(e) => setTokenAmount(e.target.value)}
                                        inputProps={{ min: 1 }}
                                    />
                                    <Button variant="contained" onClick={() => handleTokenDeduction(selectedUser.id)}>
                                        Deduct Tokens
                                    </Button>
                                    <Button variant="outlined" onClick={() => setSelectedUser(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Typography>Select a user to manage their tokens</Typography>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 