const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para exibir o login
router.get('/login', authController.exibirLogin);
router.post('/login', authController.loginUsuario);

// Rotas para o registro
router.get('/register', authController.viewRegister);
router.post('/register', authController.userRegister);

module.exports = router;
