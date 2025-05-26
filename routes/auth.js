const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.exibirLogin);
router.post('/login', authController.loginUsuario);

router.get('/register', authController.viewRegister);
router.post('/register', authController.userRegister);

router.get('/password', authController.viewPassword);

router.get('/home', authController.viewHome);

router.get('/user', authController.user);

module.exports = router;