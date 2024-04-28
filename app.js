//imports
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

const app = express()

//rota publica
app.get('/', (req, res) => {
    res.status(200).json({msg: 'seja bem vindo'})
})


const db = mongoose.connect
('mongodb+srv://oweslley03:BancoMongo03Weslley@cluster0.b3uma5z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

app.listen(3003)