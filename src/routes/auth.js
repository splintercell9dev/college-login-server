const express = require('express') ;
const router = express.Router() ;

const { login, signup, refresh, logout } = require('../controllers/auth') ;

router.post('/signup', signup) ;
router.post('/login', login) ;
router.post('/refresh', refresh) ;
router.delete('/logout', logout) ;

module.exports = router ;