const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db');
const port = 3000;

const app = express();
app.use(express.json());

// Routes
app.get('/', async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM users");
        res.status(200).json(data.rows);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.post('/', async (req, res) => {
    const { name, userName, password } = req.body;
    try {
        const salt = await bcrypt.genSalt();  // Corregido de gensalt a genSalt
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword);
        await pool.query("INSERT INTO users (name, userName, password) VALUES ($1, $2, $3)", [name, userName, hashedPassword]);
        res.status(200).json({
            message: `User created with name: ${name}, userName: ${userName}`
        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.get('/setup', async (req, res) => {
    try {
        await pool.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(100), userName VARCHAR(100), password VARCHAR(250) CONSTRAINT uniqueUserName UNIQUE (userName))');
        res.status(200).json({
            message: "Table created successfully"
        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.listen(port, () => console.log(`Server has started on port: ${port}`));
