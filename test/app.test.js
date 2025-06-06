const request = require('supertest');
const app = require('../app');

describe('Testes da aplicação', () => {
    it('deve redirecionar (status 302) para /login se não estiver autenticado', async () => {
        await request(app)
            .get('/')
            .expect(302)
            .expect('Location', '/login');
    });
});