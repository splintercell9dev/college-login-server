const jwt = require('jsonwebtoken') ;
const { ValidationError } = require('sequelize');
const { FieldError } = require('./custom-error');
const { MulterError } = require('multer');

function errorResp(eObj){
    if (eObj instanceof ValidationError){
        return eObj.errors.reduce( (obj, item) => {
            if (!obj.hasOwnProperty(item.path)){
                obj[item.path] = item.message ;
            }
            return obj ;
        }, {}) ;
    }
    else if (eObj instanceof MulterError){
        return {
            file: eObj.message
        } ;
    }
    else if (eObj instanceof FieldError){
        return {
            [eObj.field]: eObj.message
        }
    }
    else{
        return {
            default: eObj.message
        }
    }
}

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
            return res.status(403).json(jsonRes(null, errorResp(err))) ;
        }
        req.user = user ;
        next() ;
    }) ;
}

function generateToken(user, refresh = false){
    return refresh ? jwt.sign(user, process.env.SERVER_REFRESH_TOKEN, { expiresIn: '1d' }) : jwt.sign(user, process.env.SERVER_ACCESS_TOKEN, { expiresIn: '15m' }) ;
}

function genNewTokens(user, refreshToken = null){
    if (!refreshToken){
        return {
            accessToken: generateToken(user),
            refreshToken: generateToken(user, true)
        } ;
    }

    return {
        accessToken: generateToken(user),
        refreshToken
    } ;
}

module.exports = {
    jsonRes,
    authenticateToken,
    generateToken,
    genNewTokens,
    errorResp
} ;