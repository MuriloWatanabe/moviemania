const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

const authRoutes = require('./routes/auth');
const authController = require('./controllers/authController');

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

app.use((req, res, next) => {
    res.status(404).send("Desculpe, a página não foi encontrada.");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Acesse http://localhost:3000/login para fazer login');
});