import { money } from "@custom_types/common";
import { location_id } from "@custom_types/ids";
import { CharacterAction } from "../actions/actions_00";
import { ActionManager } from "../actions/manager";
import { select_max, select_weighted, select_weighted_callback, trim } from "../calculations/basic_functions";
import { Character } from "../character/character";
import { EventMarket } from "../events/market";
import { MapSystem } from "../map/system";
import { Convert } from "../systems_communication";
import { dp } from "./AI_CONSTANTS";
import { AItrade, base_price } from "./AI_SCRIPTED_VALUES";
import { coastal_constraints, simple_constraints, urban_constraints } from "./constraints";
import { GenericRest } from "./AI_ROUTINE_GENERIC";
import { Data } from "../data/data_objects";
import { DataID } from "../data/data_id";
import { CellData } from "../map/cell_interface";
import { Effect } from "../effects/effects";
import { MATERIAL, MATERIAL_CATEGORY, MaterialConfiguration, MaterialStorage } from "@content/content";

const LOOT = [MATERIAL.MEAT_RAT, MATERIAL.SKIN_RAT, MATERIAL.BONE_RAT, MATERIAL.SMALL_BONE_RAT, MATERIAL.FISH_OKU];

export function loot(character: Character) {
    let tmp = 0;
    for (let tag of LOOT) {
        tmp += character.stash.get(tag) + character.trade_stash.get(tag);
    }
    return tmp;
}
export function sell_loot(character: Character) {
    for (let tag of LOOT) {
        sell_material(character, tag)
    }
}

export function remove_orders(character: Character) {
    EventMarket.remove_bulk_orders(character)
}


export function sell_all_stash(character: Character) {
    for (let tag of MaterialConfiguration.MATERIAL) {
        EventMarket.sell(
            character,
            tag,
            character.stash.get(tag),
            AItrade.sell_price_bulk(character, tag) as money
        );
    }
}

export function sell_material(character: Character, material: MATERIAL) {
    let orders = DataID.Cells.market_order_id_list(character.cell_id);
    let best_order = undefined;
    let best_price = 0;
    for (let item of orders) {
        let order = Data.MarketOrders.from_id(item);
        if (order.typ == 'sell')
            continue;
        if (order.material != material)
            continue;
        if ((best_price < order.price) && (order.amount > 0)) {
            best_price = order.price;
            best_order = order;
        }
    }

    if (best_order == undefined) {
        EventMarket.sell(
                character,
                material,
                character.stash.get(material),
                AItrade.sell_price_bulk(character, material) as money);
        return false;
    }

    EventMarket.execute_buy_order(character, best_order.id, 1);
    return true;
}

export function buy_from_market(character: Character, material: MATERIAL) {
    let orders = DataID.Cells.market_order_id_list(character.cell_id);
    let best_order = undefined;
    let best_price = 9999;
    for (let item of orders) {
        let order = Data.MarketOrders.from_id(item);
        if (order.typ == 'buy')
            continue;
        if (order.material != material)
            continue;
        if ((best_price > order.price) && (order.amount > 0)) {
            best_price = order.price;
            best_order = order;
        }
    }

    if (best_order == undefined)
        return false;

    if (character.savings.get() >= best_price) {
        EventMarket.execute_sell_order(character, best_order.id, 1);
        return true;
    }
    return false;
}

export function sell_to_market_limits(character: Character, material: MATERIAL, min_price: number, max_amount: number) : number {
    let orders = DataID.Cells.market_order_id_list(character.cell_id);
    let best_order = undefined;
    let best_price = min_price;
    for (let item of orders) {
        let order = Data.MarketOrders.from_id(item);
        if (order.typ == 'buy')
            continue;
        if (order.material != material)
            continue;
        if ((best_price <= order.price) && (order.amount > 0)) {
            best_price = order.price;
            best_order = order;
        }
    }

    if (best_order == undefined)
        return 0;

    if (character.savings.get() >= best_price) {
        return EventMarket.execute_buy_order(
            character,
            best_order.id,
            Math.min(
                Math.floor(character.savings.get() / best_price),
                max_amount
            )
        );
    }
    return 0;
}

export function buy_from_market_limits(character: Character, material: MATERIAL, max_price: number, max_amount: number) : number {
    let orders = DataID.Cells.market_order_id_list(character.cell_id);
    let best_order = undefined;
    let best_price = max_price;
    for (let item of orders) {
        let order = Data.MarketOrders.from_id(item);
        if (order.typ == 'buy')
            continue;
        if (order.material != material)
            continue;
        if ((best_price >= order.price) && (order.amount > 0)) {
            best_price = order.price;
            best_order = order;
        }
    }

    if (best_order == undefined)
        return 0;

    if (character.savings.get() >= best_price) {
        return EventMarket.execute_sell_order(
            character,
            best_order.id,
            Math.min(
                Math.floor(character.savings.get() / best_price),
                max_amount
            )
        );
    }
    return 0;
}

