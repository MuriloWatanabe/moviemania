const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.exibirLogin);
router.post('/login', authController.loginUsuario);

module.exports = router;
