const express = require('express');
const userController = require('../controller/userController');
const { authenticate, authorizeAdmin} = require('../middleware/auth');

const router = express.Router();


router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.get('/profile', authenticate, userController.getProfile);

module.exports = router;