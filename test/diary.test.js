const request = require('supertest');
const app = require('../app');

describe('Diário API', function () {
    let agent;
    beforeEach(() => {
        agent = request.agent(app);
    });

    it('deve adicionar registro ao diário quando autenticado', async function () {
        await agent
            .post('/login')
            .type('form')
            .send({ email: 'teste@teste.com', senha: '123' })
            .expect(302);

        const res = await agent
            .post('/user/add-diary-entry')
            .send({
                movieId: 1,
                diaryDate: '2024-06-30',
                diaryRating: 5,
                diaryNotes: 'Teste de review automatizado'
            })
            .set('Content-Type', 'application/json');

        if (res.status !== 201) {
            throw new Error('Não adicionou registro ao diário');
        }
        if (!res.body.message) {
            throw new Error('Resposta não contém mensagem');
        }
    });

    it('deve rejeitar adicionar registro sem autenticação', async function () {
        const res = await request(app)
            .post('/user/add-diary-entry')
            .send({
                movieId: 1,
                diaryDate: '2024-06-30',
                diaryRating: 5,
                diaryNotes: 'Teste sem login'
            })
            .set('Content-Type', 'application/json');
        if (res.status !== 302 || !res.headers.location.includes('/login')) {
            throw new Error('Não redirecionou para login');
        }
    });
});