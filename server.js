const express = require('express')
const pool = require('./db')
const port = 3000

const app = express()
app.use(express.json())

//routes
app.get('/',async (req,res) => {
    try{
        const data = await pool.query("SELECT * FROM users")
        res.status(200).send(data.rows) 
    }catch(err){
        console.log(err)
        res.sendStatus(500)
    }
})

app.post('/',async (req,res)=>{
    const {name,userName,password} = req.body
    try{
        await pool.query("INSERT INTO users (name,userName,password) VALUES($1,$2,$3)",[name,userName,password])
        res.status(200).send({
            message:`YOUR KEYS WERE ${name}-${userName}-${password}`
        })
    }catch(err){
        console.log(err)
        res.sendStatus(500)
    }
    
})

app.get('/setup',async(req,res)=>{
    try{
        await pool.query('CREATE TABLE users( id SERIAL PRIMARY KEY, name VARCHAR(100), userName Varchar(100),password Varchar(250))')
        res.status(200).send({
            message:"se creo la tabla"
        })
    }catch(err){
        console.log(err)
        res.sendStatus(500)
    }
})
app.listen(port ,() => console.log(`Server has started on port: ${port}`))