export function buy_random(character: Character) {
    let orders = DataID.Cells.market_order_id_list(character.cell_id);
    let best_order = undefined;
    let best_price = 9999;

    for (let item of orders) {
        let order = Data.MarketOrders.from_id(item);
        if (order.typ == 'buy')
            continue;
        const material = MaterialStorage.get(order.material)
        if ((material.category != MATERIAL_CATEGORY.FOOD) && (material.category != MATERIAL_CATEGORY.FRUIT))
            continue;
        if ((best_price > order.price) && (order.amount > 0)) {
            best_price = order.price;
            best_order = order;
        }
    }

    if (best_order == undefined)
        return false;

    if (character.savings.get() >= best_price) {
        EventMarket.execute_sell_order(character, best_order?.id, 1);
        return true;
    }
    return false;
}

export function random_walk(char: Character, constraints: (cell: CellData) => boolean) {
    let cell = Convert.character_to_cell(char)

    //with high probability we will simply stay in our cell, while travelling from location to location:
    if (Math.random() < 0.8) {
        const location_id = select_weighted_callback<location_id>(
            DataID.Cells.locations(cell.id),
            (item) => 1
        )
        Effect.enter_location(char.id, location_id)
    }

    let possible_moves = []
    for (let d of dp) {
        let tmp: [number, number] = [d[0] + cell.x, d[1] + cell.y]
        let target_id = Data.World.coordinate_to_id(tmp)
        let target_cell = Data.Cells.from_id(target_id)
        if (target_cell != undefined) {
            if (MapSystem.can_move(tmp) && constraints(target_cell)) {
                possible_moves.push(tmp)
            }
        }
    }

    if (possible_moves.length > 0) {
        let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
        ActionManager.start_action(
            CharacterAction.MOVE,
            char,
            Data.World.coordinate_to_id(move_direction))
    }
}

export function rat_walk(character: Character, constraints: (cell: CellData) => boolean) {

    //with high probability we will simply stay in our cell, while travelling from location to location:
    if (Math.random() < 0.8) {
        const location_id = select_weighted_callback<location_id>(
            DataID.Cells.locations(character.cell_id),
            (item) => 1
        )
        Effect.enter_location(character.id, location_id)
    }

    let cell_ids = Data.World.neighbours(character.cell_id)
    let potential_moves = cell_ids.map((x) => {
        let cell = Data.Cells.from_id(x)
        return {item: cell, weight: trim(cell.rat_scent, 0, 5)}
    })
    let target = select_weighted(potential_moves, constraints)
    ActionManager.start_action(CharacterAction.MOVE, character, target.id)
}

export function home_walk(character: Character) {
    if (character.home_location_id == undefined) {
        let cell_ids = Data.World.neighbours(character.cell_id)
        let potential_moves = cell_ids.map((x) => {
            let cell = Data.Cells.from_id(x)
            return {item: cell, weight: 1}
        })
        let target = select_max(potential_moves, simple_constraints)
        ActionManager.start_action(CharacterAction.MOVE, character, target.id)
    } else {
        if (character.cell_id == DataID.Location.cell_id(character.home_location_id)) {
            Effect.enter_location(character.id, character.home_location_id)
            return
        }
        let next_cell = MapSystem.find_path(character.cell_id, DataID.Location.cell_id(character.home_location_id))
        if (next_cell != undefined) {
            ActionManager.start_action(CharacterAction.MOVE, character, next_cell);
        } else {

            console.log('character tries to move home to sell loot but can\'t')
            console.log(character.cell_id)
            console.log(DataID.Location.cell_id(character.home_location_id))
            console.log(character.home_location_id)
        }
    }
}

export function urban_walk(character: Character) {
    random_walk(character, urban_constraints)
}

export function coast_walk(character: Character) {
    random_walk(character, coastal_constraints)
}

export function rat_go_home(character: Character, constraints: (cell: CellData) => boolean) {
    let cell = Convert.character_to_cell(character)
    let potential_moves = Data.World.neighbours(character.cell_id).map((x) => {return Data.Cells.from_id(x)}).map((x) =>
        {return {item: x, weight: x.rat_scent}})
    let target = select_max(potential_moves, constraints)
    if (target != undefined)
    if (cell.rat_scent > target.rat_scent) {
        // console.log('at home')
        GenericRest(character)
        // ActionManager.start_action(CharacterAction.REST, character, [cell.x, cell.y])
    } else {
        // console.log('keep moving')
        ActionManager.start_action(CharacterAction.MOVE, character, target.id)
    }
}


export function rest_outside(character: Character) {
    ActionManager.start_action(CharacterAction.REST, character, character.cell_id);
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

export function update_price_beliefs(character: Character) {
    let orders = DataID.Cells.market_order_id_list(character.cell_id)
    // initialisation

    for (let material of MaterialConfiguration.MATERIAL) {
        let value_buy = character.ai_price_belief_buy.get(material)
        let value_sell = character.ai_price_belief_sell.get(material)

        if (value_buy == undefined) {
            character.ai_price_belief_buy.set(material, base_price(character.cell_id, material))
        }
        if (value_sell == undefined) {
            character.ai_price_belief_sell.set(material, base_price(character.cell_id, material))
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
            const belief = character.ai_price_belief_buy.get(order.material) || base_price(character.cell_id, order.material)
            if (dice < probability) {
                character.ai_price_belief_buy.set(order.material, (belief + 1) as money)
            }
        }

        if (order.typ == "sell") {
            const belief = character.ai_price_belief_sell.get(order.material) || base_price(character.cell_id, order.material)
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
        } else {
            let dice = Math.random()
            if (dice > 0.8) {
                map.set(key, value + 1 as money)
            }
        }
    });
}