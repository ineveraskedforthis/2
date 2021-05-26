import { damage_type, Status, weapon_type } from "../../static_data/type_script_types"
import { DamageByTypeObject } from "./damage_types";

export class AttackResult {
    flags: {
        crit: boolean,
        evade: boolean,
        miss: boolean,
        poison: boolean,
        blocked: boolean,
        close_distance: boolean,
        killing_strike: boolean
    }
    defender_status_change:Status;
    attacker_status_change:Status;
    weapon_type:weapon_type;
    total_damage:number;
    damage: DamageByTypeObject;
    chance_to_hit: number;
    new_pos: {x: number, y:number}|undefined;


    constructor() {
        this.flags = {
            crit: false,
            evade: false,
            miss: false,
            poison: false,
            blocked: false,
            close_distance: false,
            killing_strike: false
        }

        this.defender_status_change = {
            hp: 0,
            rage: 0,
            stress: 0,
            blood: 0
        }

        this.attacker_status_change = {
            hp: 0,
            rage: 0,
            stress: 0,
            blood: 0
        }

        this.new_pos = undefined

        this.damage = new DamageByTypeObject();
        this.weapon_type = 'noweapon'
        this.chance_to_hit = 0;
        this.total_damage = 0;
    }
}