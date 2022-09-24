import { Item, Itemlette } from "./item";

export namespace ItemsSystem {
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
    }

    export function create (item_desc: ItemDescription) {
        
    }
}