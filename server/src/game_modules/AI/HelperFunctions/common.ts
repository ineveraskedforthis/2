import { MATERIAL, MATERIAL_CATEGORY, MaterialConfiguration, MaterialStorage } from "@content/content";
import { Character } from "../../data/entities/character";
import { DataID } from "../../data/data_id";
import { Data } from "../../data/data_objects";
import { is_enemy_characters } from "../../SYSTEM_REPUTATION";
import { tagRACE } from "../../types";
import { crafts_bulk, crafts_items } from "../../craft/crafts_storage";
import { money } from "@custom_types/common";
import { CraftBulkTemplate, box } from "@custom_types/inventory";
import { ItemOrders } from "../../market/system";
import { EquipmentPiece } from "../../data/entities/item";
import { is_armour } from "../../../content_wrappers/item";
import { DmgOps } from "../../damage_types";
import { ItemSystem } from "../../systems/items/item_system";
import { MapSystem } from "../../map/system";
import { LocationData } from "../../location/location_interface";
import { ActionManager } from "../../actions/manager";
import { CharacterAction } from "../../actions/actions_00";
import { battle_id } from "@custom_types/battle_data";
import { BattleSystem } from "../../battle/system";
import { Battle } from "../../battle/classes/battle";
import { BattleTriggers } from "../../battle/TRIGGERS";
import { CharacterCondition } from "../../scripted-conditions/character-conditions";
import { CraftValues } from "../../scripted-values/craft";
import { cell_id, location_id } from "@custom_types/ids";
import { Effect } from "../../effects/effects";

export const base_price = 1 as money

export interface price {
    material: MATERIAL,
    price: money
}

export interface priced_box {
    material: MATERIAL,
    price: money
    amount: number
}

type PriceEstimator = (character: Character, material: MATERIAL) => money
export const directions = [[0, 1], [0 ,-1] ,[1, 0] ,[-1 ,0],[1 ,1],[-1 ,-1]]

export namespace AIfunctions {
    export function has_home(character: Character) : boolean {
        return character.home_location_id !== undefined
    }

    export function items_for_sale(character: Character) : number {
        let total = 0
        for (const item_id of character.equip.data.backpack.items) {
            const item = Data.Items.from_id(item_id)
            if (item.price !== undefined) {
                total++;
            }
        }

        return total
    }

    export function home_cell(character: Character) : cell_id|undefined {
        if (character.home_location_id !== undefined)
            return Data.Locations.from_id(character.home_location_id).cell_id
        return undefined
    }

    export function at_home_cell(character: Character) : boolean {
        const home = home_cell(character)
        if (home) {
            return character.cell_id == home
        }
        return true
    }

    export function is_loot(material: MATERIAL) {
        const data = MaterialStorage.get(material)
        if (data.category == MATERIAL_CATEGORY.BONE) return true
        if (data.category == MATERIAL_CATEGORY.FISH) return true
        if (data.category == MATERIAL_CATEGORY.SKIN) return true
        if (data.category == MATERIAL_CATEGORY.MEAT) return true
        if (data.category == MATERIAL_CATEGORY.FRUIT) return true
        if (data.category == MATERIAL_CATEGORY.PLANT) return true
        if (data.category == MATERIAL_CATEGORY.WOOD) return true

        return false
    }

    export function loot_weight(actor: Character) : number {
        let total_weight = 0
        for (const material of MaterialConfiguration.MATERIAL) {
            if (is_loot(material)) {
                const data = MaterialStorage.get(material)
                total_weight += actor.stash.get(material) * data.unit_size * data.density
            }
        }
        return total_weight
    }

    export function stash_disbalance(actor: Character) : number {
        let total = 0
        for (const material of MaterialConfiguration.MATERIAL) {
            total += Math.abs(actor.stash.get(material) - actor.ai_desired_stash.get(material))
        }
        return total
    }

    export function stash_overflow(actor: Character) : number {
        let total = 0
        for (const material of MaterialConfiguration.MATERIAL) {
            total += Math.max(0, actor.stash.get(material) - actor.ai_desired_stash.get(material))
        }
        return total
    }

    export function trade_stash_weight(actor: Character) : number {
        let total_weight = 0
        for (const material of MaterialConfiguration.MATERIAL) {
            const data = MaterialStorage.get(material)
            total_weight += actor.trade_stash.get(material) * data.unit_size * data.density
        }
        return total_weight
    }

    export function food_weight(actor: Character) : number {
        let total_weight = 0
        for (const material of MaterialConfiguration.MATERIAL) {
            const data = MaterialStorage.get(material)
            if (CharacterCondition.can_eat(actor, data)) {
                total_weight += actor.stash.get(material) * data.unit_size * data.density
            }
        }
        return total_weight
    }

    export function lack_of_hp(actor: Character) : number {
        return (actor.hp_max - actor.hp) / actor.hp_max;
    }

