const express = require('express') ;
const { getDetails, postDetails } = require('../controllers/student');
const router = express.Router() ;

router.use((req, res, next) => {
    const user = req.user ;
    if (user.role !== 'STUDENT'){
        return res.status(401).json(jsonRes(null, 'Permission denied. This route requires specific role.'))
    }
    next() ;
}) ;
router.get('/details', getDetails) ;
router.post('/details', postDetails) ;

module.exports = router ;