const request = require('supertest');
const app = require('../app');

describe('Login View', () => {
    it('deve renderizar o formulário de login', async () => {
        const res = await request(app).get('/login');
        if (!res.text.includes('Entrar')) {
            throw new Error('Formulário de login não encontrado');
        }
    });

    it('deve rejeitar login com campos vazios', async () => {
        const res = await request(app)
            .post('/login')
            .type('form')
            .send({ email: '', senha: '' });
        if (!res.headers.location.includes('/login')) {
            throw new Error('Deveria redirecionar para login');
        }
    });

    it('deve rejeitar login com usuário inexistente', async () => {
        const res = await request(app)
            .post('/login')
            .type('form')
            .send({ email: 'naoexiste@teste.com', senha: 'senhaerrada' });
        if (!res.headers.location.includes('/login')) {
            throw new Error('Deveria redirecionar para login');
        }
    });
});