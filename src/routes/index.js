const express = require('express') ;
const router = express.Router() ;
const User = require('../models/User') ;
const { jsonRes, authenticateToken } = require('../utils/functions') ;
const AuthRouter = require('./auth') ;
const StaffRouter = require('./staff') ;
const StudentRouter = require('./student') ;

router.use(AuthRouter) ;
router.use('/staff', authenticateToken, StaffRouter) ;
router.use('/student', authenticateToken, StudentRouter) ;

router.get('/check', async (req, res) => {
    const username = req.query.name ;
    try{
        if (!username){
            throw new Error('Username either empty or not provided') ;
        }
        else{
            const result = await User.findOne({
                where: {
                    username
                }
            }) ;

            if (result){
                res.json(jsonRes({
                    exists: true
                })) ;
            }
            else{
                res.json(jsonRes({
                    exists: false
                })) ;
            }
        }
    }
    catch(err){
        res.status(500).json(jsonRes(null, err.message)) ;
    }
}) ;

module.exports = router ;