'use client';
import { useState, useEffect } from 'react'
import { TextField, Button, Box, Typography, Input, Alert, RadioGroup, Radio, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, FormLabel } from '@mui/material'
import axios from 'axios'
import "@fontsource/inter"; // Defaults to weight 400
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { checkForBlacklistedWords, getBlacklistedWords } from '@/firebase/blacklistUtils';

export default function TextInput() {
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
    const [correctionType, setCorrectionType] = useState('llm') // 'llm' or 'self'
    const [selfCorrectedText, setSelfCorrectedText] = useState('')
    const [showCorrectionDialog, setShowCorrectionDialog] = useState(false)
    const [currentCorrections, setCurrentCorrections] = useState([])
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectionDialog, setShowRejectionDialog] = useState(false)
    const [savedCorrectWords, setSavedCorrectWords] = useState(new Set())
    const [successMessage, setSuccessMessage] = useState('')
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

    const handleCorrectionTypeChange = (event) => {
        setCorrectionType(event.target.value);
        // Reset correction states when switching types
        setCorrection('');
        setHighlightedText('');
        setSelfCorrectedText('');
    };

    const handleSelfCorrection = async () => {
        if (!selfCorrectedText.trim()) {
            setError('Please enter your corrections');
            return;
        }

        const originalWords = text.trim().split(/\s+/);
        const correctedWords = selfCorrectedText.trim().split(/\s+/);
        let correctedCount = 0;

        // Count words that were changed
        for (let i = 0; i < Math.min(originalWords.length, correctedWords.length); i++) {
            if (originalWords[i] !== correctedWords[i]) {
                correctedCount++;
            }
        }

        // Calculate token cost (half of corrected words)
        const tokenCost = Math.ceil(correctedCount / 2);

        if (tokenCost > availableTokens) {
            setError(`Insufficient tokens. Self-correction would cost ${tokenCost} tokens.`);
            return;
        }

        try {
            // Update tokens
            const newTokenCount = availableTokens - tokenCost;
            const res = await fetch('/api/set-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    role: user.publicMetadata?.role,
                    tokens: newTokenCount,
                    canAccess: true
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update tokens');
            }

            setAvailableTokens(newTokenCount);
            setCorrection(selfCorrectedText);
            setHighlightedText(highlightDifferences(text, selfCorrectedText));
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to process self-correction. Please try again.');
        }
    };

    const findDifferences = (original, corrected) => {
        const originalWords = original.split(/\s+/);
        const correctedWords = corrected.split(/\s+/);
        const differences = [];

        for (let i = 0; i < Math.max(originalWords.length, correctedWords.length); i++) {
            if (originalWords[i] !== correctedWords[i] && !savedCorrectWords.has(originalWords[i])) {
                differences.push({
                    original: originalWords[i],
                    corrected: correctedWords[i],
                    index: i
                });
            }
        }
        return differences;
    };

    const handleLLMCorrection = async (correctedText) => {
        const differences = findDifferences(text, correctedText);
        setCurrentCorrections(differences);
        
        // Check for bonus condition: no errors in text > 10 words
        const wordCount = text.trim().split(/\s+/).length;
        if (differences.length === 0 && wordCount > 10) {
            try {
                // Add 3 token bonus
                const newTokenCount = availableTokens + 3;
                const res = await fetch('/api/set-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        role: user.publicMetadata?.role,
                        tokens: newTokenCount,
                        canAccess: true
                    }),
                });

                if (!res.ok) throw new Error('Failed to update tokens');
                setAvailableTokens(newTokenCount);
                setError(''); // Clear any existing errors
                setSuccessMessage('Perfect text! You received a bonus of 3 tokens.');
                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(''), 5000);
            } catch (error) {
                console.error('Failed to add bonus tokens:', error);
            }
        }

        if (differences.length > 0) {
            setShowCorrectionDialog(true);
        } else {
            setCorrection(correctedText);
            setHighlightedText(correctedText);
        }
    };

    const handleAcceptCorrection = async (correction) => {
        // Deduct 1 token for accepting correction
        try {
            const newTokenCount = availableTokens - 1;
            const res = await fetch('/api/set-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    role: user.publicMetadata?.role,
                    tokens: newTokenCount,
                    canAccess: true
                }),
            });

            if (!res.ok) throw new Error('Failed to update tokens');
            setAvailableTokens(newTokenCount);
        } catch (error) {
            setError('Failed to update tokens. Please try again.');
            return;
        }
    };

    const handleRejectCorrection = (correction) => {
        setSavedCorrectWords(prev => new Set([...prev, correction.original]));
    };

    const handleFullRejection = async () => {
        if (!rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        try {
            // Submit rejection reason to super-user review
            await fetch('/api/submit-rejection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    text,
                    correction,
                    reason: rejectionReason
                }),
            });

            // Default to 5 token deduction, super-user can refund 4 later if accepted
            const newTokenCount = availableTokens - 5;
            const res = await fetch('/api/set-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    role: user.publicMetadata?.role,
                    tokens: newTokenCount,
                    canAccess: true
                }),
            });

            if (!res.ok) throw new Error('Failed to update tokens');
            setAvailableTokens(newTokenCount);
            setShowRejectionDialog(false);
            setRejectionReason('');
        } catch (error) {
            setError('Failed to submit rejection. Please try again.');
        }
    };

    const handleSubmit = async () => {
        setError('');

        const blacklisted = await getBlacklistedWords();
        const words = text.trim().split(/\s+/);

        let censoredTextArray = [];
        let censoredWords = [];
        let totalBlacklistTokenCost = 0;

        // Replace blacklisted words with **** and calculate token cost
        for (const word of words) {
            const clean = word.replace(/[^\w]/g, '').toLowerCase(); // clean punctuation
            if (blacklisted.has(clean)) {
                censoredWords.push(word);
                censoredTextArray.push('*'.repeat(word.length));
                totalBlacklistTokenCost += word.length;
            } else {
                censoredTextArray.push(word);
            }
        }

        const censoredText = censoredTextArray.join(' ');

        // Check if user has enough tokens for blacklisted words
        if (totalBlacklistTokenCost > availableTokens) {
            setError(`Insufficient tokens. Blacklisted words would cost ${totalBlacklistTokenCost} tokens.`);
            return;
        }

        // 🚫 Free user word limit
        if (user?.publicMetadata?.role !== 'paid') {
            if (wordCount > 20) {
                setError('Free users cannot submit more than 20 words');
                setText('');
                try {
                    const response = await fetch('/api/set-role', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            role: 'free',
                            lastExceedTime: Date.now(),
                            canAccess: false
                        }),
                    });

                    if (!response.ok) throw new Error('Failed to set lockout');

                    await signOut();
                    window.location.href = '/auth/signIn?error=timeout';
                    return;
                } catch (error) {
                    console.error('Lockout error:', error);
                    await signOut();
                    window.location.href = '/auth/signIn';
                    return;
                }
            }
        }

        setLoading(true);
        try {
            // First, deduct tokens for blacklisted words
            if (totalBlacklistTokenCost > 0) {
                const newTokenCount = availableTokens - totalBlacklistTokenCost;
                const res = await fetch('/api/set-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        role: user.publicMetadata?.role,
                        tokens: newTokenCount,
                        canAccess: true
                    }),
                });

                if (!res.ok) {
                    throw new Error('Failed to update tokens');
                }
                
                // Update local token count
                setAvailableTokens(newTokenCount);
            }

            // Then process the text with LLM
            const response = await axios.post('http://localhost:8000/app/api/generate', {
                text: censoredText
            });

            // Instead of setting correction directly, handle it through the review process
            await handleLLMCorrection(response.data.correctedText);
            setLastSubmissionTime(Date.now());

        } catch (error) {
            console.error('Error:', error);
            setError(error.message === 'Failed to update tokens' 
                ? 'Failed to update tokens. Please try again.' 
                : 'Failed to process text. Try again.');
        }

        setLoading(false);
    };

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

                {successMessage && (
                    <Alert severity="success" onClose={() => setSuccessMessage('')}>
                        {successMessage}
                    </Alert>
                )}

                <FormControl component="fieldset">
                    <FormLabel component="legend">Correction Type</FormLabel>
                    <RadioGroup
                        row
                        value={correctionType}
                        onChange={handleCorrectionTypeChange}
                    >
                        <FormControlLabel value="llm" control={<Radio />} label="LLM Correction" />
                        <FormControlLabel value="self" control={<Radio />} label="Self Correction" />
                    </RadioGroup>
                </FormControl>

                <TextField
                    label="Enter the text you want to have edited"
                    multiline
                    rows={10}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    variant='outlined'
                    fullWidth
                />

                {correctionType === 'self' && (
                    <TextField
                        label="Enter your corrections"
                        multiline
                        rows={10}
                        value={selfCorrectedText}
                        onChange={(e) => setSelfCorrectedText(e.target.value)}
                        variant='outlined'
                        fullWidth
                    />
                )}

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
                        onClick={correctionType === 'self' ? handleSelfCorrection : handleSubmit}
                        disabled={loading || text.trim() === '' || (correctionType === 'self' && !selfCorrectedText.trim())}
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
                        <Typography variant="h6" gutterBottom>
                            Corrected Text (Yellow highlights show changes):
                        </Typography>
                        <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
                    </Box>
                )}

                {/* Dialog for handling LLM corrections */}
                <Dialog open={showCorrectionDialog} onClose={() => setShowCorrectionDialog(false)}>
                    <DialogTitle>Review Corrections</DialogTitle>
                    <DialogContent>
                        {currentCorrections.map((correction, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography>
                                    Original: {correction.original}
                                    <br />
                                    Suggested: {correction.corrected}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                    <Button onClick={() => handleAcceptCorrection(correction)}>
                                        Accept (1 token)
                                    </Button>
                                    <Button onClick={() => handleRejectCorrection(correction)}>
                                        Save as Correct
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRejectionDialog(true)}>
                            Reject All Corrections
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog for rejection reason */}
                <Dialog open={showRejectionDialog} onClose={() => setShowRejectionDialog(false)}>
                    <DialogTitle>Provide Rejection Reason</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Reason for rejection"
                            fullWidth
                            multiline
                            rows={4}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Note: Rejection will cost 5 tokens. If super-user accepts your reason, 4 tokens will be refunded.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRejectionDialog(false)}>Cancel</Button>
                        <Button onClick={handleFullRejection} color="primary">
                            Submit Rejection
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
}
