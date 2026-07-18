const express = require('express');
const usuarios = require('./controladores/usuarios');
const login = require('./controladores/login');
const produtos = require('./controladores/produtos');
const verificaLogin = require('./filtros/verificaLogin');
const multer = require('./filtros/multer');
const rotas = express();

rotas.post('/usuarios', usuarios.cadastrarUsuario);

rotas.post('/login', login.login);

rotas.use(verificaLogin);

rotas.get('/perfil', usuarios.obterPerfil);
rotas.put('/perfil', usuarios.atualizarPerfil);

rotas.get('/produtos', produtos.listarProdutos);
rotas.get('/produtos/:id', produtos.obterProduto);
rotas.post('/produtos', multer.single('imagem'), produtos.cadastrarProduto);
rotas.put('/produtos/:id', produtos.atualizarProduto);
rotas.put('/produtos/:id/imagem', multer.single('imagem'), produtos.atualizarImagemProduto);
rotas.delete('/produtos/:id/imagem', produtos.excluirImagemProduto);
rotas.delete('/produtos/:id', produtos.excluirProduto);

module.exports = rotas;