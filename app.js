require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const connectDB = require('./db');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

const PORT = process.env.PORT

//@ Mongodb connection
require('./db');
connectDB();

const authSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: [true]
    },
    password: {
        type: String,
        // required: [true]
    }
})

//mongoose-encryption
const secret = process.env.SECRET
authSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
const Auth = mongoose.model('User', authSchema);

const Users = [];

//@Get Routes
app.get('/', (req, res) => {
    res.render('Home')
})
app.get('/Login', (req, res) => {
    res.render('Login')
})
app.get('/Register', (req, res) => {
    res.render('Register')
})

//@ Post Routs
app.post('/Register', (req, res) => {
    const userName = req.body.username;
    const passWord = req.body.password;
    const newUser = new Auth({
        username: userName,
        password: passWord
    })
    newUser.save((err) => {
        if (!err) {
            res.render('Secrets');
        } else {
            res.render(err)
        }
    });
    Users.push(newUser);
});


app.post('/Login', (req, res) => {
    const userName = req.body.username;
    const passWord = req.body.password;
    Auth.findOne({ username: userName }, (err, foundUser) => {
        if (err) {
            console.log(err);

        } else {
            if (foundUser) {
                if (foundUser.password === passWord) {
                    res.render('secrets')
                }
                else if (foundUser.password !== passWord) {
                    res.send('does not exists')
                }
            }
        }
    })
})







app.listen(PORT, () => {
    console.log(`server is listenig at port ${PORT}`);
})
