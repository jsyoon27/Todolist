//users.js
const express = require('express'); 
const router = express.Router();
const  {
    join,
    login,
    logout
} = require('../controller/user-controller'); 

router.use(express.json());

router.post('/join', join);
router.post('/login',login);
router.post('/logout', logout);

module.exports = router;