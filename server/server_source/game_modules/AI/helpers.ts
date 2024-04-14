import { battle_id } from "../../../../shared/battle_data"
import { Battle } from "../battle/classes/battle"
import { Character } from "../character/character"
import { output_bulk } from "../craft/CraftBulk"
import { trim } from "../calculations/basic_functions"
import { create_item, durability } from "../craft/CraftItem"
import { box, CraftBulkTemplate, CraftItemTemplate } from "@custom_types/inventory"
import { AItrade, price, priced_box } from "./AI_SCRIPTED_VALUES"
import { money } from "@custom_types/common"
import { BattleTriggers } from "../battle/TRIGGERS"
import { BattleSystem } from "../battle/system"
import { is_enemy_characters } from "../SYSTEM_REPUTATION"
import { DmgOps } from "../damage_types"
import { DataID } from "../data/data_id"
import { Data } from "../data/data_objects"
import { is_armour } from "../../content_wrappers/item"
import { ItemSystem } from "../systems/items/item_system"
import { EquipmentPiece } from "../data/entities/item"



export namespace AIhelper {
    export function enemies_in_cell(character: Character) {
        let a = DataID.Location.guest_list(character.location_id)
        for (let id of a) {
            let target_char = Data.Characters.from_id(id)
            if (is_enemy_characters(character, target_char)) {
                if (!target_char.dead()) {
                    return target_char.id
                }
            }
        }
        return undefined
    }

    export function free_rats_in_cell(char: Character) {
        let a = DataID.Location.guest_list(char.location_id)
        for (let id of a) {
            let target_char = Data.Characters.from_id(id)
            if (target_char.race == 'rat') {
                if (!target_char.in_battle() && !target_char.dead()) {
                    return target_char.id
                }
            }
        }
        return undefined
    }

    export function battles_in_cell(char: Character) {
        let battles:battle_id[] = []
        let a = DataID.Location.guest_list(char.location_id)
        for (let id of a) {
            let target_char = Data.Characters.from_id(id)
            const battle_id = target_char.battle_id
            if ((battle_id != undefined) && !target_char.dead()) {
                battles.push(battle_id)
            }
        }
        return battles
    }
    export function check_battles_to_join(agent: Character) {
        let battles = battles_in_cell(agent)
        // console.log(battles)
        for (let item of battles) {
            let battle = Data.Battles.from_id(item)
            if (!(BattleSystem.battle_finished(battle))) {
                let team = check_team_to_join(agent, battle)
                if (team == 'no_interest') continue
                else {
                    BattleSystem.add_figther(battle, agent, team)
                    return true
                }
            }
        }
        return false
    }
    export function check_team_to_join(agent: Character, battle: Battle, exclude?: number):number|'no_interest' {
        let potential_team = -1
        for (const target_id of battle.heap) {
            if (target_id == undefined) continue;
            const target = Data.Characters.from_id(target_id)
            if (BattleTriggers.is_friend(agent, target) && (target.team != exclude)) {
                if (potential_team == 0) continue
                else potential_team = target.team
            }
        }
        if (potential_team == -1) return 'no_interest'
        if (BattleTriggers.safe_expensive(battle)) return 'no_interest'

        return potential_team
    }



    export function buy_craft_inputs(character: Character, budget: money, input: box[]): priced_box[] {
        // solve
        // sum (buy * base_price) < budget
        // (buy + stash) / input < 10
        let buy:priced_box[] = []

        // (buy) = (10 * input - stash) - find corner of buyment box
        for (let item of input) {
            const amount = trim(10 * item.amount - character.stash.get(item.material), 0, 9999)
            buy.push({material: item.material, amount: amount, price: AItrade.buy_price_bulk(character, item.material)})
        }

        // normalise (buy) with price metric down to budget
        let norm = AItrade.price_norm(character, buy)
        if (norm < 1) norm = 1
        const multiplier = budget / norm
        for (let item of buy) {
            item.amount = Math.floor(item.amount * multiplier)
        }

        return buy
    }

    export function sell_prices_craft_bulk(character: Character, craft: CraftBulkTemplate): price[] {
        const input_price = AItrade.price_norm_box(character, craft.input, AItrade.buy_price_bulk)
        const estimated_output = output_bulk(character, craft)

        let prices: price[] = []
        for (let item of estimated_output) {
            const price = Math.round(Math.max(
                input_price * 2 / item.amount,
                AItrade.sell_price_bulk(character, item.material)))
            prices.push({material: item.material, price: price as money})
        }

        return prices
    }

    export function sell_price_craft_item(character: Character, craft: CraftItemTemplate): money {
        const estimated_quality = durability(character, craft)
        return sell_price_item(character, create_item(craft.output, craft.output_affixes, estimated_quality))
    }

    export function sell_price_item(character: Character, item: EquipmentPiece): money {
        if (is_armour(item)) {
            let resists = DmgOps.total(ItemSystem.resists(item))
            return Math.floor(5 * (resists * item.durability / 100 + Math.random() * 50)) + 1 as money
        }
        let damage =  DmgOps.total(ItemSystem.damage_breakdown(item))
        return Math.floor(5 * (damage * item.durability / 100 + Math.random() * 50)) + 1 as money
    }
}