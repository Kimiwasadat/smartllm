'use client'
import {Box, Paper, Button, Stack, Typography} from '@mui/material'
import CheckIcon from '@mui/icons-material/CheckCircle';


export default function PricingScreen(){
    return(
        <>
        
        <h1 style={{alignItems:'left'}}>Pricing</h1>
        <Stack direction= 'row' spacing={2}>
            <Box sx={{display:"flex", gap:3, justifyContent:'center', }}>
            <Paper sx={{p:3, width:350}}>
            <Box sx={{alignItems:'center'}}>
                <Typography>Free Plan</Typography>
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5 }}>
                <Typography variant="h4" fontWeight="bold">$0</Typography><Typography variant="subtitle1" fontWeight="medium">Per month</Typography>
                </Box>
                <Typography>Explore how SmartLLM works risk-free</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>Submit up to 20 words per request</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>LLM grammar/syntax correction included</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>Submit every 3 minutes (cooldown)</Typography>
                </Box>
                <Button sx={{alignContent:'center'}}>Start here</Button>
            </Box>
            </Paper>
            <Paper sx={{p:3, width:350}}>
            <Box sx={{alignItems:'center'}}>
                <Typography>Paid User</Typography>
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5 }}>
                <Typography variant="h4" fontWeight="bold">$20</Typography><Typography variant="subtitle1" fontWeight="medium">Per month</Typography>
                </Box>
                <Typography>Unlock your writing superpowers — pay only for what you use.</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>Buy tokens, use them for Submitting, Saving and Inviting collaborators</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>Take advantage of the ability of saving your work and collaborating with others</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>Have the ability to collaborate on work with other users</Typography>
                </Box>
                <Button sx={{alignContent:'center'}}>Take me there</Button>
            </Box>
            </Paper>
            <Paper sx={{p:3, width:350}}>
            <Box sx={{alignItems:'center'}}>
                <Typography>Super User</Typography>
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5 }}>
                <Typography variant="h4" fontWeight="bold">$100+</Typography><Typography variant="subtitle1" fontWeight="medium">Per month</Typography>
                </Box>
                <Typography>Everything that you need, all at your fingertips</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>Access to <b>admin dashboard</b></Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>Approve/suspend/free/paid users</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>Manage token economy</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>Maintain word blacklist and complaints from other users</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="success" />
                    <Typography>See system-wide stats: usage, tokens, errors</Typography>
                </Box>
                <Button sx={{alignContent:'center'}}>Make me superuser</Button>
            </Box>
            </Paper>
            </Box>
        </Stack>
        </>
    );
}