'use client';
import {useState} from 'react'
import { TextField, Button, Box, Typography } from '@mui/material'
import axios from 'axios'
import "@fontsource/inter"; // Defaults to weight 400


export default function TextInput(){
    const [text, setText] = useState('')
    const [correction, setCorrection] = useState('')
    const [loading, setLoading] = useState(false)
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const fileUpload  = (event) => {
        const file = event.target.files[0]
        if (!file) return;
        const reader = new FileReader()
        reader.onload = (e) => {
            const fileContent = e.target.result
        }
        reader.readAsText(file)
    }
    const handleSubmit = async () => {
        setLoading(true)
        try {
            alert("Submitted text: " + text);
            const response = await axios.post('http://localhost:8000/app/api/generate', {
                text: text
            })
            setCorrection(response.data.correctedText)
        } catch (error) {
            console.log("Error with the LLM, ", error)
        }
        setLoading(false)
    }
    const handleClear = async () => {
        setText('')
        setCorrection('')
    }
    const handleDownload = () => {
        const blob = new Blob([correction], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'corrected_text.txt'
        a.click()
        URL.revokeObjectURL(url)
    }
    return (
        <>
        <Box display="flex" flexDirection="column" gap={2} width="100%">
            <TextField label="Enter the text you want to have edited or sent to our LLM" multiline rows={20} value={text}
            onChange={(e) => setText(e.target.value)}
            variant='outlined'
            fullWidth/>
            <Typography variant='h6'>Word count: {wordCount}</Typography>
            <Box display="flex" gap={2} alignItems="center">
            <Button variant='contained' color="primary" onClick={handleSubmit} disabled={loading}>{loading ? "Correcting..." : "Submit for Correction"}</Button>
            <Button variant='contained' color="secondary" onClick={handleClear}>Clear</Button>
            <Button variant='contained' color="success" onClick={handleDownload}>Download Corrected Text</Button>
            </Box>
            {correction && (
                <TextField
                label="Corrected Text"
                value={correction}
                multiline
                rows={10}
                fullWidth
                disabled
                />
            )}     
        </Box>
       </> 
    );

}

