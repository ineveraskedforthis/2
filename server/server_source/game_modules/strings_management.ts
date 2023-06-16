import { Item } from "./items/item";
import { DmgOps } from "./damage_types";
import { Archetype, InnateStats, Stats, Status, user_id } from "./types";
import { Character } from "./character/character";
import { SkillList, skill } from "./character/SkillList";
import { Inventory } from "./inventories/inventory";
import { cell_id, money } from "@custom_types/common";
import { LandPlot } from "@custom_types/buildings";


export function item_to_string(item: Item | undefined): string {
    return (JSON.stringify(item));
}

export function item_from_string(s: string): Item {
    const item_data: Item = JSON.parse(s);
    let damage = DmgOps.copy(item_data.damage);
    let resistance = DmgOps.copy(item_data.resists);
    return new Item(item_data.durability, item_data.affixes, item_data.slot, item_data.range, item_data.material, item_data.weapon_tag, item_data.model_tag, resistance, damage);
}

export function character_to_string(c: Character) {
    let ids = [c.id, c.battle_id, c.battle_unit_id, c.user_id, c.cell_id].join('&')
    let name = c.name

    let archetype = JSON.stringify(c.archetype)

    let equip               = c.equip.to_string()
    let stash               = JSON.stringify(c.stash.get_json())
    let trade_stash         = JSON.stringify(c.trade_stash.get_json())
    let savings             = c.savings.get()
    let trade_savings       = c.trade_savings.get()

    let status =            JSON.stringify(c.status)
    let skills =            JSON.stringify(c._skills)
    let perks  =            JSON.stringify(c.perks)
    let innate_stats  =            JSON.stringify(c.stats)
    
    let explored =          JSON.stringify({data: c.explored})

    return [ids, name, archetype, equip, stash, trade_stash, savings, trade_savings, status, skills, perks, innate_stats, explored].join(';')
}

export function string_to_character(s: string) {
    const [ids, name, raw_archetype, raw_equip, raw_stash, raw_trade_stash, raw_savings, raw_trade_savings, raw_status, raw_skills, raw_perks, raw_innate_stats, raw_explored] = s.split(';')
    let [raw_id, raw_battle_id, raw_battle_unit_id, raw_user_id, raw_cell_id] = ids.split('&')

    if (raw_user_id != '#') {var user_id:user_id|'#' = Number(raw_user_id) as user_id} else {var user_id:user_id|'#' = '#'}

    const innate_stats:InnateStats = JSON.parse(raw_innate_stats)
    const stats:Stats = innate_stats.stats

    const character = new Character(Number(raw_id), 
                                    Number(raw_battle_id), Number(raw_battle_unit_id), 
                                    user_id, Number(raw_cell_id) as cell_id, 
                                        name, 
                                        JSON.parse(raw_archetype) as Archetype, 
                                        stats, innate_stats.max.hp)
    character.stats = innate_stats
    character.explored = JSON.parse(raw_explored).data


    character.equip.from_string(raw_equip)

    character.stash.load_from_json(JSON.parse(raw_stash))
    character.trade_stash.load_from_json(JSON.parse(raw_trade_stash))

    character.savings.inc(Number(raw_savings) as money)
    character.trade_savings.inc(Number(raw_trade_savings) as money)

    character.set_status(JSON.parse(raw_status) as Status)

    character._skills = new SkillList()
    for (let [_, item] of Object.entries(JSON.parse(raw_skills) as SkillList)) {
        character._skills[_ as skill] = item
    }

    character.perks = JSON.parse(raw_perks)

    return character
}

export function inventory_to_string(inventory: Inventory) {
    const array:string[] = []
    for (let i of inventory.items) {
        if (i != undefined) {
            array.push(item_to_string(i))
        }
    }
    return JSON.stringify({items_array: array})
}

export function inventory_from_string(inventory: Inventory, s: string) {
    const data:{items_array: string[]} = JSON.parse(s)
    for (let i = 0; i <= 100; i++) {
        const tmp = data.items_array[i]
        if (tmp == undefined) return
        inventory.items.push(item_from_string(tmp))
    }
}

export function building_to_string(building: LandPlot) {
    return JSON.stringify(building)
}

export function building_from_string(s: string): LandPlot {
    return JSON.parse(s) as LandPlot
}