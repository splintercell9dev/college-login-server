const express = require('express') ;
const { getStudents, getPdf } = require('../controllers/staff');
const { jsonRes } = require('../utils/functions');
const router = express.Router() ;

router.use((req, res, next) => {
    const user = req.user ;
    if (user.role !== 'STAFF'){
        return res.status(401).json(jsonRes(null, 'Permission denied. This route requires specific role.'))
    }

    next() ;
}) ;
router.get('/students', getStudents) ;
router.get('/getPdf', getPdf) ;

module.exports = router ;