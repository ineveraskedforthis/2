const constants = {
    version: 0,
    logging: {
        agent: {
            buy: false
        },
        market_order: {
            load_to_db: false,
            init: false
        },
        market: {
            buy: false,
            sell: false
        },
        sockets: {
            update_market_info: false,
            messages: true
        },
        user: {
            load_from_json: false
        },
        db_queries: false,
        generic: false,
        basic_pop_ai: false
    },
    MAX_TACTIC_SLOTS: 6,
    new_user_query: 'INSERT INTO accounts (login, password_hash, id, char_id) VALUES ($1, $2, $3, $4)',
    new_char_query: 'INSERT INTO chars (id, user_id, cell_id, name, hp, max_hp, savings, stash, equip, data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
    init_id_query: 'INSERT INTO last_id (id_type, last_id) VALUES ($1, $2)',
    new_battle_query: 'INSERT INTO battles (id, ids, teams, positions) VALUES ($1, $2, $3, $4)',
    new_cell_query: 'INSERT INTO cells (id, x, y, name, market_id, owner_id, pop_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    new_market_query: 'INSERT INTO markets (id, data) VALUES ($1, $2)',
    new_market_order_query: 'INSERT INTO market_orders (id, typ, tag, owner_id, amount, price, market_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    insert_agent_query: 'INSERT INTO agents (id, cell_id, name, savings, stash) VALUES ($1, $2, $3, $4, $5)',
    insert_consumer_query: 'INSERT INTO consumers (id, cell_id, name, savings, stash, data) VALUES ($1, $2, $3, $4, $5, $6)',
    insert_pop_query: 'INSERT INTO pops (id, cell_id, name, savings, stash, data, race_tag, ai_tag) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    insert_enterprise_query: 'INSERT INTO enterprises (id, cell_id, name, savings, stash, data, ai_tag) VALUES ($1, $2, $3, $4, $5, $6, $7)',


    update_battle_query: 'UPDATE battles SET ids = ($2), teams = ($3), positions = ($4) WHERE id = ($1)',
    update_market_order_query: 'UPDATE market_orders SET amount = ($2) WHERE id = ($1)',
    update_market_query: 'UPDATE markets SET data = ($2) WHERE id = ($1)',
    update_char_query: 'UPDATE chars SET cell_id = ($2), hp = ($3), max_hp = ($4), savings = ($5), stash = ($6), equip = ($7), data = ($8) WHERE id = ($1)',
    update_agent_query: 'UPDATE agents SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5) WHERE id = ($1)',
    update_consumer_query: 'UPDATE consumers SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5), data = ($6) WHERE id = ($1)',
    update_pop_query: 'UPDATE pops SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5), data = ($6), race_tag = ($7), ai_tag = ($8) WHERE id = ($1)',
    update_enterprise_query: 'UPDATE enterprises SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5), data = ($6), ai_tag = ($7) WHERE id = ($1)',

    delete_market_order_query: 'DELETE FROM market_orders WHERE id = ($1)',
    delete_battle_query: 'DELETE FROM battles WHERE id = ($1)',
    delete_char_query: 'DELETE FROM chars WHERE id = ($1)',

    find_user_by_login_query: 'SELECT * FROM accounts WHERE login = ($1)',
    select_char_by_id_query: 'SELECT * FROM chars WHERE id = ($1)',
    set_hp_query: 'UPDATE chars SET hp = ($1) WHERE id = ($2)',
    set_id_query: 'UPDATE last_id SET last_id = ($2) WHERE id_type = ($1)',
    get_id_query: 'SELECT * FROM last_id WHERE id_type = ($1)',
    save_world_size_query: 'INSERT INTO worlds (x, y) VALUES ($1, $2)'
};

module.exports = constants;