const User = require('../models/User') ;
const { ValidationError } = require('sequelize');
const { jsonRes, generateToken, errorResp, genNewTokens } = require('../utils/functions') ;
const jwt = require('jsonwebtoken') ;
const bcrypt = require('bcrypt') ;
const { users } = require('../db');
const { FieldError } = require('../utils/custom-error');

async function login(req, res){
    try{
        const { username, password, role } = req.body ;
        
        const result = await User.findOne({
            where: {
                username,
                role
            }
        }) ;

        if (!result){
            throw new Error('User not found. Please check if username, password and role is correct.') ;
        }
        else if (!await bcrypt.compare(password, result.dataValues.password)){
            console.log('password not match')
            throw new FieldError('password', 'Password doesnot match.') ;
        }

        const refToken = result.dataValues.refreshToken ;
        const signedUser = {
            id: result.dataValues.id,
            username: result.dataValues.username,
            role: result.dataValues.role
        } ;

        if (refToken !== null){
            jwt.verify(refToken, process.env.SERVER_REFRESH_TOKEN, (err, decoded) => {
                if (err)
                    throw err ;
                console.log(decoded, "done") ;
                res.json(jsonRes(genNewTokens(signedUser, refToken))) ;
            }) ;
        }
        else{
            console.log('totally new tokens');
            const { accessToken, refreshToken } = genNewTokens(signedUser) ;
            await User.update({
                refreshToken
            }, {
                where: {
                    id: signedUser.id
                }
            })
            res.json(jsonRes({ accessToken, refreshToken })) ;
        }
    }
    catch(err){
        let code = 500 ;
        if (err instanceof ValidationError || err instanceof FieldError || err instanceof jwt.TokenExpiredError)
            code = 401
        
        res.status(code).json(jsonRes(null, errorResp(err))) ;
    }
}

async function signup(req, res){
    let transaction ;
    try{
        const { username, password, role } = req.body ;
        const result = await User.findOne({
            where: {
                username,
                role
            }
        }) ;

        if (result){
            throw new FieldError('username', 'Username already exist.') ;
        }
        else{
            transaction = await users.transaction() ;
            
            const result = await User.create({
                username,
                password,
                role
            }, { transaction }) ;

            const signedUser = {
                id: result.dataValues.id,
                username: result.dataValues.username,
                role: result.dataValues.role
            } ;

            const accessToken = generateToken(signedUser) ;
            const refreshToken = generateToken(signedUser, true) ;
            
            await User.update({
                refreshToken
            },
            {
                where: {
                    id: result.dataValues.id
                },
                transaction
            }) ;

            await transaction.commit() ;
            res.json(jsonRes({ accessToken, refreshToken })) ;
        }
    }
    catch(err){
        console.error(err) ;
        if (transaction)
            await transaction.rollback() ;
        let code = 500 ;
        if (err instanceof ValidationError || err instanceof FieldError)
            code = 401 ;
        res.status(code).json(jsonRes(null, errorResp(err))) ;
    }
}

async function refresh(req, res){
    const token = req.body.refreshToken ;

    if (token === null){
        throw new Error('No token provied') ;
    }

    try{
        jwt.verify(token, process.env.SERVER_REFRESH_TOKEN, (err, decoded) => {
            if (err){
                if (err instanceof jwt.TokenExpiredError){
                    code = 401 ;
                    User.update({
                        refreshToken: null
                    }, {
                        where: {
                            refreshToken: token
                        }
                    }).catch(err => console.error(err)) ;
                }
                throw err ;
            }
    
            const accessToken = generateToken({
                id: decoded.id,
                name: decoded.name,
                role: decoded.role
            }) ;
    
            res.json(jsonRes({ accessToken })) ;
        }) ;
    }
    catch(err){
        let code = 500 ;
        if (err instanceof ValidationError || err instanceof jwt.JsonWebTokenError)
            code = 401 ;
            
        res.status(code).json(jsonRes(null, errorResp(err))) ;
    }
}

async function logout(req, res){
    const token = req.body.refreshToken ;
    let transaction ;

    try{
        transaction = await users.transaction() ;

        if (!token){
            throw new Error('No token provided.') ;
        }

        const results = await User.findOne({
            where: {
                refreshToken: token
            }
        }, { transaction }) ;

        if (results){
            await User.update({
                refreshToken: null
            }, {
                where: {
                    id: results.dataValues.id
                }
            }) ;
        }

        await transaction.commit() ;
        res.sendStatus(204) ;
    }
    catch(err){
        console.error(err) ;
        await transaction.rollback() ;
        res.status(500).json(jsonRes(null, errorResp(err)))
    }
}

module.exports = {
    login,
    signup,
    refresh,
    logout
} ;