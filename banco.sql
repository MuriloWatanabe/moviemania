-- Script de criação do Banco de Dados MovieMania

-- Conectar ao MariaDB
CREATE DATABASE MovieMania CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE MovieMania;

-- Tabela usuarios
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

-- Tabela generos
CREATE TABLE generos (
  id_genero INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT
);

-- Tabela filmes
CREATE TABLE filmes (
  id_filme INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(150) NOT NULL,
  id_genero INT,
  ano_lancamento INT,
  sinopse TEXT,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  cadastrado_por INT,
  FOREIGN KEY (id_genero) REFERENCES generos(id_genero),
  FOREIGN KEY (cadastrado_por) REFERENCES usuarios(id_usuario)
);

-- Tabela avaliacoes
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

-- Tabela curtidas
CREATE TABLE curtidas (
  id_curtida INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_filme INT NOT NULL,
  data_curtida DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_usuario, id_filme),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_filme) REFERENCES filmes(id_filme)
);

-- Tabela favoritos
CREATE TABLE favoritos (
  id_favorito INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT,
  id_filme INT,
  data_adicao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_filme) REFERENCES filmes(id_filme)
);

-- Tabela listas_usuario
CREATE TABLE listas_usuario (
  id_lista INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT,
  id_filme INT,
  tipo_lista ENUM('assistido','a_assistir') NOT NULL,
  data_adicao DATETIME DEFAULT CURRENT_TIMESTAMP,
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

-- Garantir que as Chaves Estrangeiras estão Ativas
SET FOREIGN_KEY_CHECKS = 1;
