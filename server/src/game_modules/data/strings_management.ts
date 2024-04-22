import { CharacterTemplate } from "../types";
import { Character } from "./entities/character";
import { Inventory } from "./entities/inventory";
import { Equip } from "./entities/equip";

export function character_to_string(data: Character) {
    return JSON.stringify({
        model: data.model,
        ai_map: data.ai_map,
        ai_battle: data.ai_battle,
        race: data.race,
        stats: data.stats,
        resists: data.resists,
        name: data.name,
        max_hp: data.max_hp,

        id: data.id,
        battle_id: data.battle_id,
        user_id: data.user_id,
        location_id: data.location_id,

        open_shop: data.open_shop,

        explored : data.explored,
        equip: data.equip,
        home_location_id : data.home_location_id,

        stash: data.stash,
        trade_stash: data.trade_stash,
        savings: data.savings,
        trade_savings: data.trade_savings,
        status: data.status,
        _skills : data._skills,
        _perks : data._perks,
        _traits : data._traits,
    })
}

export function string_to_character(s: string) {
    const data = JSON.parse(s) as Character
    const template: CharacterTemplate = {
        model: data.model,
        ai_map: data.ai_map,
        ai_battle: data.ai_battle,
        race: data.race,
        stats: data.stats,
        resists: data.resists,
        name_generator: (() => {return data.get_name()}),
        max_hp: data.max_hp
    }
    const character = new Character(data.id, data.battle_id, data.user_id, data.location_id, data.name, template)
    character.explored = data.explored
    character.equip.load_from_json(data.equip)
    character.home_location_id = data.home_location_id
    // equip_from_string(data.equip.data, character.equip)

    character.stash.load_from_json(data.stash.data)
    character.trade_stash.load_from_json(data.trade_stash.data)
    character.savings.inc(data.savings.data)
    character.trade_savings.inc(data.trade_savings.data)
    character._set_status(data.status)
    character._skills = data._skills
    character._perks = data._perks
    character._traits = data._traits

    character.open_shop = data.open_shop
    return character
}

// export function equip_to_string(equip: Equip) {
//     return JSON.stringify(equip)
// }

// export function equip_from_string(s: string, equip: Equip): Equip {
//     equip.load_from_json(JSON.parse(s))
//     return equip
// }

export function inventory_to_string(inventory: Inventory) {
    // const array:string[] = []
    // for (let i of inventory.items) {
    //     if (i != undefined) {
    //         array.push(item_to_string(i))
    //     }
    // }
    // return JSON.stringify({items_array: array})
    return JSON.stringify(inventory)
}

export function inventory_from_string(inventory: Inventory, s: string) {
    // const data:{items_array: string[]} = JSON.parse(s)
    // for (let i = 0; i <= 100; i++) {
    //     const tmp = data.items_array[i]
    //     if (tmp == undefined) return
    //     inventory.items.push(item_from_string(tmp))
    // }
    inventory.load_from_json(JSON.parse(s))
    return inventory
}