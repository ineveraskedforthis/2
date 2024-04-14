import { EquipSocket, ItemData} from "../../../../shared/inventory";
import { tagModel } from "../types";
import { melee_attack_type } from "@custom_types/common";
import { EquipmentPiece, Weapon } from "../data/entities/item";
import { ItemSystem } from "../systems/items/item_system";
import { DmgOps } from "../damage_types";
import { Damage } from "../Damage";
import { Inventory } from "./inventory";
import { AttackObj } from "../attack/class";
import { EQUIP_SLOT, EquipSlotConfiguration, EquipSlotStorage, MATERIAL } from "@content/content";
import { item_id } from "@custom_types/ids";
import { Data } from "../data/data_objects";
import { AMMO_BOW, is_armour, is_weapon } from "../../content_wrappers/item";

interface EquipDataParsed {
    slots: Partial<Record<string, item_id>> //{[_ in EQUIP_SLOT]?: Item}
    backpack: Inventory
}

class EquipData {
    slots: Partial<Record<EQUIP_SLOT, item_id>> //{[_ in EQUIP_SLOT]?: Item}
    backpack: Inventory
    selected_ammo: AMMO_BOW

    constructor(backpack_limit: number) {
        this.slots = {}
        this.backpack = new Inventory(backpack_limit)
        this.selected_ammo = MATERIAL.ARROW_BONE
    }

    load_json(json:EquipDataParsed){
        for (let slot_id of EquipSlotConfiguration.SLOT) {
            const slot = EquipSlotStorage.get(slot_id);
            this.slots[slot.id] = json.slots[slot.id_string]
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
        for (let slot of EquipSlotConfiguration.SLOT) {
            this.unequip(slot);
        }
        this.data.backpack.transfer_all(target.equip.data.backpack)
    }

    get weapon(): Weapon|undefined {
        return this.data.slots[EQUIP_SLOT.WEAPON] ? Data.Items.from_id(this.data.slots[EQUIP_SLOT.WEAPON]) as Weapon : undefined
    }

    set weapon(weapon: Weapon|undefined) {
        this.data.slots[EQUIP_SLOT.WEAPON] = weapon ? weapon.id : undefined
    }

    get weapon_id(): item_id|undefined {
        return this.data.slots[EQUIP_SLOT.WEAPON]
    }

    set weapon_id(x: item_id|undefined) {
        this.data.slots[EQUIP_SLOT.WEAPON] = x
    }

    get secondary(): Weapon|undefined {
        return this.data.slots[EQUIP_SLOT.SECONDARY] ? Data.Items.from_id(this.data.slots[EQUIP_SLOT.SECONDARY]) as Weapon : undefined
    }

    get_weapon_range(): undefined|number {
        let weapon = this.weapon;
        if (weapon == undefined) return;
        return ItemSystem.range(weapon);
    }

    get_melee_damage(type: melee_attack_type): Damage|undefined {
        let weapon = this.weapon;
        if (weapon == undefined) return;
        return ItemSystem.melee_damage(weapon, type)
    }

    get_ranged_damage(): Damage|undefined {
        let weapon = this.weapon;
        if (weapon == undefined) return;
        return ItemSystem.ranged_damage(weapon, this.data.selected_ammo)
    }

    get_magic_power() {
        let result = 0;
        for (let tag of EquipSlotConfiguration.SLOT) {
            const item_id = this.data.slots[tag]
            if (item_id == undefined) continue;
            result += ItemSystem.power(Data.Items.from_id(item_id))
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
        const item_object = Data.Items.from_id(item)
        if (is_weapon(item_object)) {this.equip_weapon(index, model)}
        else {this.equip_armour(index, model)}
    }

    equip_armour(index:number, model: tagModel) {
        if (model != 'human') {
            return
        }

        let backpack = this.data.backpack;
        let item = backpack.items[index]
        const item_data = Data.Items.from_id(item)

        if (is_weapon(item_data)) return

        if (item != undefined) {
            let slot = item_data.prototype.slot;
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
        const item_data = Data.Items.from_id(item)

        if (is_armour(item_data)) {return}

        let tmp = this.data.slots[EQUIP_SLOT.WEAPON];

        if (tmp == undefined) {
            this.data.slots[EQUIP_SLOT.WEAPON] = backpack.items[index];
            backpack.remove(index)
        } else {
            let tmp2 = this.data.slots[EQUIP_SLOT.SECONDARY]
            if (tmp2 == undefined) {
                this.data.slots[EQUIP_SLOT.SECONDARY] = backpack.items[index];
                backpack.remove(index)
            } else {
                this.data.slots[EQUIP_SLOT.WEAPON] = backpack.items[index];
                backpack.remove(index)
                backpack.add(tmp)
            }
        }
    }

    switch_weapon() {
        let tmp = this.data.slots[EQUIP_SLOT.WEAPON]
        this.data.slots[EQUIP_SLOT.WEAPON] = this.data.slots[EQUIP_SLOT.SECONDARY]
        this.data.slots[EQUIP_SLOT.SECONDARY] = tmp
    }

    unequip(tag:EQUIP_SLOT) {
        let item = this.data.slots[tag]
        if (item == undefined) return
        let response = this.data.backpack.add(item);
        if (response !== false) this.data.slots[tag] = undefined
    }

    destroy_slot(tag: EQUIP_SLOT) {
        this.data.slots[tag] = undefined
        return
    }

    slot_to_item(tag: EQUIP_SLOT): EquipmentPiece|undefined {
        const id = this.data.slots[tag]
        return id ? Data.Items.from_id(id) : undefined
    }

    _equip_to_data(data: Partial<Record<EQUIP_SLOT, item_id>>): Partial<Record<string, ItemData>> {
        const result: Partial<Record<string, ItemData>> = {}

        for (const key of EquipSlotConfiguration.SLOT) {
            const item_id = data[key]
            if (item_id == undefined) continue
            const item_data = Data.Items.from_id(item_id)
            result[item_data.prototype.id_string] = ItemSystem.data(item_data)
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
        for (const key of EquipSlotConfiguration.SLOT) {
            const item_id = this.data.slots[key]
            if (item_id == undefined) continue;
            const item_data = Data.Items.from_id(item_id)
            if (is_weapon(item_data)) continue;
            DmgOps.add_ip(resists, ItemSystem.resists(item_data))
        }
        return resists
    }

    modify_attack(attack: AttackObj) {
        for (const key of EquipSlotConfiguration.SLOT) {
            const item_id = this.data.slots[key]
            if (item_id == undefined) continue;
            const item_data = Data.Items.from_id(item_id)
            ItemSystem.modify_attack(item_data, attack)
        }
    }

    load_from_json(json:Equip) {
        this.data.load_json(json.data);
    }
}