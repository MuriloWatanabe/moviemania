// controllers/authController.js
const db = require('../models/db');

// Exibe o formulário de login
exports.exibirLogin = (req, res) => {
  res.render('login');
};

// Realiza o login do usuário
exports.loginUsuario = async (req, res) => {
  const { email, senha } = req.body;
  const [usuario] = await db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);

  if (usuario.length > 0) {
    res.send(`Bem-vindo(a), ${usuario[0].nome}!`);
  } else {
    res.send('Email ou senha incorretos!');
  }
};

// Exibe o formulário de registro
exports.viewRegister = (req, res) => {
  res.render('register');
};

// Registra um novo usuário
exports.userRegister = async (req, res) => {
  const { email, senha } = req.body;

  try {
    await db.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, senha]);
    res.send("Usuário registrado com sucesso");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao registrar usuário");
  }
};
