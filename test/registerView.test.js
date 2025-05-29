const request = require('supertest');
const app = require('../app');

describe('Register View', () => {
    it('deve renderizar o formulário de registro', async () => {
        const res = await request(app).get('/register');
        if (!res.text.includes('Cadastro de conta')) {
            throw new Error('Formulário de cadastro não encontrado');
        }
    });

    it('deve rejeitar cadastro com campos vazios', async () => {
        const res = await request(app)
            .post('/register')
            .type('form')
            .send({ nome: '', email: '', senha: '' });
        if (!res.headers.location.includes('/register')) {
            throw new Error('Cadastro inválido não foi rejeitado');
        }
    });

    it('deve rejeitar cadastro duplicado', async () => {
        const res = await request(app)
            .post('/register')
            .type('form')
            .send({ nome: 'Teste', email: 'teste@teste.com', senha: '123', maior_16_anos: 'on', aceitou_politica_privacidade: 'on' });
        if (!res.headers.location.includes('/register')) {
            throw new Error('Cadastro duplicado não foi rejeitado');
        }
    });
});