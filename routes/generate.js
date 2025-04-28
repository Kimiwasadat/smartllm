const express = require('express')
const router = express.Router()
const axios = require('axios')
const {LLMTextEditor} = require('../services/openaiService.cjs');
require('dotenv').config()


router.post('/', async (req,res) => {
    const {text} = req.body;
    try{
        const correctedText = await LLMTextEditor(text)
        res.json({correctedText})
    }
        catch (error) {    
            console.error(error.response?.data || error.message)
            res.status(500).json({error: 'Failed to correct text'})
        }
});
 module.exports = router;