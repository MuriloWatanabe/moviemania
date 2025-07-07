const request = require('supertest');
const app = require('../app');

describe('Busca de filmes autenticada', function () {
    let agent;
    beforeEach(() => {
        agent = request.agent(app);
    });

    it('deve buscar filmes quando autenticado', async function () {
        await agent
            .post('/login')
            .type('form')
            .send({ email: 'teste@email.com', senha: '12345' })
            .expect(302);

        const res = await agent
            .get('/api/search-movies?q=Vingadores')
            .expect(200);

        if (!Array.isArray(res.body)) {
            throw new Error('Resposta não é array');
        }
    });
});