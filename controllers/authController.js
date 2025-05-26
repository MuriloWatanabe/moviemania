const db = require('../db');

const authController = {
    exibirLogin: (req, res) => {
        res.render('login', { error: req.flash('error') });
    },

    loginUsuario: async (req, res) => {
        const { email, senha } = req.body;

        if (!email || !senha) {
            req.flash('error', 'Por favor, preencha todos os campos.');
            return res.redirect('/login');
        }

        let connection;
        try {
            connection = await db.getConnection();
            const [rows] = await connection.execute(
                'SELECT id_usuario, nome, email, senha FROM usuarios WHERE email = ?',
                [email]
            );

            if (rows.length === 0) {
                req.flash('error', 'Email ou senha incorretos!');
                return res.redirect('/login');
            }

            const user = rows[0];

            if (user.senha !== senha) {
                req.flash('error', 'Email ou senha incorretos!');
                return res.redirect('/login');
            }

            req.session.user = {
                id: user.id_usuario,
                nome: user.nome,
                email: user.email
            };

            res.redirect('/');
        } catch (error) {
            console.error('Erro durante o login:', error);
            req.flash('error', 'Ocorreu um erro interno. Tente novamente mais tarde.');
            res.redirect('/login');
        } finally {
            if (connection) connection.release();
        }
    },

    viewRegister: (req, res) => {
        res.render('register', { error: req.flash('error'), success: req.flash('success') });
    },

    userRegister: async (req, res) => {
        const { nome, email, senha, maior_16_anos, aceitou_politica_privacidade } = req.body;

        if (!nome || !email || !senha) {
            req.flash('error', 'Por favor, preencha todos os campos obrigatórios.');
            return res.redirect('/register');
        }

        const isOver16 = maior_16_anos === 'on' ? 1 : 0;
        const acceptedPrivacy = aceitou_politica_privacidade === 'on' ? 1 : 0;

        let connection;
        try {
            connection = await db.getConnection();
            const [existingUser] = await connection.execute(
                'SELECT id_usuario FROM usuarios WHERE email = ?',
                [email]
            );

            if (existingUser.length > 0) {
                req.flash('error', 'Este email já está cadastrado.');
                return res.redirect('/register');
            }

            await connection.execute(
                'INSERT INTO usuarios (nome, email, senha, maior_16_anos, aceitou_politica_privacidade, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)',
                [nome, email, senha, isOver16, acceptedPrivacy, 'comum']
            );

            req.flash('success', 'Usuário registrado com sucesso! Faça login.');
            res.redirect('/login');
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            req.flash('error', 'Ocorreu um erro ao registrar. Tente novamente.');
            res.redirect('/register');
        } finally {
            if (connection) connection.release();
        }
    },

    isAuthenticated: (req, res, next) => {
        if (req.session.user) {
            res.locals.currentUser = req.session.user;
            next();
        } else {
            req.flash('error', 'Você precisa estar logado para acessar esta página.');
            res.redirect('/login');
        }
    },

    logout: (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error('Erro ao fazer logout:', err);
                return res.redirect('/');
            }
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    },

    viewPassword: (req, res) => {
      res.render('password');
    },

    viewHome: (req, res) => {
      res.render('home', { title: 'MovieMania - Início', user: req.session.user });
    },

    user: (req, res) => {
      res.render('user', { user: req.session.user });
    },
};

module.exports = authController;