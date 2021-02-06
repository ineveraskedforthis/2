'use strict'
require('dotenv').config({path: __dirname + '/.env'});


var {Pool} = require('pg');
var pool = undefined

console.log('remote')

pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});




(async () => {
    try {
        console.log('connecting to db');
        var client = await pool.connect();
        console.log('connection ready, checking for version update');
    } catch (e) {
        console.log(e);
    }
})();