    export function hp(actor: Character) : number {
        return actor.hp / actor.hp_max;
    }

    export function enemies_in_cell(character: Character) : Character[] {
        const result = []
        let a = DataID.Location.guest_list(character.location_id)
        for (let id of a) {
            let target = Data.Characters.from_id(id)
            if (is_enemy_characters(character, target)) {
                if (!target.dead()) {
                    result.push(target)
                }
            }
        }
        return result
    }

    export function considers_prey(hunter: tagRACE, candidate: tagRACE) {
        if (hunter == "human") {
            if (candidate == "ball") return true
            if (candidate == "rat") return true

            return false
        }

        if (hunter == "rat") {
            if (candidate == "human") return true
            return false
        }

        return false
    }

    export function prey_in_cell(character: Character) : Character[] {
        const result = []
        let a = DataID.Location.guest_list(character.location_id)
        for (let id of a) {
            let target = Data.Characters.from_id(id)
            if (considers_prey(character.race, target.race)) {
                if (!target.dead()) {
                    result.push(target)
                }
            }
        }
        return result
    }

    export function profitable_bulk_craft(character: Character) {
        let result = []
        for (const craft of Object.values(crafts_bulk)) {
            let profit = craft_bulk_profitability(character, craft)
            result.push({craft: craft, profit: profit})
        }
        return result
    }

    export function buy_price( character: Character, material: MATERIAL) {
        return character.ai_price_belief_buy.get(material) || base_price;
    }

    export function sell_price(character: Character, material: MATERIAL) {
        return character.ai_price_belief_sell.get(material)|| base_price;
    }

    export function price_norm(character: Character, items_vector: priced_box[]): number {
        let norm = 0
        for (let item of items_vector) {
            norm += item.amount * item.price
        }
        return norm
    }

    export function price_norm_box(
        character: Character,
        items_vector: box[],
        price_estimator: PriceEstimator): number
    {
        let norm = 0
        for (let item of items_vector) {
            norm += item.amount * price_estimator(character, item.material)
        }
        return norm
    }

    export function craft_bulk_profitability(character: Character, craft: CraftBulkTemplate) {
        const input_price = price_norm_box(character, craft.input, buy_price)
        const output_price = price_norm_box(character, CraftValues.output_bulk(character, craft), sell_price)
        const profit = output_price - input_price;
        return profit
    }

    export function profitable_item_craft(character: Character) {
        const result = []

        for (const item of Object.values(crafts_items)) {
            if (item.output.tag == "armour") {
                if (ItemOrders.count_armour_orders_of_type(character.cell_id, item.output.value) >= 3) continue
            }
            if (item.output.tag == "weapon") {
                if (ItemOrders.count_weapon_orders_of_type(character.cell_id, item.output.value) >= 3) continue
            }

            if (CraftValues.durability(character, item) > 100) {
                result.push(item)
            }
        }

        return result
    }

    export function sell_price_item(character: Character, item: EquipmentPiece): money {
        if (is_armour(item)) {
            let resists = DmgOps.total(ItemSystem.resists(item))
            return Math.floor(5 * (resists * item.durability / 100 + Math.random() * 50)) + 1 as money
        }
        let damage =  DmgOps.total(ItemSystem.damage_breakdown(item))
        return Math.floor(5 * (damage * item.durability / 100 + Math.random() * 50)) + 1 as money
    }

    export function go_to_location(actor: Character, target: LocationData) {
        let next_cell = MapSystem.find_path(actor.cell_id, target.cell_id);
        if (next_cell != undefined) {
            ActionManager.start_action(CharacterAction.MOVE, actor, next_cell);
        } else {
            Effect.enter_location(actor.id, target.id)
            update_price_beliefs(actor)
        }
    }

    export function check_local_demand_for_material(actor: Character, material: MATERIAL) {
        let demanded = 0

        const demand = DataID.Cells.market_order_id_list(actor.cell_id).map(Data.MarketOrders.from_id)
        for (const item of demand) {
            if (
                (item.material == material)
                && (item.typ == "buy")
                // || (item.price >= AIfunctions.sell_price(actor, material))
            ) {
                demanded += item.amount
            }
        }

        return demanded
    }

    export function check_local_supply_for_material(actor: Character, material: MATERIAL) {
        let supplied = 0

        const demand = DataID.Cells.market_order_id_list(actor.cell_id).map(Data.MarketOrders.from_id)
        for (const item of demand) {
            if (
                (item.material == material)
                && (item.typ == "sell")
                // || (item.price >= AIfunctions.buy_price(actor, material))
            ) {
                supplied += item.amount
            }
        }

        return supplied
    }


