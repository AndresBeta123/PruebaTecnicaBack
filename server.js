//importaciones
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
//puerto abierto que luego sera remapeado
const port = 3000;

const app = express();



app.use(express.json());
//importante para el uso de session tokens
app.use(session({
    store: new pgSession({
        pool: pool, // Conexión a la base de datos
        tableName: 'session' // Nombre de la tabla de sesiones (debe ser una cadena)
    }),
    secret: process.env.FOO_COOKIE_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 días
}));

// Rutas provicionales solo para verificar las bases de datos

//llama a todas las sessiones que se han creado
app.get('/sessions', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM "session"');
        res.status(200).json(data.rows);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

//llama a todos los restaurantes con los que se cuenta en la base de datos
app.get('/Restaurants', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM "restaurants"');
        res.status(200).json(data.rows);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

//llama a todos los log de busqueda de los usuarios 
app.get('/AllLogs', async (req, res) => {
    try {
        const data = await pool.query('SELECT * FROM "searches"');
        res.status(200).json(data.rows);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

//llama a todos los usuarios
app.get('/users', async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM users");
        res.status(200).json(data.rows);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Routes de la aplicacion 

//Recibe un json con el userName del usuario y con la contraseña 
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
            req.session.userId = user.id; // Almacenar el ID del usuario en la sesión
            req.session.isAuth = true;
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

//Recibe un json con un nombre (no unico) un userName(unico) y una contraseña, y genera el usuario en la base de datos
//con la contraseña sifrada
app.post('/register', async (req, res) => {
    const { name, userName, password } = req.body;
    try {
        const salt = await bcrypt.genSalt();
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

//Recibe una ciudad 
//Revisa si el usuario tiene su session de autenticacion activada
//en caso de que tenga la sesion se le muestra una lista de restaurantes en la ciudad 
app.post('/Map', async (req, res) => {
    
    try{
    
    const isAuth = req.session.isAuth;
    const city = req.body.city;
    const user_id = req.session.userId;
    const results = await pool.query('SELECT * FROM restaurants WHERE "city" = $1', [city]);
    const restaurants = results.rows
    if(isAuth){
        await pool.query("INSERT INTO searches (id_user,seen_city) VALUES ($1, $2)", [user_id, city]);
        res.status(200).jsonp({
            message:`Lista de ubicaciones cercanas a la ciudad ${city}`,
            restaurants
        });
    }else{
        res.status(200).json({
            message:'no tiene autorizacion para estar aqui'
        });
    }}catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

//cambia el valor de isAuth a falso lo cual implica que se a cerrado la sesion 
app.post('/logout', (req, res) => {
    try{
    if(req.session.isAuth){
        req.session.isAuth = false;
        res.status(200).jsonp({
            message:'se deslogueo correctamente'
        });
    }else{
        res.status(404).jsonp({
            message:'no se encuentra logueado'
        });
    }}catch(err){
        console.log(err);
        res.sendStatus(500); 
    }
    

});

//usa la id de usuario almacenada en la sesion para mostrar los logs de busquedas del usuario 
app.get('/MyLogs',async (req,res)=>{
    try {
        const id_user = req.session.userId;
        if(req.session.isAuth){
            const data = await pool.query('SELECT * FROM searches WHERE "id_user" = $1', [id_user]);
            res.status(200).json(data.rows);
        }else{
            res.status(200).json({
            message:'no tiene autorizacion para estar aqui'
            });
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.listen(port, () => console.log(`Server has started on port: ${port}`));
