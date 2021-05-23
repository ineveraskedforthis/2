
import { Stash } from "./base_game_classes/stash";

var common = require("./common.js");
var constants = require("./static_data/constants.js");

import {geom} from './geom'
var Savings = require("./base_game_classes/savings.js");
import {BattleAI} from './battle_ai'
import {CharacterGenericPart} from './base_game_classes/character_generic_part'
import { tag } from "./static_data/type_script_types";


export interface MoveAction {action: "move", target: {x: number, y:number}}
export interface AttackAction {action: "attack", target: number}
interface FleeAction {action: "flee"}
interface SpellTargetAction {action: "spell_target", target: number, spell_tag: "power_bolt"|"charge"}
interface EndTurn {action: 'end_turn'}
interface NullAction {action: null}
export type Action = MoveAction|AttackAction|FleeAction|SpellTargetAction|EndTurn|NullAction
export type ActionTag = 'move'|'attack'|'flee'|'spell_target'|'end_turn'|null

type ActionLog = Action[]

class UnitsHeap {
    data: UnitData[];
    last: number;
    heap: number[];
    selected: number;

    constructor() {
        this.data = []
        this.heap = []
        this.last = 0;
        this.selected = -1
    }

    get_value(i: number) {
        return this.data[i].next_turn_after;
    }

    get_units_amount() {
        return this.data.length
    }

    get_unit(i: number): UnitData {
        return this.data[i]
    }

    get_selected_unit(): UnitData {
        return this.data[this.selected]
    }

    push(obj: number) {
        this.heap[this.last] = obj;
        this.last += 1;
        this.shift_up(this.last - 1)
    }

    shift_up(i:number) {
        let tmp = i;
        while (tmp > 0 && this.get_value(tmp) < this.get_value(Math.floor(tmp / 2))) {
            this.swap(tmp, Math.floor(tmp / 2))
            tmp = Math.floor(tmp / 2)
        }
    }

    shift_down(i: number) {
        let tmp = i;
        while (tmp * 2 < this.last) {
            if (tmp * 2 + 1 < this.last) {
                if ((this.get_value(tmp * 2 + 1) > this.get_value(tmp * 2)) && (this.get_value(tmp * 2 + 1) > this.get_value(tmp))) {
                    this.swap(tmp, tmp * 2 + 1)
                    tmp = tmp * 2 + 1
                } else if (this.get_value(tmp * 2) > this.get_value(tmp)) {
                    this.swap(tmp, tmp * 2)
                    tmp = tmp * 2
                } else {
                    break
                }
            }
        }
    }

    add_unit(u: UnitData) {
        this.data.push(u);
    }

    swap(a: number, b: number) {
        let s = this.heap[a];
        this.heap[a] = this.heap[b]
        this.heap[b] = s
    }

    pop():number|undefined {
        if (this.last == 0) {
            return undefined
        }
        let tmp = this.heap[0]
        this.selected = tmp;
        this.last -= 1
        this.heap[0] = this.heap[this.last]
        this.shift_down(0);
        return tmp
    }

    update(dt: number) {
        for (let i in this.data) {
            this.data[i].update(dt)
        }
    }

    get_json() {
        return {
            data: this.data,
            last: this.last,
            heap: this.heap
        }
    }

    load_from_json(j: any) {
        this.data = j.data
        this.last = j.last
        this.heap = j.heap
    }
}

class UnitData {
    action_points_left: number;
    action_points_max: number;
    next_turn_after: number;
    initiative: number;
    speed: number;
    position: {x: number, y: number};
    char_id: number
    team: number
    dead: boolean


    constructor(char:CharacterGenericPart, position: {x: number, y: number}, team: number) {
        let ap = char.get_action_points()
        this.action_points_left = ap;
        this.action_points_max = ap;
        this.initiative = char.get_initiative()
        this.speed = char.get_speed()
        this.next_turn_after = char.get_initiative()
        this.position = position
        this.char_id = char.id
        this.team = team
        this.dead = false
    }

    update(dt: number) {
        this.next_turn_after = this.next_turn_after - dt
    }

    end_turn() {
        this.next_turn_after = this.initiative;
        this.action_points_left = Math.min((this.action_points_left + this.speed), this.action_points_max);
    }
}


export class BattleReworked2 {
    world: any;
    heap: UnitsHeap;
    id: number;
    savings: any;
    stash: Stash;
    changed: boolean;
    draw: boolean;
    waiting_for_input = true;


