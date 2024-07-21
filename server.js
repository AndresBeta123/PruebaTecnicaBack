const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db');
const port = 3000;

const app = express();
app.use(express.json());

// Routes
app.get('/users', async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM users");
        res.status(200).json(data.rows);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.post('/login', async (req, res) => {
    const { userName, password } = req.body;

    try {
        // Buscar el usuario por nombre de usuario
        const result = await pool.query('SELECT * FROM users WHERE "username" = $1', [userName]);
        const user = result.rows[0];

        if (!user) {
            // Usuario no encontrado
            return res.status(404).json({ message: 'User not found' });
        }

        if (await bcrypt.compare(password, user.password)) {
            // Contraseña correcta
            res.status(200).json({ message: 'Login successful' });
        } else {
            // Contraseña incorrecta
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.post('/register', async (req, res) => {
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


app.listen(port, () => console.log(`Server has started on port: ${port}`));
