import { armour_slot, armour_slots, damage_type, equip_slot } from "../../types";
import { update_character } from "../affix";
import { Character } from "../character/character";
import { Item, ItemJson } from "../items/item";
import { ItemSystem } from "../items/system";
import { Damage } from "../misc/damage_types";
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
        this.unequip('weapon')
        this.unequip_secondary()
        for (let tag of armour_slots) {
            this.unequip(tag);
        }
        this.data.backpack.transfer_all(target.equip.data.backpack)
    }


    get_weapon_range(): undefined|number {
        let right_hand = this.data.weapon;
        if (right_hand == undefined) {return undefined}
        return right_hand.range;
    }

    get_melee_damage(type: damage_type): Damage|undefined {
        // let damage = new Damage()
        const item = this.data.weapon;
        if (item == undefined) return undefined
        return ItemSystem.melee_damage(item, type)
    }

    get_ranged_damage(): Damage|undefined {
        let weapon = this.data.weapon
        if (weapon == undefined) return undefined
        return ItemSystem.ranged_damage(weapon)
    }

    get_magic_power() {
        let result = 0;
        result += ItemSystem.power(this.data.weapon)
        result += ItemSystem.power(this.data.secondary)

        for (let tag of armour_slots) {
            result += ItemSystem.power(this.data.armour[tag])
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
        for (let i of armour_slots) {
            this.item_update(this.data.armour[i], agent);
        }
    }

    item_update(item:Item|undefined, agent:Character) {
        if (item == undefined) {return}
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = update_character[affix.tag];
            if (f != undefined) {
                f(agent);
            }
        }
    }

    equip_armour(index:number) {
        let backpack = this.data.backpack;
        let item = backpack.items[index]
        if (item != undefined) {
            let slot = item.slot;
            if (slot in armour_slots) {
                let tmp = this.data.armour[slot as armour_slot];
                this.data.armour[slot as armour_slot] = item
                backpack.items[index] = tmp    
                this.changed = true
            } 
        }
    }

    equip_weapon(index:number) {
        let backpack = this.data.backpack;
        let item = backpack.items[index]
        if (item != undefined) {
            let tmp = this.data.weapon;
            
            if (tmp == undefined) {
                this.data.weapon = backpack.items[index];
                backpack.items[index] = undefined
            } else {
                let tmp2 = this.data.secondary
                if (tmp2 == undefined) {
                    this.data.secondary = backpack.items[index];
                    backpack.items[index] = undefined
                } else {
                    this.data.weapon = backpack.items[index];
                    backpack.items[index] = tmp
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


    unequip_secondary() {
        this.data.backpack.add(this.data.secondary)
        this.data.secondary = undefined
        this.changed = true
    }

    unequip(tag:equip_slot) {
        this.changed = true

        if (tag == 'weapon') {
            this.data.backpack.add(this.data.weapon)
            this.data.weapon = undefined
            return
        }
        
        let item = this.data.armour[tag]
        this.data.backpack.add(item);
        this.data.armour[tag] = undefined
    }

    get_data() {
        return {
            right_hand: this.data.weapon?.data(),
            secondary: this.data.secondary?.data(),
            body: this.data.armour['body']?.data(),
            legs: this.data.armour['legs']?.data(),
            foot: this.data.armour['foot']?.data(),
            head: this.data.armour['head']?.data(),
            arms: this.data.armour['arms']?.data(),
            backpack: this.data.backpack.get_data()
        }
    }

    resists() {
        let resists = new Damage;
        for (let i of armour_slots) {
            resists.add(ItemSystem.resists(this.data.armour[i]))
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