    constructor(world: any) {
        this.heap = new UnitsHeap();
        this.world = world;
        this.id = -1
        this.savings = new Savings()
        this.stash = new Stash()
        this.changed = false
        this.waiting_for_input = false
        this.draw = false
    }

    async init(pool: any) {
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async load_to_db(pool: any) {
        let res =  await common.send_query(pool, constants.new_battle_query, [this.heap.get_json(), this.savings.get_json(), this.stash.get_json()]);
        return res.rows[0].id
    }

    load_from_json(data: any) {
        this.id = data.id
        this.heap.load_from_json(data.heap)
        this.savings.load_from_json(data.savings)
        this.stash.load_from_json(data.stash)
        this.waiting_for_input = data.waiting_for_input
    }

    async save_to_db(pool: any) {
        await common.send_query(pool, constants.update_battle_query, [this.id, this.heap.get_json(), this.savings.get_json(), this.stash.get_json(), this.waiting_for_input])
        this.changed = false
    }

    async delete_from_db(pool: any) {
        await common.send_query(pool, constants.delete_battle_query, [this.id]);
    }


    async update(pool:any) {
        if (this.changed) {
            this.save_to_db(pool)
        }

        if (!this.waiting_for_input) {
            // heap manipulations
            let tmp = this.heap.pop()
            if (tmp == undefined) {
                return {responce: 'no_units_left'}
            }
            let unit = this.heap.get_unit(tmp)
            let time_passed = unit.next_turn_after
            this.heap.update(time_passed)
            

            //character stuff
            let char:CharacterGenericPart = this.world.get_char_from_id(unit.char_id)
            if ((char == undefined) || char.is_dead()) {
                return {responce: 'dead_unit'}
            }
            await char.update(pool)
            let dt = unit.next_turn_after
            this.heap.update(dt)


            //actual actions
            if (char.is_player()) {
                this.waiting_for_input = true
                return 'waiting_for_input'
            } else {
                let log_obj: ActionLog = [];
                log_obj = await this.make_turn(pool, log_obj)
                unit.end_turn()
                return {responce: 'end_turn', data: log_obj}
            }
        } else {
            return {responce: 'waiting_for_input'}
        }
    }

    get_units() {
        return this.heap.data
    }

    get_unit(i: number) {
        return this.heap.get_unit(i)
    }

    get_char(unit: UnitData) {
        return this.world.get_char_from_id(unit.char_id)
    }

    async make_turn(pool: any, log: ActionLog): Promise<ActionLog> {
        let unit = this.heap.get_selected_unit()
        let char = this.get_char(unit)
        let action:Action = BattleAI.action(this, char);
        while (action.action != 'end_turn') {
            log.push(action)
            this.action(pool, this.heap.selected, action)
            action = BattleAI.action(this, char);
        }

        return log;
    }

    async action(pool:any, unit_index: number, action: Action) {
        let unit = this.heap.get_unit(unit_index)
        var character:CharacterGenericPart = this.world.get_char_from_id(unit.char_id);


        //no action
        if (action.action == null) {
            return {action: 'pff', who: unit_index};
        }


        //move toward enemy
        if (action.action == 'move') {
            let tmp = geom.minus(action.target, unit.position)
            if (geom.norm(tmp) > unit.action_points_left) {
                tmp = geom.intify(geom.mult(geom.normalize(tmp), unit.action_points_left))
            }
            unit.position.x = action.target.x + unit.position.x;
            unit.position.y = action.target.y + unit.position.y;
            let points_spent = Math.floor(geom.norm(tmp))
            unit.action_points_left -= points_spent
            return {action: 'move', who: unit_index, target: action.target, actor_name: character.name}
        }

        
        if (action.action == 'attack') {
            if (action.target != null) {
                let unit2 = this.heap.get_unit(action.target);
                let char:CharacterGenericPart = this.world.get_char_from_id(unit.char_id)
                if ((geom.dist(unit.position, unit2.position) <= char.get_range()) && unit.action_points_left >= 1) {
                    let target_char = this.world.get_char_from_id(unit2.char_id);
                    let result = character.attack(pool, target_char);
                    unit.action_points_left -= 1
                    return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
                }
            }
            return {action: 'pff'};
        } 


        if (action.action == 'flee') {
            if (unit.action_points_left > 3) {
                unit.action_points_left -= 3
                let dice = Math.random();
                if (dice <= 0.4) {
                    this.draw = true;
                    return {action: 'flee', who: unit_index};
                } else {
                    return {action: 'pff', who: unit_index};
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
                    let dist = geom.dist(unit.position, unit2.position)
                    if (dist > 1.9) {
                        let v = geom.minus(unit2.position, unit.position);
                        let u = geom.mult(geom.normalize(v), 0.9);
                        v = geom.minus(v, u)
                        unit.position.x = v.x
                        unit.position.y = v.y
                    }
                    result.new_pos = {x: unit.position.x, y: unit.position.y};
                }
                unit.action_points_left -= 3
                return {action: spell_tag, who: unit_index, result: result, actor_name: character.name};
            }
        }

        if (action.action == 'end_turn') {
            this.waiting_for_input = false
            unit.end_turn()
        }
        this.changed = true
    }

    get_data() {
        let data:any = {};
        for (var i = 0; i < this.heap.data.length; i++) {
            let unit = this.heap.data[i];
            var character:CharacterGenericPart = this.world.get_char_from_id(unit.char_id)
            if (character != undefined) {
                data[i] = {}
                data[i].id = unit.char_id;
                data[i].position = {x: unit.position.x, y: unit.position.y};
                data[i].tag = character.get_model();
                data[i].is_player = character.is_player();
                data[i].range = character.get_range();
                data[i].hp = character.get_hp();
            }
        }
        return data
    }

    add_fighter(agent:CharacterGenericPart, team:number, position:{x:number, y: number}) {
        console.log('add fighter')
        
        if (position == undefined) {
            if (team == 1) {
                position = {x: 0, y: 10}
            } else {
                position = {x: 0, y: 0}
            }
        }

        let unit = new UnitData(agent, position, team);

        this.heap.add_unit(unit)

        agent.set_flag('in_battle', true)
        agent.set_battle_id(this.heap.data.length - 1)

        this.changed = true;
    }

    async transfer(target:{stash: Stash}, tag:tag, x:number) {
        this.stash.transfer(target.stash, tag, x);
    }

    get_team_status(team: number) {
        let tmp = []
        for (let i in this.heap.data) {
            let unit = this.heap.data[i]
            if (unit.team == team) {
                let char = this.world.get_char_from_id(unit.char_id)
                if (char != undefined) {
                    tmp.push({name: char.name, hp: char.hp, next_turn: unit.next_turn_after})
                }
            }
        }
        return tmp
    }

    is_over() {
        var team_lost: boolean[] = [];
        for (let team = 0; team < 10; team++) {
            team_lost[team] = true
        }
        for (var i = 0; i < this.heap.data.length; i++) {
            let unit = this.heap.data[i]
            var char = this.world.get_char_from_id(unit.char_id);
            if ((char == undefined) || (char.hp == 0)) {
                if (!unit.dead) {
                    unit.dead = true;
                }
            } else {
                team_lost[unit.team] = false
            }
        }

        if (this.draw == true) {
            return 'draw';
        } else {
            let teams_left = 0
            let team_not_lost = -1
            for (let team = 0; team < 10; team++) {
                if (!team_lost[team]) {
                    teams_left += 1
                    team_not_lost = team
                }
            }
            if (teams_left > 1) {
                return -1
            } else if (teams_left == 1) {
                return team_not_lost
            }
        }
        return -1;
    }

    clean_up_battle() {
        for (let i = 0; i < this.heap.get_units_amount(); i++) {
            let unit = this.heap.get_unit(i);
            let char:CharacterGenericPart = this.world.get_char_from_id(unit.char_id);
            if (char != undefined) {
                char.set_flag('in_battle', false);
                char.set_battle_id(-1)
            }
        }
    }
    
    async reward_team(pool: any, team: number) {
        let units_amount = this.heap.get_units_amount()

        var n = 0;
        for (let i = 0; i < units_amount; i++){
            let unit = this.heap.get_unit(i);
            if (unit.team == team) {
                n += 1
            }
        }


        // first added unit of team who is alive is a leader
        var i = 0;
        let unit = this.heap.get_unit(i)
        while ((unit.team != team) && (!unit.dead) && (i < units_amount)) {
            i += 1;
            unit = this.heap.get_unit(i)
        }
        if ((i == units_amount) && (unit.team != team)) {
            return -1
        }
        var leader = this.world.get_char_from_id(unit.char_id);


        // team leader gets all loot (should rework one day)
        for (let i = 0; i < units_amount; i ++) {
            let unit = this.heap.get_unit(i);
            let character:CharacterGenericPart = this.world.get_char_from_id(unit.char_id);
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

    async process_input(pool: any, input: Action) {
        if (!this.waiting_for_input) {
            return -1
        }
        await this.action(pool, this.heap.selected, input)
    }

    units_amount() {
        return this.heap.get_units_amount()
    }
}
