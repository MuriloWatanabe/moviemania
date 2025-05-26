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

  user: async (req, res) => {
    if (!req.session.user) {
      req.flash('error', 'Você precisa estar logado para acessar seu perfil.');
      return res.redirect('/login');
    }

    const userId = req.session.user.id;
    const activeTab = req.params.tab || 'perfil';

    let connection;
    try {
      connection = await db.getConnection();

      // Inicializa todas as variáveis que serão passadas para a view
      // Isso garante que elas existam, mesmo que vazias, independentemente da aba ativa.
      let favoriteMovies = [];
      let recentActivities = [];
      let userWatchedMovies = [];
      let genres = [];
      let decades = [];
      let diaryEntries = [];

      if (activeTab === 'perfil') {
        const [favMovies] = await connection.execute(
          `SELECT f.id_filme, f.titulo, f.sinopse, f.ano_lancamento, g.nome as genero_nome
           FROM favoritos fav
           JOIN filmes f ON fav.id_filme = f.id_filme
           JOIN generos g ON f.id_genero = g.id_genero
           WHERE fav.id_usuario = ?
           LIMIT 5`,
          [userId]
        );
        favoriteMovies = favMovies;

        recentActivities = [
        ];

      } else if (activeTab === 'filmes') {
        const [watchedMovies] = await connection.execute(
          `SELECT f.id_filme, f.titulo, f.sinopse, f.ano_lancamento
             FROM listas_usuario lu
             JOIN filmes f ON lu.id_filme = f.id_filme
             WHERE lu.id_usuario = ? AND lu.tipo_lista = 'assistido'`,
          [userId]
        );
        userWatchedMovies = watchedMovies;

        const [allGenres] = await connection.execute('SELECT id_genero, nome FROM generos ORDER BY nome');
        genres = allGenres;

        const [minMaxYears] = await connection.execute('SELECT MIN(ano_lancamento) AS min_year, MAX(ano_lancamento) AS max_year FROM filmes');
        if (minMaxYears.length > 0 && minMaxYears[0].min_year && minMaxYears[0].max_year) {
          const startDecade = Math.floor(minMaxYears[0].min_year / 10) * 10;
          const endDecade = Math.floor(minMaxYears[0].max_year / 10) * 10;
          for (let d = startDecade; d <= endDecade; d += 10) {
            decades.push(`${d}s`);
          }
        }
      } else if (activeTab === 'diario') {
        const [diaryRecords] = await connection.execute(
          `SELECT d.id_registro, d.data_assistido, d.avaliacao, d.notas, f.titulo as movieTitle, f.id_filme as movieId
               FROM diario d
               JOIN filmes f ON d.id_filme = f.id_filme
               WHERE d.id_usuario = ?
               ORDER BY d.data_assistido DESC`,
          [userId]
        );
        diaryEntries = diaryRecords.map(entry => ({
          id: entry.id_registro,
          date: new Date(entry.data_assistido).toLocaleDateString('pt-BR'),
          movieTitle: entry.movieTitle,
          movieId: entry.movieId,
          rating: entry.avaliacao,
          notes: entry.notas
        }));

        const [allGenres] = await connection.execute('SELECT id_genero, nome FROM generos ORDER BY nome');
        genres = allGenres;

        const [minMaxYears] = await connection.execute('SELECT MIN(ano_lancamento) AS min_year, MAX(ano_lancamento) AS max_year FROM filmes');
        if (minMaxYears.length > 0 && minMaxYears[0].min_year && minMaxYears[0].max_year) {
          const startDecade = Math.floor(minMaxYears[0].min_year / 10) * 10;
          const endDecade = Math.floor(minMaxYears[0].max_year / 10) * 10;
          for (let d = startDecade; d <= endDecade; d += 10) {
            decades.push(`${d}s`);
          }
        }
      }


      res.render('user', {
        currentUser: req.session.user,
        activeTab: activeTab,
        favoriteMovies: favoriteMovies,
        recentActivities: recentActivities,
        userWatchedMovies: userWatchedMovies,
        genres: genres,
        decades: decades,
        diaryEntries: diaryEntries
      });

    } catch (error) {
      console.error('Erro ao carregar dados do perfil do usuário:', error);
      req.flash('error', 'Ocorreu um erro ao carregar seu perfil.');
      res.redirect('/home');
    } finally {
      if (connection) connection.release();
    }
  },

 searchMovies: async (req, res) => {
        const query = req.query.q; // Pega o que o usuário digitou

        console.log(`[Backend Debug] Recebida requisição de busca para a query: "${query}"`);

        if (!query || query.length < 3) {
            console.log('[Backend Debug] Query muito curta ou vazia, retornando array vazio.');
            return res.json([]);
        }

        let connection;
        try {
            connection = await db.getConnection();
            const searchTerm = `%${query}%`;
            console.log(`[Backend Debug] Executando SQL: "SELECT id_filme, titulo, ano_lancamento FROM filmes WHERE titulo LIKE ?" com termo: "${searchTerm}"`);
            const [movies] = await connection.execute(
                `SELECT id_filme, titulo, ano_lancamento FROM filmes WHERE titulo LIKE ? LIMIT 10`,
                [searchTerm]
            );

            console.log('[Backend Debug] Filmes encontrados no DB:', movies);
            res.json(movies);
        } catch (error) {
            console.error('[Backend Error] Erro ao pesquisar filmes no banco de dados:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao pesquisar filmes.' });
        } finally {
            if (connection) connection.release();
        }
    },

  addDiaryEntry: async (req, res) => {
    const userId = req.session.user.id;
    const { movieId, diaryDate, diaryRating, diaryNotes } = req.body;

    if (!movieId || !diaryDate) {
      return res.status(400).json({ message: 'Filme e Data são obrigatórios.' });
    }

    let connection;
    try {
      connection = await db.getConnection();
      await connection.execute(
        `INSERT INTO diario (id_usuario, id_filme, data_assistido, avaliacao, notas)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, movieId, diaryDate, diaryRating, diaryNotes]
      );
      res.status(201).json({ message: 'Registro adicionado ao diário com sucesso!' });
    } catch (error) {
      console.error('Erro ao adicionar registro ao diário:', error);
      res.status(500).json({ message: 'Erro interno do servidor ao adicionar registro.' });
    } finally {
      if (connection) connection.release();
    }
  },
};

module.exports = authController;