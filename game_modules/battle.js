"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleReworked2 = void 0;
const stash_1 = require("./base_game_classes/stash");
var common = require("./common.js");
var constants = require("./static_data/constants.js");
const geom_1 = require("./geom");
var Savings = require("./base_game_classes/savings.js");
const battle_ai_1 = require("./battle_ai");
class UnitsHeap {
    constructor() {
        this.data = [];
        this.heap = [];
        this.last = 0;
        this.selected = -1;
    }
    get_value(i) {
        return this.data[i].next_turn_after;
    }
    get_units_amount() {
        return this.data.length;
    }
    get_unit(i) {
        return this.data[i];
    }
    get_selected_unit() {
        return this.data[this.selected];
    }
    push(obj) {
        this.heap[this.last] = obj;
        this.last += 1;
        this.shift_up(this.last - 1);
    }
    shift_up(i) {
        let tmp = i;
        while (tmp > 0 && this.get_value(tmp) < this.get_value(Math.floor(tmp / 2))) {
            this.swap(tmp, Math.floor((tmp - 1) / 2));
            tmp = Math.floor((tmp - 1) / 2);
        }
    }
    shift_down(i) {
        let tmp = i;
        while (tmp * 2 + 1 < this.last) {
            if (tmp * 2 + 2 < this.last) {
                if ((this.get_value(tmp * 2 + 2) < this.get_value(tmp * 2 + 1)) && (this.get_value(tmp * 2 + 2) < this.get_value(tmp))) {
                    this.swap(tmp, tmp * 2 + 2);
                    tmp = tmp * 2 + 2;
                }
                else if (this.get_value(tmp * 2 + 1) < this.get_value(tmp)) {
                    this.swap(tmp, tmp * 2 + 1);
                    tmp = tmp * 2 + 1;
                }
                else {
                    break;
                }
            }
            else if (this.get_value(tmp * 2 + 1) < this.get_value(tmp)) {
                this.swap(tmp, tmp * 2 + 1);
                tmp = tmp * 2 + 1;
            }
            else {
                break;
            }
        }
    }
    add_unit(u) {
        this.data.push(u);
        this.push(this.data.length - 1);
    }
    swap(a, b) {
        let s = this.heap[a];
        this.heap[a] = this.heap[b];
        this.heap[b] = s;
    }
    pop() {
        if (this.last == 0) {
            return undefined;
        }
        let tmp = this.heap[0];
        this.selected = tmp;
        this.last -= 1;
        this.heap[0] = this.heap[this.last];
        this.shift_down(0);
        return tmp;
    }
    update(dt) {
        for (let i in this.data) {
            this.data[i].update(dt);
        }
    }
    get_json() {
        return {
            data: this.data,
            last: this.last,
            heap: this.heap
        };
    }
    load_from_json(j) {
        for (let i in j.data) {
            let unit = new UnitData();
            unit.load_from_json(j.data[i]);
            this.data.push(unit);
        }
        this.last = j.last;
        this.heap = j.heap;
        this.selected = j.selected;
    }
}
class UnitData {
    constructor() {
        this.action_points_left = 0;
        this.action_points_max = 0;
        this.initiative = 100;
        this.speed = 0;
        this.next_turn_after = 100;
        this.position = { x: 0, y: 0 };
        this.char_id = -1;
        this.team = -1;
        this.dead = true;
    }
    init(char, position, team) {
        let ap = char.get_action_points();
        this.action_points_left = ap;
        this.action_points_max = ap;
        this.initiative = char.get_initiative();
        this.speed = char.get_speed();
        this.next_turn_after = char.get_initiative();
        this.position = position;
        this.char_id = char.id;
        this.team = team;
        this.dead = false;
    }
    load_from_json(data) {
        this.action_points_left = data.action_points_left;
        this.action_points_max = data.action_points_max;
        this.initiative = data.initiative;
        this.speed = data.speed;
        this.next_turn_after = data.next_turn_after;
        this.position = data.position;
        this.char_id = data.char_id;
        this.team = data.team;
        this.dead = data.dead;
    }
    update(dt) {
        this.next_turn_after = this.next_turn_after - dt;
    }
    end_turn() {
        this.next_turn_after = this.initiative;
        this.action_points_left = Math.min((this.action_points_left + this.speed), this.action_points_max);
    }
}
class BattleReworked2 {
    constructor(world) {
        this.heap = new UnitsHeap();
        this.world = world;
        this.id = -1;
        this.savings = new Savings();
        this.stash = new stash_1.Stash();
        this.changed = false;
        this.waiting_for_input = false;
        this.draw = false;
    }
    async init(pool) {
        this.id = await this.load_to_db(pool);
        return this.id;
    }
    async load_to_db(pool) {
        let res = await common.send_query(pool, constants.new_battle_query, [this.heap.get_json(), this.savings.get_json(), this.stash.get_json(), this.waiting_for_input]);
        return res.rows[0].id;
    }
    load_from_json(data) {
        this.id = data.id;
        this.heap.load_from_json(data.heap);
        this.savings.load_from_json(data.savings);
        this.stash.load_from_json(data.stash);
        this.waiting_for_input = data.waiting_for_input;
    }
    async save_to_db(pool) {
        await common.send_query(pool, constants.update_battle_query, [this.id, this.heap.get_json(), this.savings.get_json(), this.stash.get_json(), this.waiting_for_input]);
        this.changed = false;
    }
    async delete_from_db(pool) {
        await common.send_query(pool, constants.delete_battle_query, [this.id]);
    }
    async update(pool) {
        if (this.changed) {
            this.save_to_db(pool);
        }
        if (!this.waiting_for_input) {
            console.log('??? update');
            console.log(this.heap.heap);
            // heap manipulations
            let tmp = this.heap.pop();
            if (tmp == undefined) {
                return { responce: 'no_units_left' };
            }
            let unit = this.heap.get_unit(tmp);
            let time_passed = unit.next_turn_after;
            this.heap.update(time_passed);
            //character stuff
            let char = this.world.get_char_from_id(unit.char_id);
            if ((char == undefined) || char.is_dead()) {
                return { responce: 'dead_unit' };
            }
            await char.update(pool);
            let dt = unit.next_turn_after;
            this.heap.update(dt);
            console.log(char.name);
            //actual actions
            if (char.is_player()) {
                console.log('player turn');
                this.waiting_for_input = true;
                this.changed = true;
                return 'waiting_for_input';
            }
            else {
                console.log('ai turn');
                let log_obj = [];
                log_obj = await this.make_turn(pool, log_obj);
                console.log(log_obj);
                unit.end_turn();
                this.heap.push(tmp);
                this.changed = true;
                return { responce: 'end_turn', data: log_obj };
            }
        }
        else {
            return { responce: 'waiting_for_input' };
        }
    }
    get_units() {
        return this.heap.data;
    }
    get_unit(i) {
        return this.heap.get_unit(i);
    }
    get_char(unit) {
        return this.world.get_char_from_id(unit.char_id);
    }
    async make_turn(pool, log) {
        console.log('turn of ' + this.heap.selected);
        let unit = this.heap.get_selected_unit();
        let char = this.get_char(unit);
        let action = battle_ai_1.BattleAI.action(this, char);
        console.log(action);
        while (action.action != 'end_turn') {
            log.push(action);
            console.log(action);
            this.action(pool, this.heap.selected, action);
            action = battle_ai_1.BattleAI.action(this, char);
        }
        this.changed = true;
        return log;
    }
    async action(pool, unit_index, action) {
        let unit = this.heap.get_unit(unit_index);
        var character = this.world.get_char_from_id(unit.char_id);
        console.log('processing action');
        console.log(action);
        //no action
        if (action.action == null) {
            return { action: 'pff', who: unit_index };
        }
        //move toward enemy
        if (action.action == 'move') {
            console.log(unit.action_points_left);
            let tmp = geom_1.geom.minus(action.target, unit.position);
            if (geom_1.geom.norm(tmp) * 2 > unit.action_points_left) {
                tmp = geom_1.geom.mult(geom_1.geom.normalize(tmp), unit.action_points_left / 2);
            }
            unit.position.x = tmp.x + unit.position.x;
            unit.position.y = tmp.y + unit.position.y;
            let points_spent = geom_1.geom.norm(tmp) * 2;
            unit.action_points_left -= points_spent;
            return { action: 'move', who: unit_index, target: unit.position, actor_name: character.name };
        }
        if (action.action == 'attack') {
            if (action.target != null) {
                let unit2 = this.heap.get_unit(action.target);
                let char = this.world.get_char_from_id(unit.char_id);
                console.log(geom_1.geom.dist(unit.position, unit2.position));
                console.log(char.get_range());
                if ((geom_1.geom.dist(unit.position, unit2.position) <= char.get_range()) && unit.action_points_left >= 1) {
                    let target_char = this.world.get_char_from_id(unit2.char_id);
                    let result = await character.attack(pool, target_char);
                    unit.action_points_left -= 1;
                    return { action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name };
                }
            }
            return { action: 'pff' };
        }
        if (action.action == 'flee') {
            if (unit.action_points_left > 3) {
                unit.action_points_left -= 3;
                let dice = Math.random();
                if (dice <= 0.4) {
                    this.draw = true;
                    return { action: 'flee', who: unit_index };
                }
                else {
                    return { action: 'pff', who: unit_index };
                }
            }
        }
        if (action.action == 'spell_target') {
            if (unit.action_points_left > 3) {
                let spell_tag = action.spell_tag;
                let unit2 = this.heap.get_unit(action.target);
                let target_char = this.world.get_char_from_id(unit2.char_id);
                let result = await character.spell_attack(pool, target_char, spell_tag);
                if (result.flags.close_distance) {
                    let dist = geom_1.geom.dist(unit.position, unit2.position);
                    if (dist > 1.9) {
                        let v = geom_1.geom.minus(unit2.position, unit.position);
                        let u = geom_1.geom.mult(geom_1.geom.normalize(v), 0.9);
                        v = geom_1.geom.minus(v, u);
                        unit.position.x = v.x;
                        unit.position.y = v.y;
                    }
                    result.new_pos = { x: unit.position.x, y: unit.position.y };
                }
                unit.action_points_left -= 3;
                return { action: spell_tag, who: unit_index, result: result, actor_name: character.name };
            }
        }
        if (action.action == 'end_turn') {
            this.waiting_for_input = false;
            unit.end_turn();
            this.heap.push(unit_index);
            return { action: 'end_turn', who: unit_index };
        }
        this.changed = true;
    }
    get_data() {
        let data = {};
        for (var i = 0; i < this.heap.data.length; i++) {
            let unit = this.heap.data[i];
            var character = this.world.get_char_from_id(unit.char_id);
            if (character != undefined) {
                data[i] = {};
                data[i].id = unit.char_id;
                data[i].position = { x: unit.position.x, y: unit.position.y };
                data[i].tag = character.get_model();
                data[i].is_player = character.is_player();
                data[i].range = character.get_range();
                data[i].hp = character.get_hp();
            }
        }
        return data;
    }
    add_fighter(agent, team, position) {
        console.log('add fighter');
        if (position == undefined) {
            if (team == 1) {
                position = { x: 0, y: 10 };
            }
            else {
                position = { x: 0, y: 0 };
            }
        }
        let unit = new UnitData();
        unit.init(agent, position, team);
        this.heap.add_unit(unit);
        agent.set_flag('in_battle', true);
        agent.set_in_battle_id(this.heap.data.length - 1);
        agent.set_battle_id(this.id);
        this.changed = true;
    }
    async transfer(target, tag, x) {
        this.stash.transfer(target.stash, tag, x);
    }
    get_team_status(team) {
        let tmp = [];
        for (let i in this.heap.data) {
            let unit = this.heap.data[i];
            if (unit.team == team) {
                let char = this.world.get_char_from_id(unit.char_id);
                if (char != undefined) {
                    tmp.push({ name: char.name, hp: char.get_hp(), next_turn: unit.next_turn_after });
                }
            }
        }
        return tmp;
    }
    get_status() {
        let tmp = [];
        for (let i in this.heap.data) {
            let unit = this.heap.data[i];
            let char = this.world.get_char_from_id(unit.char_id);
            if (char != undefined) {
                tmp.push({ name: char.name, hp: char.get_hp(), next_turn: unit.next_turn_after, ap: unit.action_points_left });
            }
        }
        return tmp;
    }
    is_over() {
        var team_lost = [];
        for (let team = 0; team < 10; team++) {
            team_lost[team] = true;
        }
        for (var i = 0; i < this.heap.data.length; i++) {
            let unit = this.heap.data[i];
            var char = this.world.get_char_from_id(unit.char_id);
            if ((char == undefined) || (char.hp == 0)) {
                if (!unit.dead) {
                    unit.dead = true;
                }
            }
            else {
                team_lost[unit.team] = false;
            }
        }
        if (this.draw == true) {
            return 'draw';
        }
        else {
            let teams_left = 0;
            let team_not_lost = -1;
            for (let team = 0; team < 10; team++) {
                if (!team_lost[team]) {
                    teams_left += 1;
                    team_not_lost = team;
                }
            }
            if (teams_left > 1) {
                return -1;
            }
            else if (teams_left == 1) {
                return team_not_lost;
            }
        }
        return -1;
    }
    clean_up_battle() {
        for (let i = 0; i < this.heap.get_units_amount(); i++) {
            let unit = this.heap.get_unit(i);
            let char = this.world.get_char_from_id(unit.char_id);
            if (char != undefined) {
                char.set_flag('in_battle', false);
                char.set_battle_id(-1);
            }
        }
    }
    async reward_team(pool, team) {
        let units_amount = this.heap.get_units_amount();
        var n = 0;
        for (let i = 0; i < units_amount; i++) {
            let unit = this.heap.get_unit(i);
            if (unit.team == team) {
                n += 1;
            }
        }
        // first added unit of team who is alive is a leader
        var i = 0;
        let unit = this.heap.get_unit(i);
        while ((unit.team != team) && (!unit.dead) && (i < units_amount)) {
            i += 1;
            unit = this.heap.get_unit(i);
        }
        if ((i == units_amount) && (unit.team != team)) {
            return -1;
        }
        var leader = this.world.get_char_from_id(unit.char_id);
        // team leader gets all loot (should rework one day)
        for (let i = 0; i < units_amount; i++) {
            let unit = this.heap.get_unit(i);
            let character = this.world.get_char_from_id(unit.char_id);
            if ((character != undefined) && (character.is_dead())) {
                character.transfer_all_inv(leader);
                let resources = leader.exploit(character);
                resources.transfer_all(leader);
            }
        }
        //leader gets all loot stash
        for (var tag of this.world.constants.TAGS) {
            var x = this.stash.get(tag);
            await this.transfer(leader, tag, x);
        }
        this.changed = true;
    }
    async process_input(pool, unit_index, input) {
        if (!this.waiting_for_input) {
            return { action: 'pff', who: unit_index };
        }
        if (this.heap.selected != unit_index) {
            return { action: 'pff', who: unit_index };
        }
        if (input != undefined) {
            this.changed = true;
            if (input.action == 'move') {
                return await this.action(pool, unit_index, { action: 'move', target: input.target });
            }
            else if (input.action == 'attack') {
                return await this.action(pool, unit_index, battle_ai_1.BattleAI.convert_attack_to_action(this, unit_index, input.target));
            }
            else if (input.action == 'flee') {
                return await this.action(pool, unit_index, { action: 'flee' });
            }
            else {
                return await this.action(pool, unit_index, input);
            }
        }
    }
    units_amount() {
        return this.heap.get_units_amount();
    }
}
exports.BattleReworked2 = BattleReworked2;
