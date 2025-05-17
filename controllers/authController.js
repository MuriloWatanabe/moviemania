// controllers/authController.js
const db = require('../models/db');

exports.exibirLogin = (req, res) => {
  res.render('login');
};

exports.loginUsuario = async (req, res) => {
  const { email, senha } = req.body;
  const [usuario] = await db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);

  if (usuario.length > 0) {
    res.send(`Bem-vindo(a), ${usuario[0].nome}!`);
  } else {
    res.send('Email ou senha incorretos!');
  }
};

exports.viewRegister = (req, res) => {
  res.render('register');
};

exports.viewPassword = (req, res) => {
  res.render('password');
};

// Registra um novo usuário
exports.userPassword = async (req, res) => {
  const { email, senha } = req.body;

  try {
    await db.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, senha]);
    res.send("Usuário registrado com sucesso");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao registrar usuário");
  }
};

exports.viewHome = (req, res) => {
  res.render('home');
};

// Registra um novo usuário  
exports.userHome = async (req, res) => {
  const { email, senha } = req.body;

  try {
    await db.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, senha]);
    res.send("Usuário registrado com sucesso");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao registrar usuário");
  }
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
