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
            .send({ nome: '', email: '', senha: '' });
        // Espera redirecionamento ou mensagem de erro
        if (res.status !== 302 && !res.text.includes('Por favor, preencha todos os campos obrigatórios.')) {
            throw new Error('Cadastro inválido não foi rejeitado');
        }
    });
});