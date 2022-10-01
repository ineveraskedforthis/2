
import { Stash } from "../inventories/stash";

var common = require("./common.js");
var {constants} = require("./static_data/constants.js");

import {geom} from '../../geom'

import {BattleAI} from './battle_ai'
import {Character} from '../character/character'
import { ARROW_BONE, material_index, ZAZ } from "../../manager_classes/materials_manager";
import { UnitsHeap } from "./heap";
import { battle_id, ms } from "../../../shared/battle_data";
import { Savings } from "../inventories/savings";

export interface MoveAction {action: "move", target: {x: number, y:number}}
export interface AttackAction {action: "attack", target: number}
export interface HeavyAttackAction {action: "heavy_attack", target: number}
export interface FastAttackAction {action: "fast_attack", target: number}
interface ChargeAction {action: "charge", target: number}
interface DodgeAction {action: "dodge", who: number}
interface ShootAction {action: "shoot", target: number}
interface PushBack {action: "push_back", target: number}
interface FleeAction {action: "flee", who: number}
interface MagicBoltAction {action: "magic_bolt", target: number}
interface SpellTargetAction {action: "spell_target", target: number, spell_tag: "charge"|"bolt"}
interface EndTurn {action: 'end_turn'}
interface NullAction {action: null}
interface SwitchWeaponAction {action: "switch_weapon", who: number}
export type Action = MoveAction|AttackAction|FleeAction|SpellTargetAction|EndTurn|NullAction|FastAttackAction|DodgeAction|PushBack|MagicBoltAction|SwitchWeaponAction|ShootAction
export type ActionTag = 'move'|'attack'|'flee'|'spell_target'|'end_turn'|null|'heavy_attack'|'dodge'|'push_back'|'magic_bolt'|'switch_weapon'|'shoot'

type ActionLog = Action[]


export class Battle {
    heap: UnitsHeap;
    id: battle_id;
    waiting_for_input: boolean;
    date_of_last_turn: ms|'%';
    ended: boolean
    last_event_index: number

    constructor(id: battle_id, heap: UnitsHeap) {
        this.heap = heap
        this.id = id
        this.date_of_last_turn = '%'
        this.waiting_for_input = false
        this.ended = false
        this.last_event_index = 0
    }
}



export class BattleReworked2 {
    heap: UnitsHeap;
    id: number;
    savings: any;
    stash: Stash;
    changed: boolean;
    draw: boolean;
    waiting_for_input:boolean;
    ended: boolean;
    last_turn: number;


    constructor() {
        this.heap = new UnitsHeap();
        this.world = world;
        this.id = -1
        this.savings = new Savings()
        this.stash = new Stash()
        this.changed = false
        this.waiting_for_input = false
        this.draw = false
        this.ended = false
        this.last_turn = Date.now() //milliseconds
    }

     init() {
        this.id =  this.load_to_db();
        this.last_turn = Date.now()
        return this.id;
    }

     load_to_db() {
        // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            // @ts-ignore: Unreachable code error
            global.last_id += 1
            // @ts-ignore: Unreachable code error
            return global.last_id
        }
        let res =   common.send_query(constants.new_battle_query, [this.heap.get_json(), this.savings.get_json(), this.stash.get_json(), this.waiting_for_input]);
        return res.rows[0].id
    }

    load_from_json(data: any) {
        this.id = data.id
        this.heap.load_from_json(data.heap)
        this.savings.load_from_json(data.savings)
        this.stash.load_from_json(data.stash)
        this.waiting_for_input = data.waiting_for_input
    }

     save_to_db() {
         common.send_query(constants.update_battle_query, [this.id, this.heap.get_json(), this.savings.get_json(), this.stash.get_json(), this.waiting_for_input])
        this.changed = false
        this.heap.changed = false
    }

     delete_from_db() {
         common.send_query(constants.delete_battle_query, [this.id]);
    }

    // networking
    
    send_data_start() {
        this.world.socket_manager.send_battle_data_start(this)
        if (this.waiting_for_input) {
            this.send_action({action: 'new_turn', target: this.heap.selected})
        }
    }

    send_update() {
        this.world.socket_manager.send_battle_update(this)
        if (this.waiting_for_input) {
            this.send_action({action: 'new_turn', target: this.heap.selected})
        }
    }

    send_current_turn() {
        this.send_action({action: 'new_turn', target: this.heap.selected})
    }

    send_action(a: any) {
        this.world.socket_manager.send_battle_action(this, a)
    }

    send_stop(){
        this.world.socket_manager.send_stop_battle(this)
    }




export function flee_chance(character: Character) {
    return 0.4
}