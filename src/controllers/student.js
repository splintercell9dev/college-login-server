const { ValidationError } = require("sequelize");
const multer = require('multer') ;
const crypto = require('crypto') ;
const fs = require('fs') ;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'pdf/') ;
    },
    filename: (req, file, cb) => {
        cb(null, crypto.randomBytes(16).toString('hex') + '.pdf') ;
    }
}) ;

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf'){
            cb(new Error("Only pdf files can be uploaded"))
        }
        cb(null, true)
    },
    limits: {
        fileSize: 1024 * 1024
    }
}).single('file') ;

const { jsonRes, errorResp } = require("../utils/functions");
const Student = require("../models/Student");
const { FieldError } = require("../utils/custom-error");
const { students } = require("../db");

async function getDetails(req, res){
    try{
        const result = await Student.findOne({
            where: {
                id: req.user.id
            }
        }) ;

        if (!result){
            return res.json(jsonRes(null)) ;
        }

        res.json(jsonRes({
            fullName: result.fullName,
            email: result.email,
            contact: result.contact,
            address: result.address
        })) ;
    }
    catch(err){
        res.status(err instanceof ValidationError ? 400 : 500).json(jsonRes(null, errorResp(err))) ;
    }
}

function postDetails(req, res){
    upload(req, res, async (err) => {
        const transaction = await students.transaction() ;

        try{
            if (err){
                throw err ;
            }
    
            if (!req.file){
                throw new FieldError('file', 'A pdf file is required.') ;
            }

            const otherDetails = req.body ;
            const findResult = await Student.findOne({
                where: {
                    id: req.user.id
                }
            }, { transaction }) ;

            if (findResult){
                throw new Error('Students cannot re-upload their details again.') ;
            }

            await Student.create({
                ...otherDetails,
                id: req.user.id,
                fileName: req.file.filename
            }, { transaction }) ;

            await transaction.commit() ;

            res.json({
                success: true
            }) ;
        }
        catch(err){
            await transaction.rollback() ;
                if (req.file){
                    const path = "pdf/" + req.file.filename ;
                if (fs.existsSync(path)){
                    console.log('Removed file.', req.file.filename) ;
                    fs.unlinkSync(path) ;
                }
            }
            res.status(err instanceof ValidationError || err instanceof multer.MulterError ? 400 : 500).json(jsonRes(null, errorResp(err))) ;
        }
    }) ;
}

module.exports = {
    getDetails,
    postDetails
} ;