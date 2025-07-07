const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.exibirLogin);
router.post('/login', authController.loginUsuario);

router.get('/register', authController.viewRegister);
router.post('/register', authController.userRegister);

router.get('/password', authController.viewPassword);

router.get('/home', authController.isAuthenticated, authController.viewHome);

router.get('/user', authController.isAuthenticated, authController.user);
router.get('/user/:tab', authController.isAuthenticated, authController.user);
router.post('/user/listas', authController.isAuthenticated, authController.addUserList);

module.exports = router;