var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var path = require('path');
var validator = require('validator');
var bcrypt = require('bcrypt');
//const saltRounds = 10;
var {Client} = require('pg');
var client = new Client();
var salt = '$2b$10$X4kv7j5ZcG39WgogSl16au';

await client.connect();


app.set('view engine', 'pug');
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/base.html');
});

io.on('connection', socket => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('login', async data => {
        console.log(data);
    });
    socket.on('reg', async data => {
        error_message = validate_reg(data);
        socket.emit('is-reg-valid', error_message);
        var answer = await reg_player(data);
        socket.emit('is-reg-completed', answer);
    })
});

http.listen(port, () => {
    console.log('listening on *:3000');
});


function validate_reg(data) {
    if (data.login.length == 0) {
        return 'empty-login';
    }
    if (data.password.length == 0){
        return 'empty-pass'
    }
    if (!validator.isAlphanumeric(data.login, 'en-US')){
        return 'login-not-allowed-symbols';
    }
    return 'ok';
}

//check if login is available and create new user
async function reg_player(data) {
    var login_is_available = await check_login(data.login);
    if (!login_is_available) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('login-is-not-available');
            }, 10);
        });
    }
    var hash = await bcrypt.hash(data.password, salt);
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('ok');
        }, 10);
    });
}

//check login availability
async function check_login(login) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 10);
    });
}