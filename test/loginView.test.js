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

describe('User Profile', function () {
    let agent;
    beforeEach(() => {
        agent = request.agent(app);
    });

    it('deve acessar a página de perfil autenticado', async function () {
        await agent
            .post('/login')
            .type('form')
            .send({ email: 'teste@email.com', senha: '12345' })
            .expect(302);

        const res = await agent
            .get('/user')
            .expect(200);

        if (!res.text.includes('Perfil')) {
            throw new Error('Não carregou a página de perfil');
        }
    });
});