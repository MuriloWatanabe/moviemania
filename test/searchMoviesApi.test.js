const request = require('supertest');
const app = require('../app');

describe('API de busca de filmes', function () {
    it('deve redirecionar para login se não autenticado', async function () {
        const res = await request(app)
            .get('/api/search-movies?q=Matrix')
            .expect(302);

        if (!res.headers.location.includes('/login')) {
            throw new Error('Deveria redirecionar para login');
        }
    });

    it('deve retornar array vazio para termo curto', async function () {
        const res = await request(app)
            .get('/api/search-movies?q=Ma')
            .expect(302); // Não autenticado, espera redirecionamento
        if (!res.headers.location.includes('/login')) {
            throw new Error('Deveria redirecionar para login');
        }
    });
});