    export function update_price_beliefs(character: Character) {
        let orders = DataID.Cells.market_order_id_list(character.cell_id)
        // initialisation

        for (let material of MaterialConfiguration.MATERIAL) {
            let value_buy = character.ai_price_belief_buy.get(material)
            let value_sell = character.ai_price_belief_sell.get(material)

            if (value_buy == undefined) {
                character.ai_price_belief_buy.set(material, base_price)
            }
            if (value_sell == undefined) {
                character.ai_price_belief_sell.set(material, base_price)
            }
        }

        // updating price beliefs as you go
        for (let item of orders) {
            let order = Data.MarketOrders.from_id(item)
            if (order.typ == "buy") {
                let belief = character.ai_price_belief_sell.get(order.material)
                if (belief == undefined) {
                    character.ai_price_belief_sell.set(order.material, order.price)
                } else {
                    character.ai_price_belief_sell.set(order.material, Math.round(order.price / 10 + belief * 9 / 10) as money)
                }
            }

            if (order.typ == "sell") {
                let belief = character.ai_price_belief_buy.get(order.material)
                if (belief == undefined) {
                    character.ai_price_belief_buy.set(order.material, order.price)
                } else {
                    character.ai_price_belief_buy.set(order.material, Math.round(order.price / 10 + belief * 9 / 10) as money)
                }
            }
        }

        //if we are selling, then we want to decrease price
        //if we are buying, we want to increase it slowly


        const personal_orders = DataID.Character.market_orders_list(character.id)

        for (const item of personal_orders) {
            const order = Data.MarketOrders.from_id(item)
            //if our order is huge, we are more likely to change price: we want to fulfill it asap!
            const probability = order.amount / 50
            const dice = Math.random()

            if (order.typ == "buy") {
                const belief = buy_price(character, order.material)
                if (dice < probability) {
                    character.ai_price_belief_buy.set(order.material, (belief + 1) as money)
                }
            }

            if (order.typ == "sell") {
                const belief = sell_price(character, order.material)
                if (dice < probability) {
                    character.ai_price_belief_sell.set(order.material, Math.max(1, (belief - 1)) as money)
                }
            }
        }

        //adding a bit of healthy noise
        character.ai_price_belief_buy.forEach((value, key, map) => {
            if (value > 1) {
                if (character.trade_stash.get(key) > 0) {
                    let amount = character.trade_stash.get(key) + character.stash.get(key) - 10
                    let dice = Math.random()
                    if (dice < amount / 30) {
                        map.set(key, value - 1 as money)
                    }
                }
                let dice = Math.random()
                if (dice < 0.2) {
                    map.set(key, value - 1 as money)
                }
                if (dice > 0.8) {
                    map.set(key, value + 1 as money)
                }

                let dice_2 = Math.random()
                if (dice_2 * value > 50) {
                    map.set(key, value - 1 as money)
                }
            } else {
                let dice = Math.random()
                if (dice > 0.8) {
                    map.set(key, value + 1 as money)
                }
            }
        });

        character.ai_price_belief_sell.forEach((value, key, map) => {
            if (value > 1) {
                let dice = Math.random()
                if (dice < 0.2) {
                    map.set(key, value - 1 as money)
                }
                if (dice > 0.8) {
                    map.set(key, value + 1 as money)
                }

                let dice_2 = Math.random()
                if (dice_2 * value > 50) {
                    map.set(key, value - 1 as money)
                }
            } else {
                let dice = Math.random()
                if (dice > 0.8) {
                    map.set(key, value + 1 as money)
                }
            }
        });
    }

    export function roll_price_belief_sell_increase(character: Character, material: MATERIAL, probability: number) {
        let dice = Math.random()
        let current = character.ai_price_belief_sell.get(material)
        if (current == undefined) {
            character.ai_price_belief_sell.set(material, 1 as money)
        } else if (dice < probability) {
            character.ai_price_belief_sell.set(material, current + 1 as money)
        }
    }

    export function roll_price_belief_sell_decrease(character: Character, material: MATERIAL, probability: number) {
        let dice = Math.random()
        let current = character.ai_price_belief_sell.get(material)
        if (current == undefined) {
            character.ai_price_belief_sell.set(material, 1 as money)
        } else if (dice < probability) {
            character.ai_price_belief_sell.set(material, current - 1 as money)
        }
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

    export function check_local_battles(agent: Character) {
        let battles = battles_in_cell(agent)
        for (let item of battles) {
            let battle = Data.Battles.from_id(item)
            if (!(BattleSystem.battle_finished(battle))) {
                let team = check_team_to_join(agent, battle)
                if (team == 'no_interest') continue
                else {
                    return true
                }
            }
        }
        return false
    }

    export function join_local_battle(agent: Character) {
        let battles = battles_in_cell(agent)
        for (let item of battles) {
            let battle = Data.Battles.from_id(item)
            if (!(BattleSystem.battle_finished(battle))) {
                let team = check_team_to_join(agent, battle)
                if (team == 'no_interest') continue
                else {
                    BattleSystem.add_figther(battle, agent, team, 100)
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
}