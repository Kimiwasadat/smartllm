'use client';
import {useState, useEffect} from 'react'
import { TextField, Button, Box, Typography, Input, Alert } from '@mui/material'
import axios from 'axios'
import "@fontsource/inter"; // Defaults to weight 400
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function TextInput(){
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [text, setText] = useState('')
    const [correction, setCorrection] = useState('')
    const [loading, setLoading] = useState(false)
    const [availableTokens, setAvailableTokens] = useState(0)
    const [lastSubmissionTime, setLastSubmissionTime] = useState(null)
    const [error, setError] = useState('')
    const [highlightedText, setHighlightedText] = useState('')
    const [isInCooldown, setIsInCooldown] = useState(false)
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    // Ensure canAccess is set for all users except admins/superusers
    useEffect(() => {
        const ensureCanAccess = async () => {
            if (!user) return;
            const role = user.publicMetadata?.role;
            if (role === 'admin' || role === 'superuser') return;

            // Paid users always have canAccess true
            if (role === 'paid' && user.publicMetadata?.canAccess !== true) {
                try {
                    await fetch('/api/set-role', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            userId: user.id,
                            role: user.publicMetadata?.role,
                            canAccess: true,
                            tokens: user.publicMetadata?.tokens
                        }),
                    });
                } catch (error) {
                    console.error('Failed to set canAccess for paid user:', error);
                }
            }

            // Free users: initialize canAccess if missing
            if (role === 'free' && user.publicMetadata?.canAccess === undefined) {
                try {
                    await fetch('/api/set-role', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            userId: user.id,
                            role: user.publicMetadata?.role,
                            canAccess: true,
                            tokens: user.publicMetadata?.tokens
                        }),
                    });
                } catch (error) {
                    console.error('Failed to initialize canAccess for free user:', error);
                }
            }
        };
        ensureCanAccess();
    }, [user]);

    // 3-minute lockout logic for free users only, checked on page access
    useEffect(() => {
        const checkLockout = async () => {
            if (!user) return;
            const role = user.publicMetadata?.role;
            const canAccess = user.publicMetadata?.canAccess;
            const lastExceedTime = user.publicMetadata?.lastExceedTime;

            if (role === 'admin' || role === 'superuser') return;

            if (role === 'free' && canAccess === false) {
                const now = Date.now();
                const threeMinutes = 3 * 60 * 1000;
                if (lastExceedTime && now - lastExceedTime >= threeMinutes) {
                    // Lockout expired, restore access
                    try {
                        await fetch('/api/set-role', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                userId: user.id,
                                canAccess: true
                            }),
                        });
                        // Force sign out and redirect to sign-in so Clerk reloads metadata
                        await signOut();
                        router.push('/auth/signIn?timeoutRestored=1');
                    } catch (error) {
                        console.error('Failed to restore access:', error);
                    }
                } else {
                    // Still in lockout, sign out and redirect
                    await signOut();
                    router.push('/auth/signIn?error=timeout');
                }
            }
        };
        checkLockout();
    }, [user, signOut, router]);

    useEffect(() => {
        // Check if user has access
        const checkAccess = async () => {
            if (!user) return;
            
            const canAccess = user.publicMetadata?.canAccess;
            const role = user.publicMetadata?.role;
            
            // If user is admin, they always have access
            if (role === 'admin') return;
            
            // If canAccess is false and not in cooldown, sign out and redirect
            if (canAccess === false && !isInCooldown) {
                await signOut();
                router.push('/auth/signIn?error=access_denied');
                return;
            }
        };

        checkAccess();
    }, [user, signOut, router, isInCooldown]);

    useEffect(() => {
        if (user?.publicMetadata?.role === 'paid') {
            const tokens = Number(user.publicMetadata.tokens);
            setAvailableTokens(
                tokens && tokens > 0 ? tokens : 40 // Default for new paid users
            );
        } else {
            setAvailableTokens(20);
        }
    }, [user]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (!file) return;
        const reader = new FileReader()
        reader.onload = (e) => {
            const fileContent = e.target.result
            setText(fileContent)
        }
        reader.readAsText(file)
    }

    const highlightDifferences = (original, corrected) => {
        const originalWords = original.split(/\s+/);
        const correctedWords = corrected.split(/\s+/);
        let result = '';
        
        for (let i = 0; i < Math.max(originalWords.length, correctedWords.length); i++) {
            if (originalWords[i] !== correctedWords[i]) {
                result += `<span style="background-color: yellow">${correctedWords[i] || ''}</span> `;
            } else {
                result += `${correctedWords[i] || ''} `;
            }
        }
        return result.trim();
    }

    const handleSubmit = async () => {
        setError('');
        
        // Check for free user restrictions
        if (user?.publicMetadata?.role !== 'paid') {
            if (wordCount > 20) {
                setError('Free users cannot submit more than 20 words');
                setText(''); // Clear the text input
                // Set lockout in user metadata
                try {
                    const response = await fetch('/api/set-role', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            userId: user.id, 
                            role: 'free',
                            lastExceedTime: Date.now(),
                            canAccess: false // Set canAccess to false when entering lockout
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to set lockout');
                    }

                    // Force sign out immediately
                    await signOut();
                    window.location.href = '/auth/signIn?error=timeout';
                    return;
                } catch (error) {
                    console.error('Failed to set lockout period:', error);
                    await signOut();
                    window.location.href = '/auth/signIn';
                    return;
                }
            }
        }

        // Check for paid user token restrictions
        if (user?.publicMetadata?.role === 'paid' && wordCount > availableTokens) {
            setError('Insufficient tokens for this submission');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/app/api/generate', {
                text: text
            });
            setCorrection(response.data.correctedText);
            
            // Highlight differences
            const highlighted = highlightDifferences(text, response.data.correctedText);
            setHighlightedText(highlighted);
            
            // Update tokens and submission time
            if (user?.publicMetadata?.role === 'paid') {
                const newTokenCount = availableTokens - wordCount;
                // Update Clerk metadata first
                try {
                    const res = await fetch('/api/set-role', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            role: 'paid',
                            canAccess: true,
                            tokens: newTokenCount
                        }),
                    });
                    if (res.ok) {
                        setAvailableTokens(newTokenCount);
                    } else {
                        console.error('Failed to update tokens in Clerk:', await res.text());
                        setError('Failed to update tokens in Clerk. Please try again.');
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error('Failed to update tokens in Clerk:', error);
                    setError('Failed to update tokens in Clerk. Please try again.');
                    setLoading(false);
                    return;
                }
            }
            setLastSubmissionTime(Date.now());
        } catch (error) {
            console.log("Error with the LLM, ", error);
            setError('Failed to process text. Please try again.');
        }
        setLoading(false);
    }

    const handleClear = () => {
        setText('');
        setCorrection('');
        setHighlightedText('');
        setError('');
    }

    const handleDownload = () => {
        const blob = new Blob([correction], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'corrected_text.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
        <Box display="flex" flexDirection="column" gap={2} width="100%">
            <Typography variant='h6'>
                {user?.publicMetadata?.role === 'paid' 
                    ? `Available Tokens: ${availableTokens}`
                    : `Free User - ${20 - wordCount} words remaining`}
            </Typography>
            
            {error && (
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <TextField 
                label="Enter the text you want to have edited or sent to our LLM" 
                multiline 
                rows={20} 
                value={text}
                onChange={(e) => setText(e.target.value)}
                variant='outlined'
                fullWidth
            />
            
            <Box display="flex" gap={2} alignItems="center">
                <Input
                    type="file"
                    onChange={handleFileUpload}
                    sx={{ display: 'none' }}
                    id="file-upload"
                />
                <label htmlFor="file-upload">
                    <Button variant="contained" component="span">
                        Upload Text File
                    </Button>
                </label>
            </Box>

            <Typography variant='h6'>Word count: {wordCount}</Typography>
            
            <Box display="flex" gap={2} alignItems="center">
                <Button 
                    variant='contained' 
                    color="primary" 
                    onClick={handleSubmit} 
                    disabled={loading || text.trim() === ''}
                >
                    {loading ? "Processing..." : "Submit"}
                </Button>
                <Button variant='contained' color="secondary" onClick={handleClear}>Clear</Button>
                {correction && (
                    <Button variant='contained' color="success" onClick={handleDownload}>
                        Download Corrected Text
                    </Button>
                )}
            </Box>

            {highlightedText && (
                <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>Corrected Text (Yellow highlights show changes):</Typography>
                    <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
                </Box>
            )}
        </Box>
       </> 
    );
}
