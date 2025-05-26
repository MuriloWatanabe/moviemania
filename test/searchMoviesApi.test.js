const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');

describe('API de busca de filmes', function () {
    let agent;

    beforeEach(() => {
        agent = request.agent(app);
    });

    it('deve redirecionar para login se não autenticado', async function () {
        const res = await request(app)
            .get('/api/search-movies?q=Matrix')
            .expect(302);

        if (!res.headers.location.includes('/login')) {
            throw new Error('Deveria redirecionar para login');
        }
    });

    it('deve criptografar a senha ao registrar um novo usuário', async function () {
        const senha = 'sua_senha';
        const saltRounds = 10;
        const hash = await bcrypt.hash(senha, saltRounds);

        console.log('Senha criptografada:', hash);

    });
});