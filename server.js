'use strict'
require('dotenv').config({path: __dirname + '/.env'});

const port = process.env.PORT || 3000;

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var gameloop = require('node-gameloop');
var path = require('path');
var World = require("./game_modules/world.js");
var common = require("./game_modules/common.js");
var constants = require("./game_modules/constants.js");

var {Pool} = require('pg');
var stage = process.env.STAGE;
var dbname = process.env.DBNAME;
var pool = undefined
if (stage == 'dev') {
    pool = new Pool({database: dbname});
} else{
    pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: true});
}
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});
http.listen(port, () => {
    console.log('listening on *:3000');
});

var world = new World(io, 2, 2);

(async () => {
    try {
        var client = await pool.connect();
        let tables = ['accounts', 'chars', 'last_id', 'last_id', 'battles', 'worlds', 'markets', 'cells', 'market_orders', 'agents', 'consumers', 'pops', 'enterprises', 'messages']
        let ver = await common.get_version(client);
        console.log('version from db ');
        console.log(ver.version);
        console.log('current version of code');
        console.log(constants.version);
        if (ver.version != constants.version) {
            console.log('drop database');
            await common.drop_tables(client, tables);
            
            await client.query('CREATE TABLE accounts (login varchar(200), password_hash varchar(200), id int PRIMARY KEY, char_id int)');
            await client.query('CREATE TABLE chars (id int PRIMARY KEY, user_id int, cell_id int, name varchar(200), hp int, max_hp int, savings jsonb, stash jsonb, equip jsonb, data jsonb)');
            await client.query('CREATE TABLE last_id (id_type varchar(30), last_id int)');
            await client.query('CREATE TABLE battles (id int PRIMARY KEY, ids int[], teams int[], positions int[], savings jsonb, stash jsonb)');
            await client.query('CREATE TABLE worlds (x int, y int)');
            await client.query('CREATE TABLE markets (id int PRIMARY KEY, data jsonb)');
            await client.query('CREATE TABLE cells (id int PRIMARY KEY, x int, y int, name varchar(30), market_id int, owner_id int, pop_id int)');
            
            await client.query("CREATE TABLE market_orders (id int primary key generated always as identity, typ varchar(5), tag varchar(30), owner_id int, owner_tag varchar(5), amount int, price int, market_id int)");
            
            await client.query('CREATE TABLE agents (id int PRIMARY KEY, cell_id int, name varchar(200), savings jsonb, stash jsonb)')
            await client.query('CREATE TABLE consumers (id int PRIMARY KEY, cell_id int, name varchar(200), savings jsonb, stash jsonb, data jsonb)')
            await client.query('CREATE TABLE pops (id int PRIMARY KEY, cell_id int, name varchar(200), savings jsonb, stash jsonb, data jsonb, race_tag varchar(50), ai_tag varchar(50))')
            await client.query('CREATE TABLE enterprises (id int PRIMARY KEY, cell_id int, name varchar(200), savings jsonb, stash jsonb, data jsonb, ai_tag varchar(50))')
            await client.query('CREATE TABLE messages (id int PRIMARY KEY, message varchar(1000), sender varchar(200))')       
            await common.set_version(client, constants.version);
            
            
            await common.init_ids(client);
            await client.end();
            await world.init(pool);
        }
        else {
            await client.end();
            await world.load(pool)
        }
        console.log('database is ready');
        // eslint-disable-next-line no-unused-vars
        gameloop.setGameLoop(async delta => await world.update(pool), 1000);
    } catch (e) {
        console.log(e);
    }
})();
// setInterval(async () => await world.update(pool), 2000);
