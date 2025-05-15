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
    Card,
    CardContent,
    Grid,
    CircularProgress
} from '@mui/material';
import Link from 'next/link';

export default function UserManagementPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [blacklistedUsers, setBlacklistedUsers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [paidUsers, setPaidUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;

        if (!user || user.publicMetadata?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchPaidUsers(),
                    fetchComplaints(),
                    fetchBlacklistedUsers()
                ]);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, isLoaded, router]);

    const fetchPaidUsers = async () => {
        try {
            const res = await fetch('/api/admin/paid-users');
            const data = await res.json();
            setPaidUsers(data.paidUsers || []);
        } catch (error) {
            console.error('Failed to fetch paid users:', error);
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await fetch('/api/admin/complaints');
            const data = await res.json();
            setComplaints(data.complaints || []);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        }
    };

    const fetchBlacklistedUsers = async () => {
        try {
            const res = await fetch('/api/admin/blacklisted-users');
            const data = await res.json();
            setBlacklistedUsers(data.blacklistedUsers || []);
        } catch (error) {
            console.error('Failed to fetch blacklisted users:', error);
        }
    };

    const handleBlacklist = async (userId) => {
        try {
            const response = await fetch('/api/admin/blacklist-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Failed to blacklist user');

            setBlacklistedUsers([...blacklistedUsers, userId]);
        } catch (error) {
            console.error('Failed to blacklist user:', error);
        }
    };

    const handleRemoveBlacklist = async (userId) => {
        try {
            const response = await fetch('/api/admin/remove-blacklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Failed to remove blacklist');

            setBlacklistedUsers(blacklistedUsers.filter(id => id !== userId));
        } catch (error) {
            console.error('Failed to remove blacklist:', error);
        }
    };

    const handleResolveComplaint = async (complaintId) => {
        try {
            const response = await fetch('/api/admin/resolve-complaint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ complaintId }),
            });

            if (!response.ok) throw new Error('Failed to resolve complaint');

            setComplaints(complaints.map(complaint => 
                complaint.id === complaintId 
                    ? {...complaint, status: 'resolved'}
                    : complaint
            ));
        } catch (error) {
            console.error('Failed to resolve complaint:', error);
        }
    };

    if (!isLoaded || isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user || user.publicMetadata?.role !== 'admin') {
        return null;
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h3" fontWeight="bold">
                    🛡️ User Management
                </Typography>
                <Button
                    component={Link}
                    href="/dashboard/admin"
                    variant="contained"
                    color="primary"
                >
                    Back to Approvals
                </Button>
            </Box>

            <Grid container spacing={4} sx={{ mt: 2 }}>
                {/* Statistics */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#4F46E5', color: 'white', borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Platform Statistics
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {paidUsers.length}
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,0.8)">
                                Total Paid Users
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {blacklistedUsers.length}
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,0.8)">
                                Blacklisted Users
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {complaints.filter(c => c.status === 'pending').length}
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,0.8)">
                                Active Complaints
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {complaints.filter(c => c.status === 'resolved').length}
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,0.8)">
                                Resolved Complaints
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* User Management */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                User Management
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Tokens</TableCell>
                                            <TableCell align="center">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paidUsers.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {blacklistedUsers.includes(user.id) ? 'Blacklisted' : 'Active'}
                                                </TableCell>
                                                <TableCell>{user.tokens || 0}</TableCell>
                                                <TableCell align="center">
                                                    {blacklistedUsers.includes(user.id) ? (
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleRemoveBlacklist(user.id)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleBlacklist(user.id)}
                                                        >
                                                            Blacklist
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
                </Grid>

                {/* Complaints */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Complaints
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User ID</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="center">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {complaints.map(complaint => (
                                            <TableRow key={complaint.id}>
                                                <TableCell>{complaint.userId}</TableCell>
                                                <TableCell>{complaint.description}</TableCell>
                                                <TableCell>{complaint.status}</TableCell>
                                                <TableCell align="center">
                                                    {complaint.status === 'pending' && (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
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
                </Grid>
            </Grid>
        </Box>
    );
} 