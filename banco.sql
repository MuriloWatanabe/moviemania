CREATE DATABASE moviemania CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE moviemania;

CREATE TABLE usuarios (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(30) NOT NULL,
  email VARCHAR(60) NOT NULL UNIQUE,
  senha VARCHAR(30) NOT NULL,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  tipo_usuario ENUM('comum', 'admin') DEFAULT 'comum',
  maior_16_anos TINYINT(1) DEFAULT 0,
  aceitou_politica_privacidade TINYINT(1) DEFAULT 0
);

CREATE TABLE generos (
  id_genero INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT
);

CREATE TABLE filmes (
  id_filme INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(150) NOT NULL,
  titulo_original VARCHAR(150),
  id_genero INT,
  ano_lancamento INT,
  sinopse TEXT,
  duracao INT,
  data_lancamento DATE,
  direcao VARCHAR(255),
  produtores TEXT,
  roteiro TEXT,
  musica TEXT,
  backdrop_url VARCHAR(255),
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  cadastrado_por INT,
  FOREIGN KEY (id_genero) REFERENCES generos(id_genero),
  FOREIGN KEY (cadastrado_por) REFERENCES usuarios(id_usuario)
);

CREATE TABLE avaliacoes (
  id_avaliacao INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT,
  id_filme INT,
  nota DECIMAL(2,1) CHECK (nota >= 0 AND nota <= 10),
  comentario TEXT,
  data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_filme) REFERENCES filmes(id_filme)
);

CREATE TABLE diario (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_filme INT NOT NULL,
    data_assistido DATE NOT NULL,
    avaliacao INT,
    notas TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_filme) REFERENCES filmes(id_filme) ON DELETE CASCADE
);

CREATE TABLE curtidas (
  id_curtida INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_registro INT NOT NULL,
  data_curtida DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_usuario, id_registro),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_registro) REFERENCES diario(id_registro) ON DELETE CASCADE
);

CREATE TABLE favoritos (
  id_favorito INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT,
  id_filme INT,
  data_adicao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_filme) REFERENCES filmes(id_filme)
);

CREATE TABLE listas_usuario (
  id_lista INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT,
  id_filme INT,
  tipo_lista ENUM('assistido','a_assistir') NOT NULL,
  data_adicao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_filme) REFERENCES filmes(id_filme)
);

SET FOREIGN_KEY_CHECKS = 1;


INSERT INTO generos (nome) VALUES
('Ação'), ('Aventura'), ('Comédia'), ('Drama'), ('Ficção Científica'),
('Fantasia'), ('Terror'), ('Thriller'), ('Animação'), ('Documentário');

INSERT INTO usuarios (nome, email, senha, maior_16_anos, aceitou_politica_privacidade, tipo_usuario) VALUES
('Teste User', 'teste@email.com', '12345', 1, 1, 'comum');

