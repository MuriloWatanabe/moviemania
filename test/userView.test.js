const request = require('supertest');
const app = require('../app');

describe('User View', () => {
    it('deve redirecionar para login se não autenticado', async () => {
        const res = await request(app).get('/user');
        if (res.status !== 302 || !res.headers.location.includes('/login')) {
            throw new Error('Usuário não autenticado não foi redirecionado');
        }
    });
});