const knex = require('../db');
const { uploadImagem, excluirImagem } = require('../servicos/uploads');

const listarProdutos = async (req, res) => {
    const { usuario } = req;
    const { categoria } = req.query;

    try {
        const produtos = await knex('produtos')
            .where({ usuario_id: usuario.id })
            .where(query => {
                if (categoria) {
                    return query.where('categoria', 'ilike', `%${categoria}%`);
                }
            });

        return res.status(200).json(produtos);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado');
        }

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarProduto = async (req, res) => {
    const { usuario } = req;
    const { nome, estoque, preco, categoria, descricao } = req.body;

    if (!nome) return res.status(400).json('O campo nome é obrigatório');
    if (!estoque) return res.status(400).json('O campo estoque é obrigatório');
    if (!preco) return res.status(400).json('O campo preco é obrigatório');
    if (!descricao) return res.status(400).json('O campo descricao é obrigatório');

    try {
        let [produto] = await knex('produtos').insert({
            usuario_id: usuario.id,
            nome, estoque, preco, categoria, descricao
        }).returning('*');

        if (!produto) {
            return res.status(400).json('O produto não foi cadastrado');
        }

        if (req.file) {
            const { originalname, mimetype, buffer } = req.file;
            const imagem = await uploadImagem(
                `produtos/${produto.id}/${originalname}`,
                buffer,
                mimetype
            );

            const [produtoAtualizado] = await knex('produtos')
                .update({ imagem: imagem.path })
                .where({ id: produto.id })
                .returning('*');

            produto = produtoAtualizado;
            produto.urlImagem = imagem.url;
        }

        return res.status(201).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;
    const { nome, estoque, preco, categoria, descricao } = req.body;

    if (!nome && !estoque && !preco && !categoria && !descricao) {
        return res.status(400).json('Informe ao menos um campo para atualizaçao do produto');
    }

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        const produto = await knex('produtos')
            .where({ id })
            .update({
                nome,
                estoque,
                preco,
                categoria,
                descricao
            });

        if (!produto) {
            return res.status(400).json("O produto não foi atualizado");
        }

        return res.status(200).json('produto foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        if (produtoEncontrado.imagem) {
            await excluirImagem(produtoEncontrado.imagem);
        }

        const produtoExcluido = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).del();

        if (!produtoExcluido) {
            return res.status(400).json("O produto não foi excluido");
        }

        return res.status(200).json('Produto excluido com sucesso');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarImagemProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json('Nenhuma imagem foi enviada');
    }

    const { originalname, mimetype, buffer } = req.file;

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        if (produtoEncontrado.imagem) {
            await excluirImagem(produtoEncontrado.imagem);
        }

        const upload = await uploadImagem(
            `produtos/${produtoEncontrado.id}/${originalname}`,
            buffer,
            mimetype
        );

        const [produtoAtualizado] = await knex('produtos')
            .where({ id })
            .update({ imagem: upload.path })
            .returning('*');

        produtoAtualizado.urlImagem = upload.url;

        return res.status(200).json(produtoAtualizado);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirImagemProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        if (!produtoEncontrado.imagem) {
            return res.status(400).json('Produto não possui imagem cadastrada');
        }

        await excluirImagem(produtoEncontrado.imagem);

        const [produtoAtualizado] = await knex('produtos')
            .where({ id })
            .update({ imagem: null })
            .returning('*');

        return res.status(200).json(produtoAtualizado);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarProdutos,
    obterProduto,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto,
    atualizarImagemProduto,
    excluirImagemProduto
}