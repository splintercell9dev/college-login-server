const express = require('express') ;
const app = express() ;
require('dotenv').config() ;

const { users, students } = require('./src/db') ;
const ApiRouter = require('./src/routes/index') ; 
const { jsonRes } = require('./src/utils/functions');
const fs = require('fs') ;

(async () => {
    await users.sync({ force: true }) ;
    await students.sync({ force: true }) ;

    fs.readdir('pdf/', (err, files) => {
        if (err){
            console.error(err) ;
        }

        if (files.length){
            for(const file of files){
                fs.unlink("pdf/" + file, (err) => {
                    if (err) console.error(err);
                })
            }
        }
    }) ;

    console.log('all db ready and removed files from pdf folder') ;
    
    // await User.create({
    //     username: 'student01',
    //     password: 'Student@#2023',
    //     role: 'STUDENT'
    // }) ;
    // await User.create({
    //     username: 'staff01',
    //     password: 'Staff@2023',
    //     role: 'STAFF'
    // }) ;
})() ;

app.use(express.json()) ;
app.use(express.urlencoded({ extended: true })) ;
app.use((error, request, response, next) => {
    if (error instanceof SyntaxError)
        response.status(400).json(jsonRes(null, 'Syntax Error. Check correctness of payload syntax.'));
    else 
        next();
});

app.use('/api/v1', ApiRouter) ;

app.listen(3000, () => {
    console.log('listening') ;
}) ;