import { EquipSocket, ItemData, equip_slot, slots } from "../../../../shared/inventory";
import { tagModel } from "../types";
import { damage_type } from "@custom_types/common";
import { Item } from "../items/item";
import { ItemSystem } from "../items/system";
import { DmgOps } from "../damage_types";
import { Damage } from "../Damage";
import { Inventory } from "./inventory";
import { AttackObj } from "../attack/class";

class EquipData {
    slots: Partial<Record<equip_slot, Item>> //{[_ in equip_slot]?: Item}
    backpack: Inventory

    constructor(backpack_limit: number) {
        this.slots = {}
        this.backpack = new Inventory(backpack_limit)
    }

    load_json(json:EquipData){
        for (let slot of slots) {
            const item_data = json.slots[slot]
            if (item_data == undefined) continue
            const item = ItemSystem.create(item_data.model_tag, item_data.affixes, item_data.durability)
            item.price = item_data.price
            this.slots[slot] = item
        }
        this.backpack.load_from_json(json.backpack)
    }
}


export class Equip {
    data: EquipData;

    constructor() {
        this.data = new EquipData(10)
    }

    transfer_all(target: {equip: Equip}) {
        for (let tag of slots) {
            this.unequip(tag);
        }
        this.data.backpack.transfer_all(target.equip.data.backpack)
    }


    get_weapon_range(): undefined|number {
        let right_hand = this.data.slots.weapon;
        if (right_hand == undefined) {return undefined}
        return ItemSystem.range(right_hand);
    }

    get_melee_damage(type: damage_type): Damage|undefined {
        // let damage = new Damage()
        const item = this.data.slots.weapon;
        if (item == undefined) return undefined
        return ItemSystem.melee_damage(item, type)
    }

    get_ranged_damage(): Damage|undefined {
        let weapon = this.data.slots.weapon
        if (weapon == undefined) return undefined
        return ItemSystem.ranged_damage(weapon)
    }

    get_magic_power() {
        let result = 0;
        result += ItemSystem.power(this.data.slots.weapon)
        result += ItemSystem.power(this.data.slots.secondary)

        for (let tag of slots) {
            result += ItemSystem.power(this.data.slots[tag])
        }
        return result
    }

    get_phys_power_modifier() {
        return 1
    }

    get_magic_power_modifier() {
        return 1
    }

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
            let tmp = this.data.slots[slot];
            this.data.slots[slot] = item
            backpack.remove(index)
            if (tmp != undefined) backpack.add(tmp)
        }
    }

    equip_weapon(index:number|undefined, model: tagModel) {
        let backpack = this.data.backpack;
        if (index == undefined) return
        let item = backpack.items[index]
        if (item == undefined) return
        if (ItemSystem.slot(item) != 'weapon') {return}
        let tmp = this.data.slots.weapon;

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
            this.data.slots.weapon = backpack.items[index];
            backpack.remove(index)
        } else {
            let tmp2 = this.data.slots.secondary
            if (tmp2 == undefined) {
                this.data.slots.secondary = backpack.items[index];
                backpack.remove(index)
            } else {
                this.data.slots.weapon = backpack.items[index];
                backpack.remove(index)
                backpack.add(tmp)
            }
        }
    }

    switch_weapon() {
        let tmp = this.data.slots.weapon
        this.data.slots.weapon = this.data.slots.secondary
        this.data.slots.secondary = tmp
    }

    unequip(tag:equip_slot) {
        let item = this.data.slots[tag]
        if (item == undefined) return
        let response = this.data.backpack.add(item);
        if (response !== false) this.data.slots[tag] = undefined
    }

    destroy_slot(tag: equip_slot) {
        this.data.slots[tag] = undefined
        return
    }

    slot_to_item(tag: equip_slot) {
        if (tag == 'weapon') {
            return this.data.slots.weapon
        }
        return this.data.slots[tag]
    }

    _equip_to_data(data: Partial<Record<equip_slot, Item>>): Partial<Record<equip_slot, ItemData>> {
        const result: Partial<Record<equip_slot, ItemData>> = {}

        for (const key of Object.keys(data)) {
            result[key as equip_slot] = ItemSystem.item_data(data[key as equip_slot])
        }

        return result
    }

    get_data():EquipSocket {
        let response = {
            equip: this._equip_to_data(this.data.slots),
            backpack: this.data.backpack.get_data()
        }
        return response
    }

    resists() {
        let resists = new Damage;
        for (let i of slots) {
            DmgOps.add_ip(resists, ItemSystem.resists(this.data.slots[i]))
        }
        return resists
    }

    modify_attack(attack: AttackObj) {
        for (let i of slots) {
            ItemSystem.modify_attack(this.data.slots[i], attack)
        }
    }

    load_from_json(json:Equip) {
        this.data.load_json(json.data);
    }
}