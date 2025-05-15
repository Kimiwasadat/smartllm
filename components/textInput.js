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
    const [correctedText, setCorrectedText] = useState('')
    const [loading, setLoading] = useState(false)
    const [availableTokens, setAvailableTokens] = useState(0)
    const [lastSubmissionTime, setLastSubmissionTime] = useState(null)
    const [error, setError] = useState('')
    const [correctionType, setCorrectionType] = useState('llm') // 'llm' or 'self'
    const [selfCorrectedText, setSelfCorrectedText] = useState('')
    const [showCorrectionDialog, setShowCorrectionDialog] = useState(false)
    const [corrections, setCorrections] = useState([])
    const [savedCorrectWords, setSavedCorrectWords] = useState(new Set())
    const [successMessage, setSuccessMessage] = useState('')
    const [showResult, setShowResult] = useState(false)
    const [highlightedText, setHighlightedText] = useState('')
    const [currentCorrectionIndex, setCurrentCorrectionIndex] = useState(0);
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const [words, setWords] = useState([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [showWordDialog, setShowWordDialog] = useState(false);
    const [currentCorrection, setCurrentCorrection] = useState(null);
    const [acceptedCorrections, setAcceptedCorrections] = useState([]);

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

    const createHighlightedText = (originalText, corrections) => {
        let result = originalText;
        
        // Sort corrections by index in reverse order to avoid position shifts
        const sortedCorrections = [...corrections].sort((a, b) => b.index - a.index);
        
        // First handle corrections
        for (const correction of sortedCorrections) {
            const words = result.split(/\s+/);
            if (correction.index < words.length) {
                words[correction.index] = `<span class="correction">${correction.corrected}</span>`;
                result = words.join(' ');
            }
        }

        // Then handle blacklisted words (already censored with asterisks)
        result = result.replace(/(\*+)/g, '<span class="blacklisted">$1</span>');
        
        console.log('Highlighted text result:', {
            input: originalText,
            output: result,
            corrections: corrections
        });

        return result;
    };

    const findCorrections = (original, corrected) => {
        if (!original || !corrected) return [];
        
        const originalWords = original.split(/\s+/);
        const correctedWords = corrected.split(/\s+/);
        const differences = [];

        for (let i = 0; i < Math.min(originalWords.length, correctedWords.length); i++) {
            const originalWord = originalWords[i];
            const correctedWord = correctedWords[i];

            // Only add to corrections if:
            // 1. Words are different
            // 2. Word hasn't been marked as correct
            // 3. Both words exist
            if (originalWord !== correctedWord && 
                !savedCorrectWords.has(originalWord) && 
                originalWord && correctedWord) {
                differences.push({
                    original: originalWord,
                    corrected: correctedWord,
                    index: i
                });
            }
        }
        return differences;
    };

    const handleCorrectionTypeChange = (event) => {
        setCorrectionType(event.target.value);
        setCorrectedText('');
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

        for (let i = 0; i < Math.min(originalWords.length, correctedWords.length); i++) {
            if (originalWords[i] !== correctedWords[i]) {
                correctedCount++;
            }
        }

        const tokenCost = Math.ceil(correctedCount / 2);

        if (tokenCost > availableTokens) {
            setError(`Insufficient tokens. Self-correction would cost ${tokenCost} tokens.`);
            return;
        }

        try {
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
            setCorrectedText(selfCorrectedText);
            setHighlightedText(createHighlightedText(text, findCorrections(text, selfCorrectedText)));
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to process self-correction. Please try again.');
        }
    };

    const processNextWord = () => {
        if (currentWordIndex + 1 < words.length) {
            setCurrentWordIndex(prev => prev + 1);
        } else {
            setShowWordDialog(false);
            setCurrentWordIndex(0);
        }
    };

    const handleSubmit = async () => {
        if (!text.trim()) {
            setError('Please enter some text');
            return;
        }

        setError('');
        setLoading(true);
        setCorrectedText('');
        setCorrections([]);
        setHighlightedText('');
        setAcceptedCorrections([]);
        setCurrentCorrection(null);
        setSavedCorrectWords(new Set());

        try {
            // First check for blacklisted words
            const blacklistCheck = await checkForBlacklistedWords(text);
            const tokenCostFromBlacklist = blacklistCheck.blacklistedCount;

            console.log('Blacklist check results:', {
                originalText: text,
                censoredText: blacklistCheck.censoredText,
                hasBlacklistedWords: blacklistCheck.hasBlacklistedWords,
                tokenCost: tokenCostFromBlacklist,
                currentTokens: availableTokens
            });

            // Split text into words and initialize
            const textWords = text.split(/\s+/);
            setWords(textWords);
            setCurrentWordIndex(0);
            
            // Set initial display text with censored blacklisted words
            setHighlightedText(createHighlightedText(blacklistCheck.censoredText, []));
            
            if (tokenCostFromBlacklist > availableTokens) {
                setError(`Insufficient tokens. Processing blacklisted words would cost ${tokenCostFromBlacklist} tokens (1 token per character in blacklisted words).`);
                setLoading(false);
                return;
            }

            // Update tokens for blacklisted words
            if (tokenCostFromBlacklist > 0) {
                const newTokenCount = availableTokens - tokenCostFromBlacklist;
                console.log('Deducting tokens for blacklisted words:', {
                    oldTokenCount: availableTokens,
                    deduction: tokenCostFromBlacklist,
                    newTokenCount: newTokenCount
                });

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
                    throw new Error('Failed to update tokens for blacklisted words');
                }

                setAvailableTokens(newTokenCount);
            }

            setShowWordDialog(true);
            setShowResult(true);

        } catch (error) {
            console.error('Error:', error);
            setError('Failed to process text. Please try again.');
        }

        setLoading(false);
    };

    const handleProcessWord = async (action) => {
        if (!words[currentWordIndex]) return;

        try {
            if (action === 'save') {
                // Save word as correct
                setSavedCorrectWords(prev => new Set([...prev, words[currentWordIndex]]));
                processNextWord();
            } else if (action === 'correct') {
                if (availableTokens < 1) {
                    setError('Insufficient tokens');
                    return;
                }

                // Get LLM correction for single word
                const response = await axios.post('http://localhost:8000/app/api/generate', {
                    text: words[currentWordIndex]
                });

                if (!response.data || !response.data.correctedText) {
                    throw new Error('Failed to get correction');
                }

                const correctedText = response.data.correctedText.trim().toLowerCase();
                const originalWord = words[currentWordIndex];

                // Check for special responses indicating no errors or text too short
                const noErrorPatterns = [
                    'no grammar or spelling error',
                    'no errors found',
                    'no spelling mistakes',
                    'no grammatical errors',
                    'text is correct',
                    'word is correct',
                    'this text is too short',
                    'too short to review',
                    'no changes needed'
                ];

                const isNoErrorResponse = noErrorPatterns.some(pattern => 
                    correctedText.includes(pattern.toLowerCase())
                );

                if (isNoErrorResponse || correctedText === originalWord.toLowerCase()) {
                    // If it's a "no error" response or the word is unchanged, 
                    // automatically save as correct and move to next word
                    setSavedCorrectWords(prev => new Set([...prev, originalWord]));
                    processNextWord();
                } else {
                    // Only show correction dialog if there's an actual correction
                    setCurrentCorrection({
                        original: originalWord,
                        corrected: response.data.correctedText.trim(),
                        index: currentWordIndex
                    });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to process word. Please try again.');
        }
    };

    const handleAcceptCorrection = async (correction) => {
        if (availableTokens < 1) {
            setError('Insufficient tokens');
            return;
        }

        try {
            // Deduct one token for accepting the correction
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

            // Add to accepted corrections
            setAcceptedCorrections(prev => [...prev, correction]);

            // Update the text array
            const updatedWords = [...words];
            updatedWords[correction.index] = correction.corrected;
            setWords(updatedWords);

            // Update the display text
            const displayText = updatedWords.join(' ');
            const blacklistCheck = await checkForBlacklistedWords(displayText);
            const finalText = blacklistCheck.censoredText;
            
            // Update highlighted text with all accepted corrections
            setHighlightedText(createHighlightedText(finalText, [...acceptedCorrections, correction]));
            setText(displayText);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to apply correction');
        }
    };

    const handleSaveAsCorrect = (correction) => {
        // Add the word to saved correct words
        setSavedCorrectWords(prev => new Set([...prev, correction.original]));
        
        // Remove this correction from the list
        const remainingCorrections = corrections.filter(c => c.index !== correction.index);
        setCorrections(remainingCorrections);
        
        // Update highlighted text
        if (remainingCorrections.length > 0) {
            setHighlightedText(createHighlightedText(text, remainingCorrections));
        } else {
            setHighlightedText('');
            setShowCorrectionDialog(false);
        }
    };

    const handleClear = () => {
        setText('');
        setCorrectedText('');
        setHighlightedText('');
        setError('');
        setShowResult(false);
    }

    const handleDownload = async (type = 'corrected') => {
        if (user?.publicMetadata?.role !== 'paid') {
            setError('Download feature is only available for paid users.');
            return;
        }

        if (availableTokens < 5) {
            setError('Insufficient tokens for download. You need 5 tokens to download.');
            return;
        }

        try {
            const newTokenCount = availableTokens - 5;
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

            if (!res.ok) {
                throw new Error('Failed to update tokens');
            }

            setAvailableTokens(newTokenCount);
        } catch (error) {
            console.error('Failed to update tokens for download:', error);
            setError('Failed to process download. Please try again.');
            return;
        }

        let content = '';
        let filename = '';
        
        switch(type) {
            case 'corrected':
                content = correctedText;
                filename = 'corrected_text.txt';
                break;
            case 'original':
                content = text;
                filename = 'original_text.txt';
                break;
            case 'both':
                content = `Original Text:\n${text}\n\nCorrected Text:\n${correctedText}`;
                filename = 'text_comparison.txt';
                break;
            case 'highlighted':
                content = highlightedText;
                filename = 'highlighted_changes.html';
                break;
            default:
                content = correctedText;
                filename = 'corrected_text.txt';
        }

        const blob = new Blob([content], { 
            type: type === 'highlighted' ? 'text/html' : 'text/plain' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
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
                    {correctedText && user?.publicMetadata?.role === 'paid' && (
                        <Button variant='contained' color="success" onClick={handleDownload}>
                            Download Corrected Text
                        </Button>
                    )}
                </Box>

                {showResult && correctedText && (
                    <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            Text with Suggested Corrections:
                        </Typography>
                        <Typography 
                            component="div" 
                            dangerouslySetInnerHTML={{ __html: highlightedText || correctedText }}
                            sx={{ 
                                lineHeight: 1.6,
                                '& span': {
                                    display: 'inline-block',
                                    verticalAlign: 'middle'
                                }
                            }}
                        />
                    </Box>
                )}

                {showResult && (
                    <Box 
                        sx={{ 
                            mt: 4, 
                            p: 3, 
                            border: '1px solid #ccc', 
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Final Text with Corrections:
                        </Typography>
                        <Typography 
                            component="div" 
                            dangerouslySetInnerHTML={{ __html: highlightedText }}
                            sx={{ 
                                lineHeight: 1.8,
                                fontSize: '1.1rem',
                                '& span.correction': {
                                    backgroundColor: '#ffeb3b',
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    margin: '0 2px',
                                    border: '1px solid #fdd835'
                                },
                                '& span.blacklisted': {
                                    backgroundColor: '#ffebee',
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    margin: '0 2px',
                                    border: '1px solid #ffcdd2'
                                }
                            }}
                        />
                    </Box>
                )}

                <Dialog open={showWordDialog} onClose={() => setShowWordDialog(false)}>
                    <DialogTitle>
                        Process Word ({currentWordIndex + 1} of {words.length})
                    </DialogTitle>
                    <DialogContent>
                        {words.length > 0 && (
                            <Box sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    Current word: <span style={{ fontWeight: 'bold' }}>{words[currentWordIndex]}</span>
                                </Typography>
                                
                                {currentCorrection ? (
                                    <>
                                        <Typography>
                                            Suggested correction: <span style={{ color: 'green' }}>{currentCorrection.corrected}</span>
                                        </Typography>
                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={async () => {
                                                    await handleAcceptCorrection(currentCorrection);
                                                    setCurrentCorrection(null);
                                                    processNextWord();
                                                }}
                                            >
                                                Accept Correction (1 token)
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    setCurrentCorrection(null);
                                                    handleSaveAsCorrect({
                                                        original: words[currentWordIndex],
                                                        index: currentWordIndex
                                                    });
                                                    processNextWord();
                                                }}
                                            >
                                                Keep Original
                                            </Button>
                                        </Box>
                                    </>
                                ) : (
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleProcessWord('correct')}
                                        >
                                            Check Spelling (1 token)
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleProcessWord('save')}
                                        >
                                            Save as Correct
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </>
    );
}
