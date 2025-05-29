const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

const authRoutes = require('./routes/auth');
const authController = require('./controllers/authController'); // Importa o authController

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: '2904',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.currentUser = req.session.user;
    next();
});

app.use('/', authRoutes);
app.get('/', authController.isAuthenticated, authController.viewHome);

app.get('/api/search-movies', authController.isAuthenticated, authController.searchMovies);
app.post('/user/add-diary-entry', authController.isAuthenticated, authController.addDiaryEntry);
app.get('/user/:tab?', authController.isAuthenticated, authController.user);

app.get('/filme/:id', authController.isAuthenticated, authController.viewMovieDetail);


app.use((req, res, next) => {
    res.status(404).send("Desculpe, a página não foi encontrada.");
});

// MIDDLEWARE DE ERRO
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log('Acesse http://localhost:3000/login para fazer login');
    });
}

module.exports = app;