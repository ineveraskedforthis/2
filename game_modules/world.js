var constants = require("./constants.js")
var common = require("./common.js")

var Map = require("./map.js")
var UserManager = require("./user_manager.js")
var SocketManager = require("./socket_manager.js")


module.exports = class World {
    async init(pool, io, x, y) {
        this.io = io
        this.user_manager = new UserManager(this)
        this.socket_manager = new SocketManager(this)
        this.constants = require("./world_constants_1.js");
        this.x = x;
        this.y = y;
        this.agents = {};
        this.BASE_BATTLE_RANGE = 10;
        this.chars = {};
        this.orders = {};
        this.map = new Map();
        this.HISTORY_PRICE = {}
        this.HISTORY_PRICE['food'] = 10
        this.HISTORY_PRICE['clothes'] = 10
        await this.map.init(pool, this);
        this.battles = {}
        let pop = await this.create_pop(pool, 0, 0, 100, {'food': 1, 'clothes': 1}, 'pepe', 'random dudes', 100000)
        this.agents[pop.id] = pop;
        await common.send_query(pool, constants.save_world_size_query, [x, y])
    }

    async update(pool) {
        for (let i in this.agents) {
            await this.agents[i].update(pool);
        }
        for (let i in this.chars) {
            if (!this.chars[i].data.dead) {
                await this.chars[i].update(pool);
            }
        }
        for (let i in this.battles) {
            var battle = this.battles[i]
            if (battle == null) {
                continue
            }
            if (battle.is_over() == -1) {
                var log = await battle.update(pool);
                for (let i = 0; i < battle.ids.length; i++) {
                    let character = this.chars[battle.ids[i]];
                    if (character.data.is_player) {
                        this.send_to_character_user(character, 'battle-update', battle.get_data())
                        log.forEach(log_entry => this.send_message_to_character_user(character, log_entry));
                    }
                }
            } else {
                for (let i = 0; i < battle.ids.length; i++) {
                    let character = this.chars[battle.ids[i]];
                    if (character.data.is_player) {
                        this.send_to_character_user(character, 'battle-has-ended', null);
                    }
                }
                var winner = battle.is_over();
                var exp_reward = battle.reward(1 - winner);
                await battle.collect_loot(pool);
                await battle.reward_team(pool, winner, exp_reward);
                await this.delete_battle(pool, battle.id);
            }
        }

        this.socket_manager.update_market_info(this.map.cells[0][0]);
        this.socket_manager.update_user_list();
    }

    get_cell(x, y) {
        return this.map.get_cell(x, y);
    }

    get_cell_by_id(id) {
        return this.map.get_cell_by_id(id);
    }

    get_cell_id_by_x_y(x, y) {
        return x * this.y + y
    }

    // get_pops(pool) {
    //     var tmp = [];
    //     for (var i in this.agents) {
    //         if (i.is_pop) {
    //             tmp.push(i);
    //         }
    //     }
    //     return tmp;
    // }

    // async get_total_money() {
    //     var tmp = 0;
    //     for (var i in this.agents) {
    //         tmp += i.savings.get('money');
    //     }
    //     return tmp;
    // }

    async get_new_id(pool, str) {
        // console.log(str);
        var x = await common.send_query(pool, constants.get_id_query, [str]);
        x = x.rows[0];
        // console.log(x);
        x = x.last_id;
        x += 1;
        await common.send_query(pool, constants.set_id_query, [str, x]);
        return x;
    }

    async add_order(pool, order) {
        this.orders[order.id] = order;
    }

    get_order (order_id) {
        return this.orders[order_id];
    }

    async kill(pool, character) {
        await character.set(pool, 'dead', true);
        if (character.data.is_player) {
            var user = this.users[character.user_id];
            await user.get_new_char(pool);
            this.chars[user.character.id] = user.character;
        }
        await character.delete_from_db(pool);
        // this.chars[character.id] = null;
    }

    async create_monster(pool, monster_class, cell_id) {
        var monster = new monster_class();
        var id = await monster.init(pool, this, cell_id);
        this.chars[id] = monster;
        return monster;
    }

    async create_pop(pool, x, y, size, needs, race_tag, name, savings) {
        let pop = new Pop();
        let cell_id = this.get_cell_id_by_x_y(x, y)
        await pop.init(pool, this, cell_id, size, needs, race_tag, name)
        await pop.savings.inc(savings)
        await pop.save_to_db(pool)
        return pop
    }

    async create_battle(pool, attackers, defenders) {
        var battle = new Battle();
        var id = await battle.init(pool, world);
        for (var i = 0; i < attackers.length; i++) {
            await battle.add_fighter(pool, attackers[i], 0);
        }
        for (var i = 0; i < defenders.length; i++) {
            await battle.add_fighter(pool, defenders[i], 1);
        }
        this.battles[id] = battle;
        return battle;
    }

    async delete_battle(pool, id) {
        var battle = this.battles[id];
        await battle.delete_from_db(pool);
        this.battles[id] = null;
    }

    async load_user_data_from_db(pool, login) {
        var res = await common.send_query(pool, constants.find_user_by_login_query, [login]);
        if (res.rows.length == 0) {
            return null;
        }
        return res.rows[0];
    }

    async load_user_to_memory(pool, data) {
        var user = new User();
        await user.load_from_json(pool, this, data);
        this.users[user.id] = user;
        return user;
    }

    async load_character_data_from_db(pool, char_id) {
        var res = await common.send_query(pool, constants.select_char_by_id_query, [char_id]);
        if (res.rows.length == 0) {
            return null;
        }
        return res.rows[0];
    }

    async load_character_data_to_memory(pool, data) {
        var character = new Character();
        await character.load_from_json(pool, this, data)
        this.chars[data.id] = character;
        return character;
    }

    //check login availability
    async check_login(pool, login) {
        var res = await common.send_query(pool, constants.find_user_by_login_query, [login]);
        if (res.rows.length == 0) {
            return true;
        }
        return false;
    }

    get_tick_death_rate(race) {
        return 0.001
    }

    get_tick_max_growth(race) {
        return 0.001
    }
}