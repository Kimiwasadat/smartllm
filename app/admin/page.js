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
    Alert,
    Tabs,
    Tab,
    Chip,
    Card,
    CardContent,
    Grid,
    TextField,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [roleChangeRequests, setRoleChangeRequests] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;

        if (!user || user.publicMetadata?.role !== 'admin') {
            router.push('/');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchPendingUsers(),
                    fetchRoleChangeRequests()
                ]);
            } catch (error) {
                setError('Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, isLoaded, router]);

    const fetchPendingUsers = async () => {
        try {
            const response = await fetch('/api/admin/pending-users');
            const data = await response.json();
            setPendingUsers(data);
        } catch (error) {
            setError('Failed to fetch pending users');
        }
    };

    const fetchRoleChangeRequests = async () => {
        try {
            const response = await fetch('/api/admin/role-change-requests');
            const data = await response.json();
            setRoleChangeRequests(data);
        } catch (error) {
            setError('Failed to fetch role change requests');
        }
    };

    const handleApprove = async (userId, type = 'signup') => {
        try {
            const endpoint = type === 'signup' ? '/api/admin/approve-user' : '/api/admin/approve-role-change';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Failed to approve');

            setSuccess(`Successfully approved ${type === 'signup' ? 'user' : 'role change'}`);
            if (type === 'signup') {
                fetchPendingUsers();
            } else {
                fetchRoleChangeRequests();
            }
        } catch (error) {
            setError(`Failed to approve ${type === 'signup' ? 'user' : 'role change'}`);
        }
    };

    const handleDeny = async (userId, type = 'signup') => {
        try {
            const endpoint = type === 'signup' ? '/api/admin/deny-user' : '/api/admin/deny-role-change';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Failed to deny');

            setSuccess(`Successfully denied ${type === 'signup' ? 'user' : 'role change'}`);
            if (type === 'signup') {
                fetchPendingUsers();
            } else {
                fetchRoleChangeRequests();
            }
        } catch (error) {
            setError(`Failed to deny ${type === 'signup' ? 'user' : 'role change'}`);
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        setSearchTerm(''); // Clear search when changing tabs
    };

    const filteredPendingUsers = pendingUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRoleRequests = roleChangeRequests.filter(request => 
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Pending Sign-ups
                            </Typography>
                            <Typography variant="h3" color="primary">
                                {pendingUsers.length}
                            </Typography>
                            <Button 
                                component={Link} 
                                href="/admin/approvals" 
                                variant="outlined" 
                                sx={{ mt: 2 }}
                            >
                                View All
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Role Change Requests
                            </Typography>
                            <Typography variant="h3" color="primary">
                                {roleChangeRequests.length}
                            </Typography>
                            <Button 
                                component={Link} 
                                href="/admin/approvals?tab=1" 
                                variant="outlined" 
                                sx={{ mt: 2 }}
                            >
                                View All
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by email or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Pending Sign-ups" />
                <Tab label="Role Change Requests" />
            </Tabs>

            {currentTab === 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User ID</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Sign-up Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPendingUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label="Pending" 
                                            color="warning" 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => handleApprove(user.id, 'signup')}
                                            sx={{ mr: 1 }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeny(user.id, 'signup')}
                                        >
                                            Deny
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {currentTab === 1 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User ID</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Current Role</TableCell>
                                <TableCell>Requested Role</TableCell>
                                <TableCell>Request Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRoleRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.userId}</TableCell>
                                    <TableCell>{request.email}</TableCell>
                                    <TableCell>{request.currentRole}</TableCell>
                                    <TableCell>{request.requestedRole}</TableCell>
                                    <TableCell>
                                        {new Date(request.requestedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => handleApprove(request.userId, 'role')}
                                            sx={{ mr: 1 }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeny(request.userId, 'role')}
                                        >
                                            Deny
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                    component={Link} 
                    href="/admin/approvals" 
                    variant="contained" 
                    color="primary"
                >
                    View All Approvals
                </Button>
            </Box>
        </Box>
    );
} 