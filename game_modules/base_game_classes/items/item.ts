import { affix } from "../affix"
import { ITEM_MATERIAL } from "./item_tags"

class Item {
    durability: number
    affixes: affix[]
    slot: EquipSlot
    material: ITEM_MATERIAL


    constructor(durability) {

    }
}