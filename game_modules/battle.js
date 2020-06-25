var common = require("./common.js");
var constants = require("./constants.js");

var Stash = require("./stash.js");
var Savings = require("./savings.js");
var BattleAI = require("./battle_ai.js")

module.exports = class Battle {
    constructor(world) {
        this.world = world
        this.ids = [];
        this.teams = [];
        this.positions = [];
        this.stash = new Stash();
        this.savings = new Savings();
        this.data = {};
        this.data.draw = false;
    }

    async init(pool) {
        this.id = await this.world.get_new_id(pool, 'battle_id');
        // var range = world.BASE_BATTLE_RANGE;        
        await this.load_to_db(pool);
        return this.id;
    }

    get_data() {
        var data = {}
        for (var i = 0; i < this.ids.length; i++) {
                var character = this.world.chars[this.ids[i]]
                data[i] = {}
                data[i].id = this.ids[i];
                data[i].position = this.positions[i];
                data[i].tag = character.data.model;
            }
        return data
    }
    

    async add_fighter(pool, agent, team) {
        this.ids.push(agent.id);
        this.teams.push(team);
        if (team == 1) {
            this.positions.push(this.world.BASE_BATTLE_RANGE);
        } else {
            this.positions.push(0);
        }
        await agent.set(pool, 'battle_id', this.id, false);
        await agent.set(pool, 'index_in_battle', this.ids.length - 1, false);
        await agent.set(pool, 'in_battle', true);
        this.save_to_db(pool);
    }

    async update(pool) {
        var log = [];
        for (var i = 0; i < this.ids.length; i++) {
            var char = this.world.chars[this.ids[i]]
            if (char.get_hp() > 0) {
                char.update2(pool)
                for (let i = 0; i < char.data.movement_speed; i++) {
                    var log_entry = await BattleAI.action(pool, char, true)
                    log.push(log_entry)
                }                
            }
        }
        await this.save_to_db(pool);
        return log;
    }

    async action(pool, actor_index, action) {
        var character = this.world.chars[this.ids[actor_index]];
        if (action.action == null) {
            return {action: 'pff', who: actor_index};
        }
        if (action.action == 'move') {
            if (action.target == 'right') {
                this.positions[actor_index] += 1;
            } else {
                this.positions[actor_index] -= 1;
            }
            return {action: 'move', who: actor_index, target: action.target, actor_name: character.name}
        } else if (action.action == 'attack') {
            if (action.target != null) {
                let target_char = this.world.chars[this.ids[action.target]];
                let result = await character.attack(pool, target_char);
                return {action: 'attack', attacker: actor_index, target: action.target, result: result, actor_name: character.name};
            }
            return {action: 'pff'};
        } else if (action.action == 'flee') {
            let dice = Math.random();
            if (dice <= 0.4) {
                this.data.draw = true;
                return {action: 'flee', who: actor_index};
            } else {
                return {action: 'pff', who: actor_index};
            }
        } else if (action.action.startsWith('spell:')) {
            let spell_tag = action.action.substring(6);
            let target_char = this.world.chars[this.ids[action.target]];
            let result = await character.spell_attack(pool, target_char, spell_tag);
            return {action: spell_tag, who: actor_index, result: result, actor_name: character.name};
        }
    }

    is_over() {
        var hp = [0, 0];
        for (var i = 0; i < this.ids.length; i++) {
            var character = this.world.chars[this.ids[i]];
            var x = 0
            if (character == null) {
                x = 0
            } else {
                x = character.hp;
            }
            hp[this.teams[i]] += x;
        }
        if (hp[0] == 0) {
            return 1;
        }
        if (hp[1] == 0) {
            return 0;
        }
        if (this.data.draw == true) {
            return 2;
        }
        return -1;
    }

    async collect_loot(pool) {
        let item_lvl = 0;
        for (var i = 0; i < this.ids.length; i ++) {
            var character = this.world.chars[this.ids[i]];
            if (character.hp == 0) {
                await character.transfer_all(pool, this);
                item_lvl += character.get_item_lvl()
            }
        }
        return item_lvl;
    }

    reward(team) {
        var exp = 0;
        for (var i = 0; i < this.ids.length; i++) {
            if (this.teams[i] == team) {
                exp += this.world.chars[this.ids[i]].get_exp_reward();
            }
        }
        return exp;
    }

    async reward_team(pool, team, exp, ilvl) {
        var n = 0;
        for (let i = 0; i < this.ids.length; i++){
            if (this.teams[i] == team) {
                n += 1
            }
        }
        for (let i = 0; i < this.ids.length; i++) {
            var character = this.world.chars[this.ids[i]];
            if (team != 2) {
                if (this.teams[i] == team && !character.data.dead) {
                    await character.give_exp(pool, Math.floor(exp / n));
                }
            }            
            await character.set(pool, 'in_battle', false);
        }
        if (team != 2) {
            var i = 0;
            while (this.teams[i] != team) {
                i += 1;
            }
            var leader = this.world.chars[this.ids[i]];
            for (var tag of this.world.constants.TAGS) {
                var x = this.stash.get(tag);
                await this.transfer(pool, leader, tag, x);
            }
            leader.equip.add_item(this.world.generate_loot(ilvl))
        }
        
    }

    async load_to_db(pool) {
        await common.send_query(pool, constants.new_battle_query, [this.id, this.ids, this.teams, this.positions, this.savings.get_json(), this.stash.get_json()]);
    }

    load_from_json(data) {
        this.id = data.id
        this.ids = data.ids
        this.teams = data.teams
        this.positions = data.positions
        this.savings.load_from_json(data.savings)
        this.stash.load_from_json(data.stash)
    }

    async save_to_db(pool) {
        await common.send_query(pool, constants.update_battle_query, [this.id, this.ids, this.teams, this.positions, this.savings.get_json(), this.stash.get_json()])
    }

    async delete_from_db(pool) {
        await common.send_query(pool, constants.delete_battle_query, [this.id]);
    }

    async transfer(pool, target, tag, x) {
        this.stash.transfer(target.stash, tag, x);
        await this.save_to_db(pool);
        await target.save_to_db(pool);
    }
}