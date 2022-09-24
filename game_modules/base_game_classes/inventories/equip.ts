import { ARROW_BONE } from "../../manager_classes/materials_manager";
import { WEAPON_TYPE } from "../../static_data/type_script_types";
import { armour_slot, armour_slots } from "../../types";
import { damage_affixes_effects, get_power, protection_affixes_effects, update_character } from "../affix";
import { Character } from "../character/character";
import { Item, ItemJson } from "../items/item";
import { ItemSystem } from "../items/system";
import { AttackResult } from "../misc/attack_result";
import { Damage, damage_type } from "../misc/damage_types";
import { Inventory } from "./inventory";

interface EquipJson {
    weapon?: ItemJson;
    secondary?: ItemJson;
    armour: {[_ in string]?: ItemJson};
    backpack: {[_ in number]?: ItemJson};
}

class EquipData {
    weapon?: Item;
    secondary?: Item;
    armour: {[_ in armour_slot]?: Item};
    backpack: Inventory

    constructor() {
        // explicitly setting to undefined
        this.weapon = undefined
        this.secondary = undefined
        this.armour = {}
        this.backpack = new Inventory()
    }

    get_json(): EquipJson{
        let result:EquipJson = {
            weapon: this.weapon?.json(),
            secondary: this.secondary?.json(),
            armour: {},
            backpack: {}
        }
        for (let tag of armour_slots) {
            result.armour[tag] = this.armour[tag]?.json()
        }
        result.backpack = this.backpack.get_json()
        return result
    }

    load_json(json:EquipJson){
        if (json.weapon != undefined) {
                this.weapon                 = ItemSystem.create(json.weapon)
        }
        if (json.secondary != undefined) {
                this.secondary              = ItemSystem.create(json.secondary)
        }
        for (let tag of armour_slots) {
            const tmp = json.armour[tag] 
            if (tmp != undefined) {
                this.armour[tag]            = ItemSystem.create(tmp)
            }            
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

    transfer_all(target: {equip: Equip}) {
        this.unequip_weapon()
        this.unequip_secondary()
        for (let tag of armour_slots) {
            this.unequip_armour(tag);
        }
        this.data.backpack.transfer_all(target)
    }


    get_weapon_range(): undefined|number {
        let right_hand = this.data.weapon;
        if (right_hand == undefined) {return undefined}
        return right_hand.range;
    }

    get_melee_damage(type: damage_type): Damage|undefined {
        const damage = new Damage()
        const item = this.data.weapon;

        if (item == undefined) return undefined

        // calculating base damage of item
        switch(type) {
            case 'blunt': {damage.blunt = ItemSystem.weight(item) * item.damage.blunt; break}
            case 'pierce': {damage.pierce = ItemSystem.weight(item) * item.damage.pierce; break}
            case 'slice': {damage.slice = ItemSystem.weight(item) * item.damage.slice; break}
        }
        damage.fire = item.damage.fire

        // summing up all affixes
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            damage = damage_affixes_effects[affix.tag](damage);
        }

        return damage
    }

    get_ranged_damage() {
        const damage = new Damage()
        if (this.data.weapon?.weapon_tag == 'ranged') {
            damage.pierce = 10
            return damage
        }

        

        if (this.data.weapon != undefined) {
            
            result = ranged_base_damage(result, ARROW_BONE)
            result.weapon_type = 'ranged'
            return result
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

    get_item_resists(item:Item|undefined, resists:DamageByTypeObject) {
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

    update(agent:Character) {
        for (let i of this.data.armour.keys()) {
            this.get_item_update(this.data.armour.get(i), agent);
        }
    }

    get_item_update(item:Weapon|Armour|undefined, agent:Character) {
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
        this.changed = true
    }

    equip_weapon(index:number) {
        let backpack = this.data.backpack;
        let item = backpack.weapons[index]
        // console.log(item)
        // console.log(backpack.weapons)
        if (item != undefined) {
            let tmp = this.data.weapon;
            
            if (tmp == undefined) {
                this.data.weapon = backpack.weapons[index];
                backpack.weapons[index] = undefined
            } else {
                let tmp2 = this.data.secondary
                if (tmp2 == undefined) {
                    this.data.secondary = backpack.weapons[index];
                    backpack.weapons[index] = undefined
                } else {
                    this.data.weapon = backpack.weapons[index];
                    backpack.weapons[index] = tmp
                }
            }
        }
        this.changed = true
    }

    switch_weapon() {
        let tmp = this.data.weapon
        this.data.weapon = this.data.secondary
        this.data.secondary = tmp
    }

    unequip_weapon() {
        if (this.data.weapon == undefined) return
        this.add_weapon(this.data.weapon)
        this.data.weapon = undefined
        this.changed = true
    }

    unequip_secondary() {
        if (this.data.secondary == undefined) return
        this.add_weapon(this.data.secondary)
        this.data.secondary = undefined
        this.changed = true
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
        this.changed = true
    }

    add_weapon(item:Weapon) {
        let responce = -1
        if (item != undefined) {
            responce = this.data.backpack.weapons.push(item) - 1;
        }
        this.changed = true
        return responce
    }

    add_armour(item:Armour) {
        if (item != undefined) {
            this.data.backpack.armours.push(item);
        }
        this.changed = true
    }

    // ['right_hand', 'body', 'legs', 'foot', 'head', 'arms']
    // UNFINISHED
    get_data() {
        return {
            right_hand: this.data.weapon?.get_data(),
            secondary: this.data.secondary?.get_data(),
            body: this.data.armour.get(ARMOUR_TYPE.BODY)?.get_data(),
            legs: this.data.armour.get(ARMOUR_TYPE.LEGS)?.get_data(),
            foot: this.data.armour.get(ARMOUR_TYPE.FOOT)?.get_data(),
            head: this.data.armour.get(ARMOUR_TYPE.HEAD)?.get_data(),
            arms: this.data.armour.get(ARMOUR_TYPE.ARMS)?.get_data(),
            backpack: this.data.backpack.get_data()
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