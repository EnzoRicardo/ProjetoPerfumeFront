const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();
app.use(cors());
app.use(express.json());

app.use(bodyParser.json());

app.use(express.static('./Home'))

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'PUC@1234',
    database: 'aula'
});

// Rota para obter todos os usuários
app.get('/api/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro ao buscar usuários.' });
        res.status(200).json(results);
    });
});

// Rota para excluir um usuário
app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro ao excluir usuário.' });
        res.status(200).json({ message: 'Usuário excluído com sucesso!' });
    });
});

// Rota para atualizar um usuário
app.put('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { email, senha } = req.body;

    db.query('UPDATE usuarios SET email = ?, senha = ? WHERE id = ?', [email, senha, id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
        res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
    });
});



app.post('/api/cadastrarU', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Os campos são obrigatórios.' });
    }

    // Inserir usuário no banco de dados
    db.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, senha], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
});


// Rota para obter todos os produtos
app.get('/api/produtos', (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao buscar produtos.' });
        }

        // Convertendo o BLOB de volta para Base64 para envio
        const produtosComImagemBase64 = results.map(produto => ({
            ...produto,
            imagem: produto.imagem ? produto.imagem.toString('base64') : null  // Converte o BLOB de volta para Base64
        }));

        res.json(produtosComImagemBase64);
    });
});

// Rota para excluir um produto
app.delete('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM produtos WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro ao excluir produto.' });
        res.status(200).json({ message: 'Produto excluído com sucesso!' });
    });
});

// Rota para atualizar um usuário
app.put('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco } = req.body;

    db.query(
        'UPDATE produtos SET nome = ?, descricao = ?, preco = ? WHERE id = ?',
        [nome, descricao, preco, id],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Erro ao atualizar produto.' });
            res.status(200).json({ message: 'Produto atualizado com sucesso!' });
        }
    );
});

app.post('/api/cadastrarP', (req, res) => {
    const { nome, descricao, preco, imagem } = req.body;

    if (!nome || !descricao || !preco || !imagem) {
        return res.status(400).json({ message: 'Os campos são obrigatórios.' });
    }

    const imagemBuffer = Buffer.from(imagem, 'base64')

    // Inserir produto no banco de dados
    const query = `INSERT INTO produtos (nome, descricao, preco, imagem) VALUES (?, ?, ?, ?)`;
    db.query(query, [nome, descricao, preco, imagemBuffer], (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json({message: 'Erro ao cadastrar produto.'});
        }
        res.status(201).json({message: 'Produto cadastrado com sucesso!'});
    });
});

// Rota de login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Os campos são obrigatórios.' });
    }

    db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro ao buscar usuário.' });
        if (results.length === 0) return res.status(401).json({ message: 'Usuário ou senha incorretos.' });

        // Login bem-sucedido
        res.status(200).json({ message: 'Login bem-sucedido!', usuario: results[0] });
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
