import { Item, ItemJson, Itemlette } from "./item";

export namespace ItemSystem {
    export function size (item: Itemlette): number {
        if (item.slot == 'weapon') {
            switch(item.weapon_tag) {
                case 'onehand':
                    return 1
                case 'polearms':
                    return 2
                case 'ranged':
                    return 1
                case 'twohanded':
                    return 3
            }
        }
        
        switch(item.slot) {
            case 'arms': return 1
            case 'foot': return 1
            case 'head': return 1
            case 'legs': return 3
            case 'body': return 5
        }

        // return 1
    }

    export function create (item_desc: ItemJson) {
        let item = new Item(item_desc.durability, [], item_desc.slot, item_desc.range, item_desc.material, item_desc.weapon_tag, item_desc.model_tag, item_desc.resists, item_desc.damage)
        for (let aff of item_desc.affixes) {
            item.affixes.push(aff)
        }
        return item
    }

    export function weight(item: Item) {
        return item.material.density * size(item)
    }
}