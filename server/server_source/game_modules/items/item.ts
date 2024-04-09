import { item_model_tag } from "./model_tags"
import { money } from "@custom_types/common"
import { ItemJson, affix } from "@custom_types/inventory"

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

