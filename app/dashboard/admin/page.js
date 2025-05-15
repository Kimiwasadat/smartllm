'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    Tabs,
    Tab,
    Card,
    CardContent,
    Alert,
    Snackbar
} from '@mui/material';

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [tokenAmount, setTokenAmount] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (isLoaded && user?.publicMetadata?.role !== 'admin') {
            router.push('/');
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch users',
                severity: 'error'
            });
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
                setSnackbar({
                    open: true,
                    message: 'User suspended successfully',
                    severity: 'success'
                });
                fetchUsers();
            } else {
                setSnackbar({
                    open: true,
                    message: 'Failed to suspend user',
                    severity: 'error'
                });
            }
        } catch (error) {
            console.error('Error suspending user:', error);
            setSnackbar({
                open: true,
                message: 'Failed to suspend user',
                severity: 'error'
            });
        }
    };

    const handleTokenDeduction = async (userId) => {
        if (!tokenAmount || isNaN(tokenAmount) || tokenAmount <= 0) {
            setSnackbar({
                open: true,
                message: 'Please enter a valid token amount',
                severity: 'error'
            });
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
                setSnackbar({
                    open: true,
                    message: 'Tokens deducted successfully',
                    severity: 'success'
                });
                setTokenAmount('');
                fetchUsers();
            } else {
                setSnackbar({
                    open: true,
                    message: 'Failed to deduct tokens',
                    severity: 'error'
                });
            }
        } catch (error) {
            console.error('Error deducting tokens:', error);
            setSnackbar({
                open: true,
                message: 'Failed to deduct tokens',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (!isLoaded || loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Loading...
        </Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="User Management" />
                <Tab label="Token Management" />
            </Tabs>

            {activeTab === 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Paid Users
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Username</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Available Tokens</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>{user.availableTokens}</TableCell>
                                            <TableCell>{user.status}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
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
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {activeTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Token Management
                        </Typography>
                        {selectedUser ? (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Managing tokens for: {selectedUser.username}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <TextField
                                        type="number"
                                        label="Token Amount"
                                        value={tokenAmount}
                                        onChange={(e) => setTokenAmount(e.target.value)}
                                        InputProps={{ inputProps: { min: 1 } }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => handleTokenDeduction(selectedUser.id)}
                                    >
                                        Deduct Tokens
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setSelectedUser(null)}
                                    >
                                        Close
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Typography>
                                Select a user to manage their tokens
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
