const PORT = 8000
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const generateRoutes = require('./routes/generate')
require('dotenv').config()

const app = express()
app.use(cors());
app.use(express.json());

app.use('/app/api/generate', generateRoutes);

app.get('/', (req, res) => {
    res.json('working up and maybe running also fuck jie wei :)')
    
})


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
