const request = require('supertest');
const app = require('../app');

describe('Home View', () => {
    it('deve redirecionar para /login se não autenticado', async () => {
        const res = await request(app).get('/home');
        if (res.status !== 302 || !res.headers.location.includes('/login')) {
            throw new Error('Não redirecionou para login');
        }
    });
});