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
