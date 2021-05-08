const constants = {
    version: 242,
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
            messages: false
        },
        user: {
            load_from_json: false
        },
        character: {
            sell: false
        },
        db_queries: false,
        generic: false,
        basic_pop_ai: false
    },
    MAX_TACTIC_SLOTS: 6,
    new_user_query: 'INSERT INTO accounts (login, password_hash, id, char_id) VALUES ($1, $2, $3, $4)',
    new_char_query: 'INSERT INTO chars (user_id, cell_id, faction_id, name, status, skills, stats, misc, flags, savings, stash, equip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
    init_id_query: 'INSERT INTO last_id (id_type, last_id) VALUES ($1, $2)',
    new_battle_query: 'INSERT INTO battles (units, savings, stash, data) VALUES ($1, $2, $3, $4) RETURNING id',
    new_cell_query: 'INSERT INTO cells (id, x, y, name, market_id, item_market_id, development, resources) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    new_market_query: 'INSERT INTO markets (id, data) VALUES ($1, $2)',
    insert_market_order_query: 'INSERT INTO market_orders (typ, tag, owner_id, owner_tag, amount, price, market_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    insert_agent_query: 'INSERT INTO agents (cell_id, name, savings, stash) VALUES ($1, $2, $3, $4) RETURNING id',
    insert_consumer_query: 'INSERT INTO consumers (cell_id, name, savings, stash, data) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    insert_pop_query: 'INSERT INTO pops (cell_id, name, savings, stash, data, race_tag, ai_tag) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    insert_enterprise_query: 'INSERT INTO enterprises (id, cell_id, name, savings, stash, data, ai_tag) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    insert_item_order_query: 'INSERT INTO items_orders (item, owner_id, buyout_price, current_price, latest_bidder, end_time, market_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    insert_market_items_query: 'INSERT INTO items_markets (orders) VALUES ($1) RETURNING id',
    insert_area_query: 'INSERT INTO areas (tag, savings, stash, faction_influence, local_resources) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    insert_faction_query: 'INSERT INTO factions (tag, savings, leader_id) VALUES ($1, $2, $3) RETURNING id',
    insert_quest_quert: 'INSERT INTO quests (money, stash, required_item_tag, reward_money, reward_reputation) RETURNING id',


    update_battle_query: 'UPDATE battles SET units = ($2), savings = ($3), stash = ($4), data = ($5) WHERE id = ($1)',
    update_market_order_query: 'UPDATE market_orders SET amount = ($2) WHERE id = ($1)',
    update_market_query: 'UPDATE markets SET data = ($2) WHERE id = ($1)',
    update_char_query: 'UPDATE chars SET cell_id = ($2), faction_id = ($3), status = ($4), skills = ($5), stats = ($6), misc = ($7), flags = ($8), savings = ($9), stash = ($10), equip = ($11) WHERE id = ($1)',
    update_agent_query: 'UPDATE agents SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5) WHERE id = ($1)',
    update_consumer_query: 'UPDATE consumers SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5), data = ($6) WHERE id = ($1)',
    update_pop_query: 'UPDATE pops SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5), data = ($6), race_tag = ($7), ai_tag = ($8) WHERE id = ($1)',
    update_enterprise_query: 'UPDATE enterprises SET cell_id = ($2), name = ($3), savings = ($4), stash = ($5), data = ($6), ai_tag = ($7) WHERE id = ($1)',
    update_user_query: 'UPDATE accounts SET char_id = ($2) WHERE id = ($1)',
    update_market_items_query: 'UPDATE items_markets SET orders = ($2) WHERE id = ($1)',
    update_item_order_query: 'UPDATE items_orders SET current_price = ($2), latest_bidder = ($3) WHERE id = ($1)',
    update_area_query: 'UPDATE areas SET savings = ($2), stash = ($3), faction_influence = ($4), local_resources = ($5) WHERE id = ($1)',
    update_faction_query: 'UPDATE factions SET savings = ($2), leader_id = ($3) WHERE id = ($1)',
    update_quest_query: 'UPDATE quests SET money = ($2), stash = ($3), required_item_tag = ($4), reward_money = ($5), reward_reputation = ($6) WHERE id = ($1)',


    delete_market_order_query: 'DELETE FROM market_orders WHERE id = ($1)',
    delete_item_order_query: 'DELETE FROM items_orders WHERE id = ($1)',
    delete_battle_query: 'DELETE FROM battles WHERE id = ($1)',
    delete_char_query: 'DELETE FROM chars WHERE id = ($1)',

    
    set_hp_query: 'UPDATE chars SET hp = ($1) WHERE id = ($2)',
    set_id_query: 'UPDATE last_id SET last_id = ($2) WHERE id_type = ($1)',
    get_id_query: 'SELECT * FROM last_id WHERE id_type = ($1)',

    save_world_size_query: 'INSERT INTO worlds (x, y) VALUES ($1, $2)',
    load_world_size_query: 'SELECT * FROM worlds',
    load_pops_query: 'SELECT * FROM pops',
    load_chars_query: 'SELECT * FROM chars',
    load_orders_query: 'SELECT * FROM market_orders',
    load_item_orders_query: 'SELECT * FROM items_orders',
    load_battles_query: 'SELECT * FROM battles',
    load_areas_query: 'SELECT * FROM areas',
    load_quests_query: 'SELECT * FROM quests',
    load_factions_query: 'SELECT * FROM factions',

    find_user_by_login_query: 'SELECT * FROM accounts WHERE login = ($1)',
    select_char_by_id_query: 'SELECT * FROM chars WHERE id = ($1)',
    select_cell_by_id_query: 'SELECT * FROM cells WHERE id = ($1)',
    select_market_by_id_query: 'SELECT * FROM markets WHERE id = ($1)',
    select_market_items_by_id_query: 'SELECT * FROM items_markets WHERE id = ($1)',


    new_message_query: 'INSERT INTO messages (message, sender) VALUES ($1, $2) RETURNING id',
    clear_old_messages_query: 'DELETE FROM messages WHERE id < ($1)',
    get_messages_query: 'SELECT * FROM messages',
};

module.exports = constants;