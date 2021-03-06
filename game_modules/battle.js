var common = require("./common.js");
var constants = require("./constants.js");
const geom = require("./geom.js")

var Stash = require("./stash.js");
var Savings = require("./savings.js");
var BattleAI = require("./battle_ai.js")


class BattleReworked {
    constructor(world) {
        this.world = world;
        this.units = [];
        this.stash = new Stash();
        this.savings = new Savings();
        this.data = {};
        this.data.draw = false;
        this.data.collected_exp = 0;
        this.data.turn = 0;
        this.queued_action = []
    }

    async init(pool) {
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async update(pool) {
        var log = [];
        let i = this.data.turn;
        let unit = this.units[i];
        var char = this.world.get_char_from_id(unit.id)
        if (char == undefined) {
            await this.next_turn(pool)
            return log
        }
        if (char.get_hp() > 0) {
            if (char.is_player()) {
                if (this.queued_action[i] != undefined) {
                    await char.update(pool)
                    log.push(await this.action(pool, i, this.queued_action[i]));
                    this.queued_action[i] = undefined
                    await this.next_turn(pool)
                }
            } else {
                await char.update(pool)
                for (let i = 0; i < char.data.movement_speed; i++) {
                    let log_entry = await BattleAI.action(pool, this, char, true)
                    log.push(log_entry)
                }
                await this.next_turn(pool)
            }
        } else {
            await this.next_turn(pool)
        }
        if (this.changed) {
            this.save_to_db(pool)
        }
        return log;
    }

    async next_turn(pool) {
        this.data.turn += 1;
        if (this.data.turn >= this.unit_amount()) {
            this.data.turn = 0
        }   
        await this.save_to_db(pool);
    }

    get_data() {
        let data = {};
        for (var i = 0; i < this.units.length; i++) {
            let unit = this.units[i];
            var character = this.world.get_char_from_id(unit.id)
            if (character != undefined) {
                data[i] = {}
                data[i].id = unit.id;
                data[i].position = {x: unit.x, y: unit.y};
                data[i].rotation = unit.phi;
                data[i].tag = character.data.model;
                data[i].is_player = character.is_player();
                data[i].range = character.get_range();
                data[i].hp = character.get_hp();
            }
        }
        return data
    }

    async add_fighter(pool, agent, team, position) {
        console.log('add fighter')
        let unit = {}
        unit.id = agent.id;
        unit.team = team;
        unit.dead = false;
        if (position == undefined) {
            if (team == 1) {
                unit.x = 0
                unit.y = 10
            } else {
                unit.x = 0
                unit.y = 0
            }
        } else {
            unit.x = position.x
            unit.y = position.y
        }

        this.units.push(unit);
        await agent.set(pool, 'battle_id', this.id, false);
        await agent.set(pool, 'index_in_battle', this.units.length - 1, false);
        await agent.set(pool, 'in_battle', true);
        this.changed = true;
    }

    get_team_status(team) {
        let tmp = []
        for (let i in this.units) {
            let unit = this.units[i]
            if (unit.team == team) {
                let char = this.world.get_char_from_id(unit.id)
                if (char != undefined) {
                    tmp.push({name: char.name, hp: char.hp})
                }
                
            }
        }
        return tmp
    }

    is_over() {
        var hp = [0, 0];
        for (var i = 0; i < this.units.length; i++) {
            let unit = this.units[i]
            var char = this.world.get_char_from_id(unit.id);
            if (char != null) {
                hp[unit.team] += char.hp
            }
            if ((char == null) || (char.hp == 0)) {
                if (!unit.dead) {
                    this.data.collected_exp += char.get_exp_reward();
                    unit.dead = true;
                }
            }
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

    reward() {
        return this.data.collected_exp;
    }

    async reward_team(pool, team, exp) {
        var n = 0;
        for (let i = 0; i < this.units.length; i++){
            let unit = this.units[i];
            if (unit.team == team) {
                n += 1
            }
        }

        for (let i = 0; i < this.units.length; i++) {
            let unit = this.units[i];
            let char = this.world.get_char_from_id(unit.id);
            if (char != undefined)                {
                if (team != 2) {
                    if ((unit.team == team) && (!char.data.dead)) {
                        await char.give_exp(pool, Math.floor(exp / n));
                    }
                }
                await char.set(pool, 'in_battle', false);
            }
        }

        if (team != 2) {
            // first added unit of team who is alive is a leader
            var i = 0;
            while ((this.units[i].team != team) & (!this.units[i].dead)) {
                i += 1;
            }
            if (i >= this.units.length) {
                return
            }

            var leader = this.world.get_char_from_id(this.units[i].id);

            // leader gets all generated loot items
            for (let i = 0; i < this.units.length; i ++) {
                let unit = this.units[i];
                let character = this.world.get_char_from_id(unit.id);
                if ((character != undefined) && (character.hp == 0)) {
                    await character.transfer_all(pool, this);
                    leader.equip.add_item(this.world.generate_loot(character.get_item_lvl(), character.get_tag()));
                }
            }

            //leader gets all loot stash
            for (var tag of this.world.constants.TAGS) {
                var x = this.stash.get(tag);
                await this.transfer(pool, leader, tag, x);
            }
        }
        this.save_to_db(pool);
    }

    async load_to_db(pool) {
        let res =  await common.send_query(pool, constants.new_battle_query, [this.units, this.savings.get_json(), this.stash.get_json(), this.data]);
        return res.rows[0].id
    }

    load_from_json(data) {
        console.log(data)
        this.id = data.id
        this.units = data.units
        this.data = data.data
        this.savings.load_from_json(data.savings)
        this.stash.load_from_json(data.stash)
    }

    async save_to_db(pool) {
        await common.send_query(pool, constants.update_battle_query, [this.id, this.units, this.savings.get_json(), this.stash.get_json(), this.data])
        this.changed = false
    }

    async delete_from_db(pool) {
        await common.send_query(pool, constants.delete_battle_query, [this.id]);
    }

    async transfer(pool, target, tag, x) {
        this.stash.transfer(target.stash, tag, x);
        this.changed = true;
        target.changed = true;
    }

    unit_amount() {
        return this.units.length;
    }

    async action(pool, actor_index, action) {
        let unit = this.units[actor_index]
        var character = this.world.get_char_from_id(unit.id);

        //no action
        if (action.action == null) {
            return {action: 'pff', who: actor_index};
        }

        //move toward enemy
        if (action.action == 'move') {
            unit.x = action.target.x + unit.x;
            unit.y = action.target.y + unit.y;
            return {action: 'move', who: actor_index, target: action.target, actor_name: character.name}
        } else if (action.action == 'attack') {
            if (action.target != null) {
                let unit2 = this.units[action.target];
                let target_char = this.world.get_char_from_id(unit2.id);
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
            let unit2 = this.units[action.target];
            let target_char = this.world.get_char_from_id(unit2.id);
            let result = await character.spell_attack(pool, target_char, spell_tag);
            if ('close_distance' in result) {
                let dist = geom.dist(unit, unit2)
                if (dist > 1.9) {
                    let v = geom.minus(unit2, unit);
                    let u = geom.mult(geom.normalize(v), 0.9);
                    v = geom.minus(v, u)
                    unit.x = v.x
                    unit.y = v.y
                }
                result.new_pos = {x: unit.x, y: unit.y};
            }
            return {action: spell_tag, who: actor_index, result: result, actor_name: character.name};
        }
    }
    push_action(index, action) {
        if (action != undefined) {
            if (action.action == 'move') {
                this.queued_action[index] = {action: 'move', target: geom.normalize(geom.minus(action.target, this.units[index]))}
            }
            if (action.action == 'attack') {
                this.queued_action[index] = BattleAI.convert_attack_to_action(this, index, action.target);
            }
            if (action.action == 'flee') {
                this.queued_action[index] = {action: 'flee'}
            }
            if (action.action.startsWith('spell')) {
                this.queued_action[index] = {action: action.action, target: action.target}
            }
        }
    }
}



module.exports = BattleReworked;