import { affix, equip_slot, ItemData } from "../../../../shared/inventory"
import { weapon_tag } from "../types"
import { Damage } from "../damage_types"
import { ITEM_MATERIAL } from "./ITEM_MATERIAL"

export class Item {
    durability: number
    affixes: affix[]
    slot: equip_slot
    material: ITEM_MATERIAL
    weapon_tag: weapon_tag
    range: number
    model_tag: string
    resists: Damage
    damage: Damage

    constructor(durability: number, affixes: affix[], slot: equip_slot, range: number, material:ITEM_MATERIAL, weapon_tag:weapon_tag, model_tag: string, resists: Damage, damage: Damage) {
        this.durability = durability
        this.affixes = affixes
        this.slot = slot
        this.material = material
        this.weapon_tag = weapon_tag
        this.model_tag = model_tag
        this.range = range
        this.resists = resists
        this.damage = damage
    }

    tag():string {
        return this.model_tag
    }

    json():ItemJson {
        return {
            durability: this.durability,
            affixes: this.affixes,
            slot: this.slot,
            material: this.material,
            weapon_tag: this.weapon_tag,
            model_tag: this.model_tag,
            range: this.range,
            resists: this.resists,
            damage: this.damage
        }
    }

    is_weapon() {
        return this.slot == 'weapon'
    }
}

export interface Itemlette {
    slot: equip_slot
    weapon_tag: weapon_tag
}


export interface ItemJson {
    durability: number
    affixes: affix[]
    slot: equip_slot
    material: ITEM_MATERIAL
    weapon_tag: weapon_tag
    model_tag: string
    resists: Damage
    damage: Damage

    range: number
}

