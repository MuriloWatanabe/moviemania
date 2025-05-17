const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para exibir o login
router.get('/login', authController.exibirLogin);
router.post('/login', authController.loginUsuario);

// Rotas para o registro
router.get('/register', authController.viewRegister);
router.post('/register', authController.userRegister);

// Rotas para o esqueceu a senha
router.get('/password', authController.viewPassword);
router.post('/password', authController.userPassword);

// Rotas para o esqueceu a senha
router.get('/home', authController.viewHome);

module.exports = router;
