//users.js
const express = require('express'); 
const router = express.Router();
const  {
    join,
    login,
    logout,
    updateLastViewedList
} = require('../controller/UserController'); 

router.use(express.json());

router.post('/join', join);
router.post('/login',login);
router.post('/logout', logout);
router.patch('/lastview', updateLastViewedList);

module.exports = router;