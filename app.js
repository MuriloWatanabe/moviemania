const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use('/', authRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000/login');
});
