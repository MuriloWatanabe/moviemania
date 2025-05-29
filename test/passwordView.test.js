const request = require('supertest');
const app = require('../app');

describe('Password View', () => {
    it('deve renderizar o formulário de recuperação de senha', async () => {
        const res = await request(app).get('/password');
        if (!res.text.includes('Atualizar senha')) {
            throw new Error('Formulário de senha não encontrado');
        }
    });
});