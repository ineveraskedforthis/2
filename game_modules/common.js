const constants = require("./constants.js")
var validator = require('validator');

module.exports = 
{
    sum: function (a) {
        return a.reduce((x, y) => x + y, 0);
    },

    get_next_nevel_req: function (l) {
        return l * l * 5 + 50 + 10 * l
    },

    send_query: async function (pool, query, args) {
        if (constants.logging.db_queries) {
            console.log('!!!!!!!!!!!!!!!')
            console.log(query)
            console.log(args)
        }
        try {
            return await pool.query(query, args)
        } catch(err) {
            console.log(err);
            console.log('!!!!!!!!!!!!!!!')
            console.log(query)
            console.log(args)
        }
    },

    drop_tables: async function (client, tables) {
        for (let i = 0; i < tables.length; i++) {
            if (tables[i] != 'messages') {
                await client.query('DROP TABLE IF EXISTS ' + tables[i]);
            }
        }
    },

    get_version: async function (client) {
        await client.query('CREATE TABLE IF NOT EXISTS version (version int)');
        let res = await client.query('SELECT * FROM version');
        if (res.rows.length == 0) {
            await client.query('INSERT INTO version (version) VALUES ($1)', [0]);
            return {version: 0};
        }
        return res.rows[0];
    },

    set_version: async function (client, version) {
        await client.query('DROP TABLE IF EXISTS version');
        await client.query('CREATE TABLE IF NOT EXISTS version (version int)');
        await client.query('INSERT INTO version (version) VALUES ($1)', [version]);
    },
        
    init_ids: async function (client) {
        var id_types = ['battle_id', 'user_id', 'char_id', 'market_order_id', 'market_id', 'cell_id', 'agent_id', 'messages'];
        for (var i = 0; i < id_types.length; i++) {
            await client.query(constants.init_id_query, [id_types[i], 0]);
        }
        return null;
    },
    
    validate_creds: function (data) {
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
    },

    validate_buy_data: function (world, data) {
        return (world.constants.TAGS.indexOf(data.tag) > -1) && (!isNaN(data.amount)) & (!isNaN(data.amount)) && (!isNaN(data.amount) || data.max_price == null);
    },

    validate_sell_data: function (world, data) {
        return (world.constants.TAGS.indexOf(data.tag) > -1) && (!isNaN(data.amount)) && (!isNaN(data.price));
    }, 

    flag_log: function(msg, flag) {
        if (flag) {
            console.log(msg)
        }
    }
    
}