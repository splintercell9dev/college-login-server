const jwt = require('jsonwebtoken') ;

function jsonRes(data, error = null){
    return {
        error,
        data
    } ;
}

function authenticateToken(req, res, next){
    const auth = req.headers['authorization'] ;
    const token = auth && auth.split(' ')[1] ;

    if (token === null){
        return res.status(401).json(jsonRes(null, 'Empty token provided')) ;
    }
    
    jwt.verify(token, process.env.SERVER_ACCESS_TOKEN, (err, user) => {
        if (err){
            return res.status(403).json(jsonRes(null, 'Invalid token or access token has been expired.')) ;
        }
        req.user = user ;
        next() ;
    }) ;
}

function generateToken(user, refresh = false){
    return refresh ? jwt.sign(user, process.env.SERVER_REFRESH_TOKEN) : jwt.sign(user, process.env.SERVER_ACCESS_TOKEN, { expiresIn: '15m' }) ;
}

module.exports = {
    jsonRes,
    authenticateToken,
    generateToken
} ;