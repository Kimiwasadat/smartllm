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
    const [blacklistedUsers, setBlacklistedUsers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [rejections, setRejections] = useState([]);

    useEffect(() => {
        if (isLoaded && user?.publicMetadata?.role !== 'admin') {
            router.push('/');
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        fetchUsers();
        fetchRejections();
        const interval = setInterval(() => {
            fetchUsers();
            fetchRejections();
        }, 5000); // Poll every 5 seconds
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

    const fetchRejections = async () => {
        try {
            // First get all users
            const response = await fetch('/api/admin/users');
            const users = await response.json();
            
            // Then get detailed user data for each user
            const allRejections = [];
            for (const user of users) {
                const userResponse = await fetch(`/api/admin/users/${user.id}`);
                const userData = await userResponse.json();
                const rejections = userData.publicMetadata?.rejections || [];
                allRejections.push(...rejections.map(r => ({ ...r, userId: user.id })));
            }
            
            // Filter only pending rejections
            setRejections(allRejections.filter(r => r.status === 'pending'));
        } catch (error) {
            console.error('Error fetching rejections:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch rejections',
                severity: 'error'
            });
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

    const handleAcceptRejection = async (userId, rejectionId) => {
        try {
            const user = await fetch(`/api/admin/users/${userId}`).then(res => res.json());
            const currentTokens = user.publicMetadata?.tokens || 0;
            
            // Refund 4 tokens (they paid 5, keep 1)
            const newTokenCount = currentTokens + 4;
            
            // Find the rejection to get the original text
            const rejection = user.publicMetadata?.rejections?.find(r => r.id === rejectionId);
            if (!rejection) {
                throw new Error('Rejection not found');
            }

            // Update user's tokens, rejection status, and keep original text
            await fetch('/api/set-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    tokens: newTokenCount,
                    rejections: user.publicMetadata?.rejections.map(r => 
                        r.id === rejectionId 
                            ? { 
                                ...r, 
                                status: 'accepted',
                                correction: r.text // Keep the original text
                              }
                            : r
                    )
                }),
            });

            // Update local state
            setRejections(prev => prev.filter(r => r.id !== rejectionId));
            setSnackbar({
                open: true,
                message: 'Rejection accepted and tokens refunded',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error accepting rejection:', error);
            setSnackbar({
                open: true,
                message: 'Failed to accept rejection',
                severity: 'error'
            });
        }
    };

    const handleDenyRejection = async (userId, rejectionId) => {
        try {
            const user = await fetch(`/api/admin/users/${userId}`).then(res => res.json());
            
            // Update rejection status to denied (no token refund)
            await fetch('/api/set-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    rejections: user.publicMetadata?.rejections.map(r => 
                        r.id === rejectionId 
                            ? { ...r, status: 'denied' }
                            : r
                    )
                }),
            });

            // Update local state
            setRejections(prev => prev.filter(r => r.id !== rejectionId));
            setSnackbar({
                open: true,
                message: 'Rejection denied',
                severity: 'info'
            });
        } catch (error) {
            console.error('Error denying rejection:', error);
            setSnackbar({
                open: true,
                message: 'Failed to deny rejection',
                severity: 'error'
            });
        }
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
                <Tab label="Complaints" />
                <Tab label="Rejections" />
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

            {activeTab === 2 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Complaints
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User ID</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {complaints.map((complaint) => (
                                        <TableRow key={complaint.id}>
                                            <TableCell>{complaint.userId}</TableCell>
                                            <TableCell>{complaint.description}</TableCell>
                                            <TableCell>{complaint.status}</TableCell>
                                            <TableCell>
                                                {complaint.status === 'pending' && (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => handleResolveComplaint(complaint.id)}
                                                    >
                                                        Mark as Resolved
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {activeTab === 3 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Rejection Reviews
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User ID</TableCell>
                                        <TableCell>Original Text</TableCell>
                                        <TableCell>Correction</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rejections.map((rejection) => (
                                        <TableRow key={rejection.id}>
                                            <TableCell>{rejection.userId}</TableCell>
                                            <TableCell>{rejection.text}</TableCell>
                                            <TableCell>{rejection.correction}</TableCell>
                                            <TableCell>{rejection.reason}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleAcceptRejection(rejection.userId, rejection.id)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDenyRejection(rejection.userId, rejection.id)}
                                                >
                                                    Deny
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
