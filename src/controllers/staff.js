const { ValidationError } = require("sequelize");
const { jsonRes } = require("../utils/functions");
const fs = require('fs') ;
const Student = require("../models/Student");

async function getStudents(req, res){
    try{
        const results = await Student.findAll({
            where: {
                updated: true
            }
        }) ;
        console.log(results) ;
        res.json(jsonRes(results)) ;
    }
    catch(err){
        console.error("from getstudents")
        res.status(err instanceof ValidationError ? 400 : 500).json(jsonRes(null, err.message)) ;
    }
}

async function viewPdf(req, res){
    try{
        const filename = req.query.filename ;
        const path = 'pdf/' + filename ;

        if (!fs.existsSync(path)){
            throw new Error("File doesnot exist.") ;
        }

        const stat = fs.statSync(path) ;
        const file = fs.createReadStream(path) ;

        res.setHeader('Content-Length', stat.size) ;
        res.setHeader('Content-Type', 'application/pdf');
        file.pipe(res) ;
    }
    catch(err){
        res.sendStatus(500).json(jsonRes(null, err.message)) ;
    }
}

async function getPdf(req, res){
    try{
        const filename = req.query.filename ;
        const path = 'pdf/' + filename ;

        if (!fs.existsSync(path)){
            throw new Error("File doesnot exist.") ;
        }

        const stat = fs.statSync(path) ;
        const file = fs.createReadStream(path) ;

        res.setHeader('Content-Length', stat.size) ;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
        file.pipe(res) ;
    }
    catch(err){
        res.sendStatus(500) ;
    }
}

module.exports = {
    getStudents,
    getPdf,
    viewPdf
} ;