//imports
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

const app = express()
app.use(express.json())

//models
const User = require('./models/User.js')

//rota publica
app.get('/', (req, res) => {
    res.status(200).json({msg: 'seja bem vindo'})
})

//rota privada
app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id

    //chek user existe
    const user = await User.findById(id, '-password')

    if(!user) {
       return res.status(404).json({msg: 'usuario não encontrado'})
    }

    res.status(200).json({user})
})

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token) {
        return res.status(402).json({msg: 'acesso negado'})
    }

    try {
        const secret = process.env.SECRET
        jsonwebtoken.verify(token, secret)
        next()
    } catch (err){
        res.status(400).json({msg: 'token invalido'})
        console.log(err)
    }
}

//user register
app.post('/auth/register', async (req, res) => {
    const {name, email, password, confirmPassword} = req.body

    //validação
    if (!name) {
        return res.status(422).json({msg: 'nome é obrigatório'})
    }

    if (!email) {
        return res.status(422).json({msg: 'email é obrigatório'})
    }

    if (!password) {
        return res.status(422).json({msg: 'password é obrigatório'})
    }
    if (password != confirmPassword) {
        return res.status(422).json({msg: 'os dados de PASSWORD precisam ser iguais'})
    }

    //confere se os usuarios existem
    const userExiste = await User.findOne({email: email})

    if(userExiste) {
        return res.status(422).json({msg: 'esse usuario já existe'})
    } 

    //create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //create user
    const user = new User({
        name,
        email,
        password: passwordHash
    })

    try {
        await user.save()
        res.status(201).json({msg: 'usuario cadastrado com sucesso'})

    } catch(error) {
        res.status(500).json({msg: 'erro no servidor'})
        console.log(error)
    }
})

//rota de login
app.post('/auth/login', async (req, res) => {
    const {email, password} = req.body

    //validação
    if(!email){
        return res.status(422).json({msg: 'email é obrigatorio para LOGIN'})
    }
    if(!password) {
        return res.status(422).json({msg: 'senha é obrigatorio para LOGIN'})
    }

    //checar se o usuario existe
    const user = await User.findOne({email: email})
    if(!user) {
        return res.status(404).json({msg: 'usuario não encontrado'})
    }

    //checar se a senha está correta
    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword) {
        return res.status(422).json({msg: 'senha incorreta'})
    }

    try {
        const secret = process.env.SECRET
        const token = jsonwebtoken.sign(
            {
                id: user._id,
            },
            secret,
        )
        res.status(200).json({msg: 'autentificação OK', token})
        
    } catch(err){
        res.status(500).json({msg: 'erro no servidor'})
        console.log(err)
    }
})

const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

const db = mongoose.connect
(`mongodb+srv://${dbUser}:${dbPass}@cluster0.b3uma5z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        app.listen(3003)
        console.log('servidor runing http://localhost:3003')
    }).catch((err) => console.log(err))
             