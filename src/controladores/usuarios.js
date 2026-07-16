const knex = require('../db');
const bcrypt = require('bcrypt');

const cadastrarUsuario = async (req, res) => {

    const { nome, email, senha, nome_loja } = req.body;

    if (!nome) {
        return res.status(404).json("O campo nome é obrigatório");
    }

    if (!email) {
        return res.status(404).json("O campo email é obrigatório");
    }

    if (!senha) {
        return res.status(404).json("O campo senha é obrigatório");
    }

    if (!nome_loja) {
        return res.status(404).json("O campo nome_loja é obrigatório");
    }

    try {
        const quantidadeUsuarios = await knex('usuarios').where({ email }).first();

        if (quantidadeUsuarios) {
            return res.status(400).json("O email já existe");
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuario = await knex('usuarios').insert({
            nome,
            email,
            senha: senhaCriptografada,
            nome_loja
        }).returning('*');

        if (!usuario || usuario.length === 0) {
            return res.status(400).json("O usuário não foi cadastrado.");
        }

        const { senha: _, ...dadosDoUsuario } = usuario[0];

        return res.status(201).json(dadosDoUsuario);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterPerfil = async (req, res) => {
    return res.status(200).json(req.usuario);
}

module.exports = {
    cadastrarUsuario,
    obterPerfil
}