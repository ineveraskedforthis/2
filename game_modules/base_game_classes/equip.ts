var {damage_affixes_effects, protection_affixes_effects, get_power, slots, update_character} = require("../static_data/item_tags.js");

import { idText, isWhileStatement } from "typescript";
import {Armour, ARMOUR_TYPE, base_damage, base_resist, Weapon} from "../static_data/item_tags"
import { CharacterGenericPart } from "./character_generic_part";
import { Inventory } from "./inventory";
import { AttackResult } from "./misc/attack_result";
import { DamageByTypeObject } from "./misc/damage_types";


class EquipData {
    weapon: Weapon|undefined;
    armour: Map<ARMOUR_TYPE, Armour|undefined>;
    backpack: Inventory
    constructor() {
        this.weapon = undefined
        this.armour = new Map<ARMOUR_TYPE, Armour|undefined>();
        this.backpack = new Inventory()
    }
    get_json(){
        let result:any = {}
        result.weapon = this.weapon?.get_json()
        result.armour = {}
        for (let tag of this.armour.keys()) {
            result.armour[tag] = this.armour?.get(tag)
        }
        result.backpack = this.backpack.get_json()
    }

    load_json(json:any){
        this.weapon = new Weapon(json.weapon)
        for (let tag of this.armour.keys()) {
            this.armour.set(tag, new Armour(json.armour[tag]))
        }
        this.backpack.load_from_json(json.backpack)
    }
}


export class Equip {
    data: EquipData;
    changed: boolean;

    constructor() {
        this.data = new EquipData()
        this.changed = false
    }

    transfer_all(target: CharacterGenericPart) {
        this.unequip_weapon()
        for (let tag of this.data.armour.keys()) {
            this.unequip_armour(tag);
        }
        this.data.backpack.transfer_all(target)
    }

    get_weapon_range(range:number) {
        let right_hand = this.data.weapon;
        if (right_hand == undefined) {return range}
        return range + right_hand.get_length();
    }

    get_weapon_damage(result:AttackResult) {
        let right_hand = this.data.weapon;
        if (right_hand != undefined){
            result = base_damage(result, right_hand)
            for (let i = 0; i < right_hand.affixes.length; i++) {
                let affix = right_hand.affixes[i];
                result = damage_affixes_effects[affix.tag](result, affix.tier);
            }
        }
        return result
    }

    get_item_power(item:Weapon|Armour|undefined) {
        let result = 0;
        if (item == undefined) {
            return result
        }
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = get_power[affix.tag];
            if (f != undefined) {
                result = f(result, affix.tier);
            }
        }
        return result;
    }

    get_item_resists(item:Armour|undefined, resists:DamageByTypeObject) {
        if (item == undefined) {return resists}
        resists = base_resist(resists, item)
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = protection_affixes_effects[affix.tag];
            if (f != undefined) {
                resists = f(resists, affix.tier);
            }
        }
        return resists;
    }

    get_magic_power() {
        let result = 0;
        result += this.get_item_power(this.data.weapon)

        for (let tag of this.data.armour.keys()) {
            result += this.get_item_power(this.data.armour.get(tag))
        }
        return result
    }

    get_phys_power_modifier() {
        return 1
    }

    
    get_magic_power_modifier() {
        return 1
    }

    update(agent:CharacterGenericPart) {
        for (let i of this.data.armour.keys()) {
            this.get_item_update(this.data.armour.get(i), agent);
        }
    }

    get_item_update(item:Weapon|Armour|undefined, agent:CharacterGenericPart) {
        if (item == undefined) {return}
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = update_character[affix.tag];
            if (f != undefined) {
                f(agent, affix.tier);
            }
        }
    }

    equip_armour(index:number) {
        let backpack = this.data.backpack;
        let item = backpack.armours[index]
        if (item != undefined) {
            let slot = item.type;
            let tmp = this.data.armour.get(slot);
            this.data.armour.set(slot, item)
            backpack.armours[index] = tmp
        }
    }

    equip_weapon(index:number) {
        let backpack = this.data.backpack;
        let item = backpack.weapons[index]
        if (item != undefined) {
            let tmp = this.data.weapon;
            this.data.weapon = tmp;
            backpack.weapons[index] = tmp
        }
    }

    unequip_weapon() {
        if (this.data.weapon == undefined) return
        this.add_weapon(this.data.weapon)
        this.data.weapon = undefined
    }

    unequip_armour(tag:ARMOUR_TYPE) {
        if (!(tag in ARMOUR_TYPE)) {return}
        
        let item = this.data.armour.get(tag);
        if (item == undefined) {
            return
        } else {
            this.add_armour(item);
            this.data.armour.set(tag, undefined)
        }
    }

    add_weapon(item:Weapon) {
        if (item != undefined) {
            this.data.backpack.weapons.push(item);
        }
    }

    add_armour(item:Armour) {
        if (item != undefined) {
            this.data.backpack.armours.push(item);
        }
    }

    get_resists() {
        let resists = new DamageByTypeObject;
        for (let i of this.data.armour.keys()) {
            resists = this.get_item_resists(this.data.armour.get(i), resists)
        }
        return resists
    }

    get_json() {
        return this.data.get_json();
    }

    load_from_json(json:any) {
        this.data.load_json(json);
    }    
}