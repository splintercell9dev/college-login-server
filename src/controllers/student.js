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

const { jsonRes } = require("../utils/functions");
const Student = require("../models/Student");

async function getDetails(req, res){
    try{
        const result = await Student.findOne({
            where: {
                id: req.user.id
            }
        }) ;

        if (!result){
            throw new Error("User cannot be found.") ;
        }

        res.json(jsonRes({
            name: result.name,
            email: result.email,
            contact: result.contact,
            address: result.address,
            fileName: result.fileName,
            updated: result.updated,
            updatedAt: result.updatedAt
        })) ;
    }
    catch(err){
        res.status(err instanceof ValidationError ? 400 : 500).json(jsonRes(null, err.message)) ;
    }
}

function postDetails(req, res){
    upload(req, res, async (err) => {
        if (err){
            return res.status(err instanceof multer.MulterError ? 400 : 500).json(jsonRes(null, err.message)) ;
        }
        if (!req.file){
            return res.status(400).json(jsonRes(null, 'A pdf file is required.')) ;
        }

        try{
            const otherDetails = req.body ;
            const [affectedRows] = await Student.update({
                ...otherDetails,
                updated: true,
                fileName: req.file.filename
            }, 
            {
                where: {
                    id: req.user.id,
                    updated: false
                }
            }) ;

            if (!affectedRows){
                return res.status(400).json(jsonRes(null, 'Fields have already been saved. User cannot re-upload their form.'))
            }

            res.json({
                success: true
            }) ;
        }
        catch(err){
            const path = "pdf/" + req.file.filename ;
            if (fs.existsSync(path)){
                console.log('Removed file.') ;
                fs.unlinkSync(path) ;
            }
            res.status(err instanceof ValidationError ? 400 : 500).json(jsonRes(null, err.message)) ;
        }
    }) ;
}

module.exports = {
    getDetails,
    postDetails
} ;