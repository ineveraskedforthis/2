import { affix, equip_slot, ItemData } from "../../../../shared/inventory"
import { weapon_tag } from "../types"
import { Damage } from "../Damage"
import { ITEM_MATERIAL } from "./ITEM_MATERIAL"
import { BaseRange, ModelToEquipSlot } from "./base_values"
import { item_model_tag } from "./model_tags"
import { money } from "@custom_types/common"

export class Item {
    durability: number
    affixes: affix[]
    model_tag: item_model_tag
    price: undefined | money

    constructor(durability: number, affixes: affix[], model_tag: item_model_tag) {
        this.durability = durability
        this.affixes = affixes
        this.model_tag = model_tag
    }

    json():ItemJson {
        return {
            durability: this.durability,
            affixes: this.affixes,
            model_tag: this.model_tag,
        }
    }
}

export interface ItemJson {
    durability: number
    affixes: affix[]
    model_tag: item_model_tag
}

