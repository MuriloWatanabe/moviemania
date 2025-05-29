const db = require('../db');

const authController = {
  exibirLogin: (req, res) => {
    res.render('login', { error: req.flash('error') });
  },

  loginUsuario: async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      req.flash('error', 'Por favor, preença todos os campos.');
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

  viewHome: async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();

        const [newMovies] = await connection.execute(
            `SELECT id_filme, titulo, ano_lancamento FROM filmes ORDER BY data_lancamento DESC LIMIT 5`
        );

        const [popularMovies] = await connection.execute(
            `SELECT f.id_filme, f.titulo, f.ano_lancamento, AVG(d.avaliacao) as avg_rating
             FROM filmes f
             JOIN diario d ON f.id_filme = d.id_filme
             WHERE d.avaliacao IS NOT NULL
             GROUP BY f.id_filme
             ORDER BY avg_rating DESC
             LIMIT 5`
        );

        const [homeReviewRows] = await connection.execute(
          `SELECT
              d.avaliacao AS rating,
              d.notas AS text,
              d.data_assistido AS date,
              u.id_usuario AS userId,
              u.nome AS userName,
              f.id_filme AS movieId,
              f.titulo AS movieTitle,
              f.ano_lancamento AS movieYear,
              (SELECT COUNT(c.id_curtida) FROM curtidas c WHERE c.id_registro = d.id_registro) AS likes
           FROM diario d
           JOIN usuarios u ON d.id_usuario = u.id_usuario
           JOIN filmes f ON d.id_filme = f.id_filme
           WHERE d.notas IS NOT NULL AND d.avaliacao IS NOT NULL
           ORDER BY likes DESC, d.data_assistido DESC
           LIMIT 2`
        );

        const homeReviews = homeReviewRows.map(review => ({
          ...review,
          date: new Date(review.date).toLocaleDateString('pt-BR'),
        }));

        res.render('home', {
            title: 'MovieMania - Início',
            user: req.session.user,
            newMovies: newMovies,
            popularMovies: popularMovies,
            homeReviews: homeReviews
        });
    } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
        res.render('home', {
            title: 'MovieMania - Início',
            user: req.session.user,
            newMovies: [],
            popularMovies: [],
            homeReviews: [],
            error: 'Não foi possível carregar os filmes.'
        });
    } finally {
        if (connection) connection.release();
    }
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

      let favoriteMovies = [];
      let recentActivities = [];
      let userWatchedMovies = [];
      let genres = [];
      let decades = [];
      let diaryEntries = [];
      let reviews = [];
      let reviewDates = [];

      const [minMaxYears] = await connection.execute('SELECT MIN(ano_lancamento) AS min_year, MAX(ano_lancamento) AS max_year FROM filmes');
      if (minMaxYears.length > 0 && minMaxYears[0].min_year && minMaxYears[0].max_year) {
        const startDecade = Math.floor(minMaxYears[0].min_year / 10) * 10;
        const endDecade = Math.floor(minMaxYears[0].max_year / 10) * 10;
        for (let d = startDecade; d <= endDecade; d += 10) {
          decades.push(`${d}s`);
        }
      }

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

        recentActivities = [];

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

      } else if (activeTab === 'diario' || activeTab === 'reviews') {
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

        reviews = diaryRecords
          .filter(entry => entry.notas && entry.notas.trim().length > 0)
          .map(entry => ({
            id: entry.id_registro,
            date: new Date(entry.data_assistido).toLocaleDateString('pt-BR'),
            movieTitle: entry.movieTitle,
            movieId: entry.movieId,
            rating: entry.avaliacao,
            text: entry.notas
          }));

        reviewDates = [...new Set(reviews.map(review => review.date))].sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')));


        const [allGenres] = await connection.execute('SELECT id_genero, nome FROM generos ORDER BY nome');
        genres = allGenres;
      }

      res.render('user', {
        currentUser: req.session.user,
        activeTab: activeTab,
        favoriteMovies: favoriteMovies,
        recentActivities: recentActivities,
        userWatchedMovies: userWatchedMovies,
        genres: genres,
        decades: decades,
        diaryEntries: diaryEntries,
        reviews: reviews,
        reviewDates: reviewDates
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
        const query = req.query.q;

        if (!query || query.length < 3) {
            return res.json([]);
        }

        let connection;
        try {
            connection = await db.getConnection();
            const searchTerm = `%${query}%`;
            const [movies] = await connection.execute(
                `SELECT id_filme, titulo, ano_lancamento FROM filmes WHERE titulo LIKE ? LIMIT 10`,
                [searchTerm]
            );

            res.json(movies);
        } catch (error) {
            console.error('Erro ao pesquisar filmes no banco de dados:', error);
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

  viewMovieDetail: async (req, res) => {
    if (!req.session.user) {
      req.flash('error', 'Você precisa estar logado para ver os detalhes do filme.');
      return res.redirect('/login');
    }

    const movieId = req.params.id;
    let connection;

    try {
      connection = await db.getConnection();

      const [movieRows] = await connection.execute(
        `SELECT
            f.id_filme,
            f.titulo,
            f.titulo_original,
            f.sinopse,
            f.ano_lancamento,
            f.duracao,
            f.data_lancamento,
            f.direcao,
            f.produtores,
            f.roteiro,
            f.musica,
            g.nome AS genero_nome,
            f.backdrop_url,
            (SELECT AVG(avaliacao) FROM diario WHERE id_filme = f.id_filme AND avaliacao IS NOT NULL) AS averageRating,
            (SELECT COUNT(avaliacao) FROM diario WHERE id_filme = f.id_filme AND avaliacao IS NOT NULL) AS totalRatings
         FROM filmes f
         LEFT JOIN generos g ON f.id_genero = g.id_genero
         WHERE f.id_filme = ?`,
        [movieId]
      );

      if (movieRows.length === 0) {
        req.flash('error', 'Filme não encontrado.');
        return res.redirect('/');
      }
      const movie = movieRows[0];

      // Garante que averageRating e totalRatings são números, ou 0 se forem NULL
      movie.averageRating = movie.averageRating !== null ? parseFloat(movie.averageRating) : 0;
      movie.totalRatings = movie.totalRatings !== null ? parseInt(movie.totalRatings, 10) : 0;


      movie.cast = ['Jackie Chan', 'Yuen Siu-tien', 'Hwang Jang-lee', 'Dean Shek', 'Lam Kau'];

      const [reviewRows] = await connection.execute(
        `SELECT
            d.avaliacao AS rating,
            d.notas AS text,
            d.data_assistido AS date,
            u.id_usuario AS userId,
            u.nome AS userName,
            (SELECT COUNT(c.id_curtida) FROM curtidas c WHERE c.id_registro = d.id_registro) AS likes
         FROM diario d
         JOIN usuarios u ON d.id_usuario = u.id_usuario
         WHERE d.id_filme = ? AND d.notas IS NOT NULL AND d.avaliacao IS NOT NULL
         ORDER BY likes DESC, d.data_assistido DESC
         LIMIT 3`,
        [movieId]
      );

      const popularReviews = reviewRows.map(review => ({
        ...review,
        date: new Date(review.date).toLocaleDateString('pt-BR'),
      }));

      let relatedMovies = [];
      if (movie.id_genero !== null && movie.id_genero !== undefined) {
          const [relatedMoviesRows] = await connection.execute(
            `SELECT id_filme, titulo FROM filmes
             WHERE id_genero = ? AND id_filme != ?
             ORDER BY RAND() LIMIT 5`,
            [movie.id_genero, movieId]
          );
          relatedMovies = relatedMoviesRows;
      }

      res.render('filme', {
        currentUser: req.session.user,
        movie: movie,
        popularReviews: popularReviews,
        relatedMovies: relatedMovies
      });

    } catch (error) {
      console.error('Erro ao carregar detalhes do filme:', error);
      req.flash('error', 'Ocorreu um erro ao carregar os detalhes do filme.');
      res.redirect('/');
    } finally {
      if (connection) connection.release();
    }
  },
};

module.exports = authController;