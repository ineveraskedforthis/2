import { armour_slot, EquipSocket, equip_slot } from "../../../../shared/inventory";
import { armour_slots, damage_type, tagModel, tagRACE } from "../types";
// import { update_character } from "../base_game_classes/affix";
// import { Character } from "../character/character";
import { Item, ItemJson } from "../items/item";
import { ItemSystem } from "../items/system";
import { DmgOps } from "../damage_types";
import { Damage } from "../Damage";
import { Inventory, InventoryJson, InventoryStrings } from "./inventory";
import { AttackObj } from "../attack/class";
import { inventory_from_string, inventory_to_string, item_from_string, item_to_string } from "../strings_management";

interface EquipJson {
    weapon?: ItemJson;
    secondary?: ItemJson;
    armour: {[_ in string]?: ItemJson};
    backpack: InventoryJson;
}

interface EquipStrings {
    weapon?: string;
    secondary?: string;
    armour: {[_ in string]?: string};
    backpack: string;
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
            backpack: this.backpack.get_json()
        }
        for (let tag of armour_slots) {
            result.armour[tag] = this.armour[tag]?.json()
        }

        return result
    }

    load_json(json:EquipData){
        if (json.weapon != undefined) {
                this.weapon                 = ItemSystem.create(json.weapon)
        }
        if (json.secondary != undefined) {
                this.secondary              = ItemSystem.create(json.secondary)
        }
        for (let tag of armour_slots) {
            const tmp = json.armour[tag]
            if (tmp != undefined) {
                this.armour[tag] = ItemSystem.create(tmp)
            }            
        }

        this.backpack.load_from_json(json.backpack)
    }

    // to_string() {
    //     let result:EquipStrings = {
    //         weapon: item_to_string(this.weapon),
    //         secondary: item_to_string(this.secondary),
    //         armour: {},
    //         backpack: inventory_to_string(this.backpack)
    //     }
    //     for (let tag of armour_slots) {
    //         result.armour[tag] = item_to_string(this.armour[tag])
    //     }

    //     return JSON.stringify(result)
    // }

    // from_string(s: string) {
    //     const json:EquipStrings = JSON.parse(s)
    //     if (json.weapon != undefined) {
    //             this.weapon                 = item_from_string(json.weapon)
    //     }
    //     if (json.secondary != undefined) {
    //             this.secondary              = item_from_string(json.secondary)
    //     }
    //     for (let tag of armour_slots) {
    //         const tmp = json.armour[tag] 
    //         if (tmp != undefined) {
    //             this.armour[tag]            = item_from_string(tmp)
    //         }            
    //     }

    //     inventory_from_string(this.backpack, json.backpack)
    // }
}


export class Equip {
    data: EquipData;
    // changed: boolean;

    constructor() {
        this.data = new EquipData()
        // this.changed = false
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
        return ItemSystem.range(right_hand);
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

    // update(agent:Character) {
    //     for (let i of armour_slots) {
    //         this.item_update(this.data.armour[i], agent);
    //     }
    // }

    // item_update(item:Item|undefined, agent:Character) {
    //     if (item == undefined) {return}
    //     for (let i = 0; i < item.affixes.length; i++) {
    //         let affix = item.affixes[i];
    //         let f = update_character[affix.tag];
    //         if (f != undefined) {
    //             f(agent);
    //         }
    //     }
    // }

    equip_from_backpack(index: number, model: tagModel) {
        let backpack = this.data.backpack;
        let item = backpack.items[index]
        if (item == undefined) return

        if (ItemSystem.slot(item) == 'weapon') {this.equip_weapon(index, model)}
        else {this.equip_armour(index, model)}
    }

    equip_armour(index:number, model: tagModel) {
        if (model != 'human') {
            return
        }

        let backpack = this.data.backpack;
        let item = backpack.items[index]
        if (item != undefined) {
            let slot = ItemSystem.slot(item);
            let tmp = this.data.armour[slot as armour_slot];
            this.data.armour[slot as armour_slot] = item
            backpack.items[index] = tmp
            // this.changed = true
        }
    }

    equip_weapon(index:number|undefined, model: tagModel) {
        let backpack = this.data.backpack;
        if (index == undefined) return
        let item = backpack.items[index]
        if (item == undefined) return
        if (ItemSystem.slot(item) != 'weapon') {return}
        let tmp = this.data.weapon;

        if (model == 'graci') {
            if (item.model_tag == 'spear') {

            } else if (item.model_tag == 'bone_spear') {

            } else {
                return
            }
        } else if (model == 'human') {

        } else if (model == 'human_strong') {
            if (item.model_tag == 'spear') {

            } else if (item.model_tag == 'bone_spear') {

            } else {
                return
            }
        } else {
            return
        }

        
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
        // this.changed = true
    }

    switch_weapon() {
        let tmp = this.data.weapon
        this.data.weapon = this.data.secondary
        this.data.secondary = tmp
    }


    unequip_secondary() {
        this.data.backpack.add(this.data.secondary)
        this.data.secondary = undefined
        // this.changed = true
    }

    unequip(tag:equip_slot) {
        // this.changed = true

        if (tag == 'weapon') {
            this.data.backpack.add(this.data.weapon)
            this.data.weapon = undefined
            return
        }
        
        let item = this.data.armour[tag]
        this.data.backpack.add(item);
        this.data.armour[tag] = undefined
    }

    destroy_slot(tag: equip_slot) {
        if (tag == 'weapon') {
            this.data.weapon = undefined
            return
        }
        
        this.data.armour[tag] = undefined
        return
    }

    slot_to_item(tag: equip_slot) {
        if (tag == 'weapon') {
            return this.data.weapon
        }
        return this.data.armour[tag]
    }

    get_data():EquipSocket {
        return {
            equip: {
                weapon: ItemSystem.item_data(this.data.weapon),
                secondary: ItemSystem.item_data(this.data.secondary),
                body: ItemSystem.item_data(this.data.armour['body']),
                legs: ItemSystem.item_data(this.data.armour['legs']),
                foot: ItemSystem.item_data(this.data.armour['foot']),
                head: ItemSystem.item_data(this.data.armour['head']),
                arms: ItemSystem.item_data(this.data.armour['arms']),
            },            
            backpack: this.data.backpack.get_data()
        }
    }

    resists() {
        let resists = new Damage;
        for (let i of armour_slots) {
            DmgOps.add_ip(resists, ItemSystem.resists(this.data.armour[i]))
        }
        return resists
    }

    modify_attack(attack: AttackObj) {
        for (let i of armour_slots) {
            ItemSystem.modify_attack(this.data.armour[i], attack)
        }
        ItemSystem.modify_attack(this.data.weapon, attack)
    }

    get_json() {
        return this.data.get_json();
    }

    load_from_json(json:Equip) {
        this.data.load_json(json.data);
    }

    // to_string() {
    //     return this.data.to_string()
    // }

    // from_string(s: string) {
    //     this.data.from_string(s)
    // }
}