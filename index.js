require('dotenv').config({path: __dirname + '/.env'});
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var path = require('path');
var validator = require('validator');
var bcrypt = require('bcrypt');
//const saltRounds = 10;
var {Pool} = require('pg');
var pool = new Pool();
var salt = process.env.SALT;
var dbname = process.env.DBNAME;
LAST_ID = 1

new_user_query = 'INSERT INTO accounts (login, password_hash, id) VALUES ($1, $2, $3)';
reset_id_query = 'INSERT INTO last_id VALUES (0)';
find_user_by_login_query = 'SELECT * FROM accounts WHERE login = ($1)'


class User {
    async create(login, hash, id){
        this.login = login;
        this.id = id;
        await pool.query(new_user_query, [login, hash, id]);
    }
}

USERS = [];

(async () => {
    try {
        client = await pool.connect();
        try {
            await client.query('DROP DATABASE ' + dbname);
        } catch(err) {
            console.log(err)
        }
        try {
            await client.query('CREATE DATABASE ' + dbname);
        } catch(err) {
            console.log(err);
        }
        await client.end();
        pool = new Pool({database: dbname});
        client = await pool.connect();
        await client.query('CREATE TABLE accounts (login varchar(200), password_hash varchar(200), id int)');
        await client.query('CREATE TABLE last_id (last_id int)');
        await client.query(reset_id_query);
        //await client.query();
        console.log('database is ready');
    } catch (e) {
        console.log(e);
    }
})();



//app.set('view engine', 'pug');
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/base.html');
});

io.on('connection', async socket => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('login', async data => {
        console.log(data);
        //socket.emit('new-user-online', data.login);
    });
    socket.on('reg', async data => {
        error_message = validate_reg(data);
        socket.emit('is-reg-valid', error_message);
        var answer = await reg_player(data);
        socket.emit('is-reg-completed', answer);
        socket.emit('new-user-online', data.login);
    })
});

http.listen(port, () => {
    console.log('listening on *:3000');
});


function validate_reg(data) {
    if (data.login.length == 0) {
        return 'empty-login';
    }
    if (data.login.length >= 30) {
        return 'too-long';
    }
    if (data.password.length == 0){
        return 'empty-pass';
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
        return 'login-is-not-available';
    }
    var hash = await bcrypt.hash(data.password, salt);
    new_user = new User();
    id = get_new_id();
    await new_user.create(data.login, hash, id);
    USERS[id] = User;
    return('ok');
}

function get_new_id(){
    LAST_ID += 1;
    return LAST_ID;
}

//check login availability
async function check_login(login) {
    res = await pool.query(find_user_by_login_query, [login]);
//    console.log('select responce', res);
    if (res.rows.length == 0) {
        return true
    }
    return false
}