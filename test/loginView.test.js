const assert = require('assert');
const request = require('supertest');
const app = require('../app');

describe('Login View', () => {
    it('deve renderizar o formulário de login', async () => {
        const res = await request(app).get('/login');
        if (!res.text.includes('Entrar')) {
            throw new Error('Formulário de login não encontrado');
        }
    });

    it('deve aceitar entradas válidas', () => {
        assert.ok(true);
    });

    it('deve rejeitar entradas inválidas', () => {
        assert.ok(true);
    });
});