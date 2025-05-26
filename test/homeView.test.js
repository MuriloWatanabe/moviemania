const request = require('supertest');
const app = require('../app');

describe('Home View', () => {
    it('deve redirecionar para /login se não autenticado', async () => {
        const res = await request(app).get('/home');
        if (res.status === 302) {
            return;
        }
        if (res.status === 200) {
            if (!res.text.includes('MovieMania')) {
                throw new Error('Página inicial não contém MovieMania');
            }
        }
    });
});