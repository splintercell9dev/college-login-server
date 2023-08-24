const User = require('../models/User') ;
const { ValidationError, json } = require('sequelize');
const { jsonRes, generateToken } = require('../utils/functions') ;
const Student = require('../models/Student');
const jwt = require('jsonwebtoken') ;

let tokenArr = [] ;

async function login(req, res){
    try{
        const { username, password, role } = req.body ;
        
        if (!username || username.length < 5 || username > 20){
            return res.status(401).json(jsonRes('Invalid username')) ;
        }
        else if (!password || !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,16}$/.test(password)){
            return res.status(401).json(jsonRes(null, 'Password is not valid.')) ;
        }
        else if (!['STUDENT', 'STAFF'].includes(role)){
            return res.status(401).json(jsonRes(null, 'Roles provided are invalid')) ;
        }

        const result = await User.findOne({
            where: {
                username
            }
        }) ;

        if (!result){
            return res.status(401).json(jsonRes(null, 'User not found. Please check if username and password is correct.')) ;
        }
        else if (result.dataValues.role !== req.body.role){
            return res.status(401).json(jsonRes(null, 'User trying for provided role doesnot exist.')) ;
        }

        const signedUser = {
            id: result.dataValues.id,
            username: result.dataValues.username,
            role: result.dataValues.role
        }

        const accessToken = generateToken(signedUser) ;
        const refreshToken = generateToken(signedUser, true) ;

        res.json(jsonRes({ user: signedUser, accessToken, refreshToken })) ;
    }
    catch(err){
        res.status(err instanceof ValidationError ? 400 : 500).json(jsonRes(null, err.message)) ;
    }
}

async function signup(req, res){
    try{
        const { username, password, role } = req.body ;
        const result = await User.findOne({
            where: {
                username
            }
        }) ;

        if (result){
            throw new Error('Username already exist. Please create account with new Username') ;
        }
        else{
            const user = { username, password, role } ;
            const result = await User.create(user) ;
            if (user.role === 'STUDENT'){
                await Student.create({
                    id: result.dataValues.id
                }) ;
            }

            const signedUser = {
                id: result.dataValues.id,
                username: result.dataValues.username,
                role: result.dataValues.role
            } ;

            const accessToken = generateToken(signedUser) ;
            const refreshToken = generateToken(signedUser, true) ;

            tokenArr.push(refreshToken) ;
            res.json(jsonRes({ user: signedUser, accessToken, refreshToken })) ;
        }
    }
    catch(err){
        res.status(err instanceof ValidationError ? 400 : 500).json(jsonRes(null, err.message)) ;
    }
}

function refresh(req, res){
    const token = req.body.refreshToken ;   
    if (token === null){
        return res.status(401).json(jsonRes(null, 'No token provied')) ;
    }
    else if (!tokenArr.includes(token)){
        return res.status(403).json(jsonRes(null, 'Refresh token doesnot exist')) ;
    }

    jwt.verify(token, process.env.SERVER_REFRESH_TOKEN, (err, user) => {
        if (err){
            return res.status(403).json(jsonRes(null, 'Refresh token invalid.')) ;
        }

        const accessToken = generateToken({
            id: user.id,
            name: user.name,
            role: user.role
        }) ;

        res.json(jsonRes({ accessToken })) ;
    }) ; 
}

function logout(req, res){
    const refreshToken = req.body.refreshToken ;
    
    if (refreshToken === null){
        return res.status(403).json(jsonRes('Refresh token not defined')) ;
    }

    tokenArr = tokenArr.filter(token => token === refreshToken) ;
    res.sendStatus(204) ;
}

module.exports = {
    login,
    signup,
    refresh,
    logout
} ;