INSERT INTO filmes (titulo, titulo_original, id_genero, ano_lancamento, sinopse, duracao, data_lancamento, direcao, produtores, roteiro, musica, backdrop_url, cadastrado_por) VALUES
('Vingadores: Ultimato', 'Avengers: Endgame', 1, 2019, 'Os Vingadores restantes se unem para reverter as ações de Thanos e trazer a ordem de volta ao universo. O confronto final contra o Titã Louco, Thanos.', 181, '2019-04-26', 'Anthony Russo, Joe Russo', 'Kevin Feige', 'Christopher Markus, Stephen McFeely', 'Alan Silvestri', 'https://image.tmdb.org/t/p/original/bOGkgRGdhrBYJSLpaxhBTwmABeg.jpg', 1),
('O Mestre Invencível', 'Jui kuen', 3, 1978, 'Um jovem rebelde aprende kung fu com um mestre excêntrico para derrotar um assassino lendário. Um clássico do cinema de artes marciais com Jackie Chan.', 111, '1978-10-05', 'Yuen Woo-Ping', 'Ng See-Yuen', 'Lung Hsiao', 'Fu Liang-Chou', 'https://image.tmdb.org/t/p/original/5sXQY1nC6Lh96S7iWd2V9zM7i1w.jpg', 1),
('Bater ou Correr em Londres', 'Shanghai Knights', 3, 2003, 'Chon Wang e Roy O’Bannon partem para Londres para vingar a morte do pai de Chon e recuperar um tesouro imperial. Uma aventura cheia de comédia e ação.', 94, '2003-02-07', 'David Dobkin', 'Roger Birnbaum', 'Miles Millar, Alfred Gough', 'Randy Edelman', 'https://image.tmdb.org/t/p/original/pPjRzJ3QxKxYwG0xM2s9u02iKzQ.jpg', 1),
('Interestelar', 'Interstellar', 5, 2014, 'Em um futuro distópico, a humanidade busca um novo lar no espaço para sobreviver. Uma jornada épica através de buracos de minhoca e dimensões.', 169, '2014-11-07', 'Christopher Nolan', 'Emma Thomas, Christopher Nolan', 'Jonathan Nolan, Christopher Nolan', 'Hans Zimmer', 'https://image.tmdb.org/t/p/original/xpGk93c28R8PqWlK7y500P8N5Wd.jpg', 1),
('A Origem', 'Inception', 8, 2010, 'Um ladrão que rouba segredos corporativos através de tecnologia de compartilhamento de sonhos tem a chance de ter sua vida antiga de volta, plantando uma ideia na mente de um CEO.', 148, '2010-07-16', 'Christopher Nolan', 'Emma Thomas, Christopher Nolan', 'Christopher Nolan', 'Hans Zimmer', 'https://image.tmdb.org/t/p/original/s2bC9d3fBqH9wXb733r9jR8cQ.jpg', 1),
('Parasita', 'Gisaengchung', 4, 2019, 'Uma família pobre trama um plano intrincado para se infiltrar na vida de uma família rica, com consequências inesperadas e sombrias.', 132, '2019-05-30', 'Bong Joon-ho', 'Kwak Sin-ae, Bong Joon-ho', 'Bong Joon-ho, Han Jin-won', 'Jung Jae-il', 'https://image.tmdb.org/t/p/original/5xI2T27Vd49V17xWJ2M9H8FvX.jpg', 1),
('Clube da Luta', 'Fight Club', 4, 1999, 'Um homem insone em busca de uma maneira de mudar sua vida se envolve com um produtor de sabão e forma um clube de luta underground.', 139, '1999-10-15', 'David Fincher', 'Art Linson, Ceán Chaffin', 'Jim Uhls', 'The Dust Brothers', 'https://image.tmdb.org/t/p/original/odW92r5qSsuhYkU3QGqK1J9wN40.jpg', 1);

INSERT INTO diario (id_usuario, id_filme, data_assistido, avaliacao, notas) VALUES
(1, 2, '2023-01-15', 5, 'Filme clássico do Jackie Chan, demonstrando o que será o estilo dessa lenda! Incrível!'),
(1, 3, '2023-02-20', 4, 'Um clássico filme do Jackie Chan, mais reprisado na sessão da tarde que uma noite no museu kkkk. Divertido!'),
(1, 1, '2024-01-01', 5, 'O épico final da Saga do Infinito! Emocionante do início ao fim. Me deixou sem palavras.'),
(1, 4, '2024-03-10', 5, 'Uma obra-prima da ficção científica, com atuações incríveis e uma história que faz pensar. Totalmente recomendado.'),
(1, 5, '2024-04-22', 4, 'Filme muito inteligente, prende a atenção do início ao fim. Complexo, mas vale a pena.'),
(1, 6, '2024-05-01', 5, 'Um filme genial! A crítica social é impecável. Surpreendente em cada virada.'),
(1, 7, '2024-05-15', 5, 'Um clássico atemporal que questiona a sociedade. A atmosfera é sensacional.');

INSERT INTO curtidas (id_usuario, id_registro) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7);
