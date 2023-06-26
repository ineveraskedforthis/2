import { affix, equip_slot, ItemData } from "../../../../shared/inventory"
import { weapon_tag } from "../types"
import { Damage } from "../Damage"
import { ITEM_MATERIAL } from "./ITEM_MATERIAL"
import { BaseRange, ModelToEquipSlot } from "./base_values"
import { item_model_tag } from "./model_tags"

export class Item {
    durability: number
    affixes: affix[]
    model_tag: item_model_tag

    constructor(durability: number, affixes: affix[], model_tag: item_model_tag) {
        this.durability = durability
        this.affixes = affixes
        this.model_tag = model_tag
    }

    tag():string {
        return this.model_tag
    }

    json():ItemJson {
        return {
            durability: this.durability,
            affixes: this.affixes,
            // slot: this.slot,
            // material: this.material,
            // weapon_tag: this.weapon_tag,
            model_tag: this.model_tag,

            // range: BaseRange[this.model_tag],
            // resists: this.resists,
            // damage: this.damage
        }
    }

    is_weapon() {
        return ModelToEquipSlot[this.model_tag] == 'weapon'
    }
}



export interface ItemJson {
    durability: number
    affixes: affix[]
    // slot: equip_slot
    // material: ITEM_MATERIAL
    // weapon_tag: weapon_tag
    model_tag: item_model_tag

    // resists: Damage
    // damage: Damage
    // range: number
}

