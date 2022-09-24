import { affix } from "../affix"
import { equip_slot, ITEM_MATERIAL, weapon_tag } from "./item_tags"

export class Item {
    durability: number
    affixes: affix[]
    slot: equip_slot
    material: ITEM_MATERIAL
    weapon_tag: weapon_tag
    range: number
    model_tag: string


    constructor(durability: number, affixes: affix[], slot: equip_slot, range: number, material:ITEM_MATERIAL, weapon_tag:weapon_tag, model_tag: string) {
        this.durability = durability
        this.affixes = affixes
        this.slot = slot
        this.material = material
        this.weapon_tag = weapon_tag
        this.model_tag = model_tag
        this.range = range
    }
}

export interface Itemlette {
    slot: equip_slot
    weapon_tag: weapon_tag
}


export interface ItemDescription {
    durability: number
    affixes: affix[]
    slot: equip_slot
    material: ITEM_MATERIAL
    weapon_tag: weapon_tag
    model_tag: string
}
