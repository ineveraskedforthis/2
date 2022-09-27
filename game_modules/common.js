const {constants} = require("./static_data/constants.js")


module.exports = 
{
    sum: function (a) {
        return a.reduce((x, y) => x + y, 0);
    },

    get_next_nevel_req: function (l) {
        return l * l * 5 + 50 + 10 * l
    },

    send_query:  function (pool, query, args) {
        if (global.flag_nodb) {
            return
        }
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

    drop_tables:  function (client, tables) {
        for (let i = 0; i < tables.length; i++) {
            if (tables[i] != 'messages') {
                await client.query('DROP TABLE IF EXISTS ' + tables[i]);
            }
        }
    },

    get_version:  function (client) {
        await client.query('CREATE TABLE IF NOT EXISTS version (version int)');
        let res = await client.query('SELECT * FROM version');
        if (res.rows.length == 0) {
            await client.query('INSERT INTO version (version) VALUES ($1)', [0]);
            return {version: 0};
        }
        return res.rows[0];
    },

    set_version:  function (client, version) {
        await client.query('DROP TABLE IF EXISTS version');
        await client.query('CREATE TABLE IF NOT EXISTS version (version int)');
        await client.query('INSERT INTO version (version) VALUES ($1)', [version]);
    },
        
    init_ids:  function (client) {
        var id_types = ['battle_id', 'user_id', 'char_id', 'market_order_id', 'market_id', 'cell_id', 'agent_id', 'messages'];
        for (var i = 0; i < id_types.length; i++) {
            await client.query(constants.init_id_query, [id_types[i], 0]);
        }
        return null;
    },
    


    flag_log: function(msg, flag) {
        if (flag) {
            console.log(msg)
        }
    }
    
}