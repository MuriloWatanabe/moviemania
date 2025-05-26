const request = require('supertest');
const app = require('../app'); // O seu app Express exportado de app.js

let expect; // Declare expect para ser atribuído após o import dinâmico

// Usamos um bloco before ou beforeAll para carregar Chai assincronamente
// antes que qualquer teste seja executado.
before(async () => {
    // Importa Chai dinamicamente
    const chai = await import('chai');
    expect = chai.expect; // Atribui expect do Chai globalmente para os testes
});

// Bloco de testes para a aplicação
describe('Testes da aplicação', () => {

    // Teste para a rota '/'
    it('deve redirecionar (status 302) para /login se não estiver autenticado', async () => {
        await request(app)
            .get('/')
            .expect(302) // Espera 302 porque o middleware isAuthenticated vai redirecionar
            .expect('Location', '/login'); // Opcional: verifica para onde está redirecionando
    });

    // Remova ou ajuste o teste da função indefinida se ainda estiver lá
    // Se você tiver uma função real para testar (que não dependa de requisições HTTP),
    // você a importaria aqui e a testaria.
    // Exemplo:
    // it('deve retornar o resultado esperado de uma função específica', () => {
    //     const minhaFuncao = (a, b) => a + b; // Supondo uma função simples para demonstração
    //     expect(minhaFuncao(2, 3)).to.equal(5);
    // });
});