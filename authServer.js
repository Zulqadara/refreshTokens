const express = require('express')
require('dotenv').config()
const app = express()
const jwt = require('jsonwebtoken')


app.use(express.json())

let refreshTokens = [] //Store refresh token in DB/Redis in prod

app.post('/token', (req, res)=>{
    const refreshToken = req.body.token 
    if(refreshToken == null) return res.sendStatus(401)

    if (!refreshTokens.includes(refreshToken)) res.sendStatus(403)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
        if(err) res.sendStatus(403)
        const accessToken = generateAccessToken({name:user.name})
        res.json({accessToken})
    })
})

app.delete('/logout', (req, res) =>{
    refreshTokens = refreshTokens.filter(token => token !== req.body.token )
    return res.sendStatus(204)
})

app.post('/login', (req, res)=>{
    //Authenticate User
    const username = req.body.username
    const user = {name: username}
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({accessToken, refreshToken})
})

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' }) //in real applications its longer
}

app.listen(4000)