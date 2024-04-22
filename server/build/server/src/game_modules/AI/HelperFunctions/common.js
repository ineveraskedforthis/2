"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIfunctions = exports.directions = exports.base_price = void 0;
const content_1 = require("../../../.././../game_content/src/content");
const data_id_1 = require("../../data/data_id");
const data_objects_1 = require("../../data/data_objects");
const SYSTEM_REPUTATION_1 = require("../../SYSTEM_REPUTATION");
const system_1 = require("../../character/system");
const crafts_storage_1 = require("../../craft/crafts_storage");
const CraftBulk_1 = require("../../craft/CraftBulk");
const system_2 = require("../../market/system");
const CraftItem_1 = require("../../craft/CraftItem");
const item_1 = require("../../../content_wrappers/item");
const damage_types_1 = require("../../damage_types");
const item_system_1 = require("../../systems/items/item_system");
const system_3 = require("../../map/system");
const manager_1 = require("../../actions/manager");
const actions_00_1 = require("../../actions/actions_00");
const system_4 = require("../../battle/system");
const TRIGGERS_1 = require("../../battle/TRIGGERS");
exports.base_price = 1;
exports.directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
var AIfunctions;
(function (AIfunctions) {
    function is_loot(material) {
        const data = content_1.MaterialStorage.get(material);
        if (data.category == 3 /* MATERIAL_CATEGORY.BONE */)
            return true;
        if (data.category == 7 /* MATERIAL_CATEGORY.FISH */)
            return true;
        if (data.category == 4 /* MATERIAL_CATEGORY.SKIN */)
            return true;
        if (data.category == 6 /* MATERIAL_CATEGORY.MEAT */)
            return true;
        if (data.category == 9 /* MATERIAL_CATEGORY.FRUIT */)
            return true;
        if (data.category == 1 /* MATERIAL_CATEGORY.PLANT */)
            return true;
        if (data.category == 10 /* MATERIAL_CATEGORY.WOOD */)
            return true;
        return false;
    }
    AIfunctions.is_loot = is_loot;
    function loot_weight(actor) {
        let total_weight = 0;
        for (const material of content_1.MaterialConfiguration.MATERIAL) {
            if (is_loot(material)) {
                const data = content_1.MaterialStorage.get(material);
                total_weight += actor.stash.get(material) * data.unit_size * data.density;
            }
        }
        return total_weight;
    }
    AIfunctions.loot_weight = loot_weight;
    function food_weight(actor) {
        let total_weight = 0;
        for (const material of content_1.MaterialConfiguration.MATERIAL) {
            const data = content_1.MaterialStorage.get(material);
            if (system_1.CharacterSystem.can_eat(actor, data)) {
                total_weight += actor.stash.get(material) * data.unit_size * data.density;
            }
        }
        return total_weight;
    }
    AIfunctions.food_weight = food_weight;
    function lack_of_hp(actor) {
        return (actor.hp_max - actor.hp) / actor.hp_max;
    }
    AIfunctions.lack_of_hp = lack_of_hp;
    function hp(actor) {
        return actor.hp / actor.hp_max;
    }
    AIfunctions.hp = hp;
    function enemies_in_cell(character) {
        const result = [];
        let a = data_id_1.DataID.Location.guest_list(character.location_id);
        for (let id of a) {
            let target = data_objects_1.Data.Characters.from_id(id);
            if ((0, SYSTEM_REPUTATION_1.is_enemy_characters)(character, target)) {
                if (!target.dead()) {
                    result.push(target);
                }
            }
        }
        return result;
    }
    AIfunctions.enemies_in_cell = enemies_in_cell;
    function considers_prey(hunter, candidate) {
        if (hunter == "human") {
            if (candidate == "ball")
                return true;
            if (candidate == "rat")
                return true;
            return false;
        }
        if (hunter == "rat") {
            if (candidate == "human")
                return true;
            return false;
        }
        return false;
    }
    AIfunctions.considers_prey = considers_prey;
    function prey_in_cell(character) {
        const result = [];
        let a = data_id_1.DataID.Location.guest_list(character.location_id);
        for (let id of a) {
            let target = data_objects_1.Data.Characters.from_id(id);
            if (considers_prey(character.race, target.race)) {
                if (!target.dead()) {
                    result.push(target);
                }
            }
        }
        return result;
    }
    AIfunctions.prey_in_cell = prey_in_cell;
    function profitable_bulk_craft(character) {
        let result = [];
        for (const craft of Object.values(crafts_storage_1.crafts_bulk)) {
            let profit = craft_bulk_profitability(character, craft);
            result.push({ craft: craft, profit: profit });
        }
        return result;
    }
    AIfunctions.profitable_bulk_craft = profitable_bulk_craft;
    function buy_price(character, material) {
        return character.ai_price_belief_buy.get(material) || exports.base_price;
    }
    AIfunctions.buy_price = buy_price;
    function sell_price(character, material) {
        return character.ai_price_belief_sell.get(material) || exports.base_price;
    }
    AIfunctions.sell_price = sell_price;
    function price_norm(character, items_vector) {
        let norm = 0;
        for (let item of items_vector) {
            norm += item.amount * item.price;
        }
        return norm;
    }
    AIfunctions.price_norm = price_norm;
    function price_norm_box(character, items_vector, price_estimator) {
        let norm = 0;
        for (let item of items_vector) {
            norm += item.amount * price_estimator(character, item.material);
        }
        return norm;
    }
    AIfunctions.price_norm_box = price_norm_box;
    function craft_bulk_profitability(character, craft) {
        const input_price = price_norm_box(character, craft.input, buy_price);
        const output_price = price_norm_box(character, (0, CraftBulk_1.output_bulk)(character, craft), sell_price);
        const profit = output_price - input_price;
        return profit;
    }
    AIfunctions.craft_bulk_profitability = craft_bulk_profitability;
    function profitable_item_craft(character) {
        const result = [];
        for (const item of Object.values(crafts_storage_1.crafts_items)) {
            if (item.output.tag == "armour") {
                if (system_2.ItemOrders.count_armour_orders_of_type(character.cell_id, item.output.value) >= 3)
                    continue;
            }
            if (item.output.tag == "weapon") {
                if (system_2.ItemOrders.count_weapon_orders_of_type(character.cell_id, item.output.value) >= 3)
                    continue;
            }
            if ((0, CraftItem_1.durability)(character, item) > 100) {
                result.push(item);
            }
        }
        return result;
    }
    AIfunctions.profitable_item_craft = profitable_item_craft;
    function sell_price_item(character, item) {
        if ((0, item_1.is_armour)(item)) {
            let resists = damage_types_1.DmgOps.total(item_system_1.ItemSystem.resists(item));
            return Math.floor(5 * (resists * item.durability / 100 + Math.random() * 50)) + 1;
        }
        let damage = damage_types_1.DmgOps.total(item_system_1.ItemSystem.damage_breakdown(item));
        return Math.floor(5 * (damage * item.durability / 100 + Math.random() * 50)) + 1;
    }
    AIfunctions.sell_price_item = sell_price_item;
    function go_to_location(actor, target) {
        let next_cell = system_3.MapSystem.find_path(actor.cell_id, target.cell_id);
        if (next_cell != undefined) {
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, actor, next_cell);
        }
        else {
            console.log('BLOCKED PATH!!!');
        }
    }
    AIfunctions.go_to_location = go_to_location;
    function check_local_demand_for_material(actor, material) {
        let demanded = 0;
        const demand = data_id_1.DataID.Cells.market_order_id_list(actor.cell_id).map(data_objects_1.Data.MarketOrders.from_id);
        for (const item of demand) {
            if (item.owner_id == actor.id)
                continue;
            if ((item.material == material)
                || (item.typ == "buy")
                || (item.price >= AIfunctions.sell_price(actor, material))) {
                demanded += item.amount;
            }
        }
        return demanded;
    }
    AIfunctions.check_local_demand_for_material = check_local_demand_for_material;
    function update_price_beliefs(character) {
        let orders = data_id_1.DataID.Cells.market_order_id_list(character.cell_id);
        // initialisation
        for (let material of content_1.MaterialConfiguration.MATERIAL) {
            let value_buy = character.ai_price_belief_buy.get(material);
            let value_sell = character.ai_price_belief_sell.get(material);
            if (value_buy == undefined) {
                character.ai_price_belief_buy.set(material, exports.base_price);
            }
            if (value_sell == undefined) {
                character.ai_price_belief_sell.set(material, exports.base_price);
            }
        }
        // updating price beliefs as you go
        for (let item of orders) {
            let order = data_objects_1.Data.MarketOrders.from_id(item);
            if (order.typ == "buy") {
                let belief = character.ai_price_belief_sell.get(order.material);
                if (belief == undefined) {
                    character.ai_price_belief_sell.set(order.material, order.price);
                }
                else {
                    character.ai_price_belief_sell.set(order.material, Math.round(order.price / 10 + belief * 9 / 10));
                }
            }
            if (order.typ == "sell") {
                let belief = character.ai_price_belief_buy.get(order.material);
                if (belief == undefined) {
                    character.ai_price_belief_buy.set(order.material, order.price);
                }
                else {
                    character.ai_price_belief_buy.set(order.material, Math.round(order.price / 10 + belief * 9 / 10));
                }
            }
        }
        //if we are selling, then we want to decrease price
        //if we are buying, we want to increase it slowly
        const personal_orders = data_id_1.DataID.Character.market_orders_list(character.id);
        for (const item of personal_orders) {
            const order = data_objects_1.Data.MarketOrders.from_id(item);
            //if our order is huge, we are more likely to change price: we want to fulfill it asap!
            const probability = order.amount / 50;
            const dice = Math.random();
            if (order.typ == "buy") {
                const belief = buy_price(character, order.material);
                if (dice < probability) {
                    character.ai_price_belief_buy.set(order.material, (belief + 1));
                }
            }
            if (order.typ == "sell") {
                const belief = sell_price(character, order.material);
                if (dice < probability) {
                    character.ai_price_belief_sell.set(order.material, Math.max(1, (belief - 1)));
                }
            }
        }
        //adding a bit of healthy noise
        character.ai_price_belief_buy.forEach((value, key, map) => {
            if (value > 1) {
                if (character.trade_stash.get(key) > 0) {
                    let amount = character.trade_stash.get(key) + character.stash.get(key) - 10;
                    let dice = Math.random();
                    if (dice < amount / 30) {
                        map.set(key, value - 1);
                    }
                }
                let dice = Math.random();
                if (dice < 0.2) {
                    map.set(key, value - 1);
                }
                if (dice > 0.8) {
                    map.set(key, value + 1);
                }
                let dice_2 = Math.random();
                if (dice_2 * value > 50) {
                    map.set(key, value - 1);
                }
            }
            else {
                let dice = Math.random();
                if (dice > 0.8) {
                    map.set(key, value + 1);
                }
            }
        });
        character.ai_price_belief_sell.forEach((value, key, map) => {
            if (value > 1) {
                let dice = Math.random();
                if (dice < 0.2) {
                    map.set(key, value - 1);
                }
                if (dice > 0.8) {
                    map.set(key, value + 1);
                }
                let dice_2 = Math.random();
                if (dice_2 * value > 50) {
                    map.set(key, value - 1);
                }
            }
            else {
                let dice = Math.random();
                if (dice > 0.8) {
                    map.set(key, value + 1);
                }
            }
        });
    }
    AIfunctions.update_price_beliefs = update_price_beliefs;
    function roll_price_belief_sell_increase(character, material, probability) {
        let dice = Math.random();
        let current = character.ai_price_belief_sell.get(material);
        if (current == undefined) {
            character.ai_price_belief_sell.set(material, 1);
        }
        else if (dice < probability) {
            character.ai_price_belief_sell.set(material, current + 1);
        }
    }
    AIfunctions.roll_price_belief_sell_increase = roll_price_belief_sell_increase;
    function roll_price_belief_sell_decrease(character, material, probability) {
        let dice = Math.random();
        let current = character.ai_price_belief_sell.get(material);
        if (current == undefined) {
            character.ai_price_belief_sell.set(material, 1);
        }
        else if (dice < probability) {
            character.ai_price_belief_sell.set(material, current - 1);
        }
    }
    AIfunctions.roll_price_belief_sell_decrease = roll_price_belief_sell_decrease;
    function battles_in_cell(char) {
        let battles = [];
        let a = data_id_1.DataID.Location.guest_list(char.location_id);
        for (let id of a) {
            let target_char = data_objects_1.Data.Characters.from_id(id);
            const battle_id = target_char.battle_id;
            if ((battle_id != undefined) && !target_char.dead()) {
                battles.push(battle_id);
            }
        }
        return battles;
    }
    AIfunctions.battles_in_cell = battles_in_cell;
    function check_local_battles(agent) {
        let battles = battles_in_cell(agent);
        // console.log(battles)
        for (let item of battles) {
            let battle = data_objects_1.Data.Battles.from_id(item);
            if (!(system_4.BattleSystem.battle_finished(battle))) {
                let team = check_team_to_join(agent, battle);
                if (team == 'no_interest')
                    continue;
                else {
                    return true;
                }
            }
        }
        return false;
    }
    AIfunctions.check_local_battles = check_local_battles;
    function join_local_battle(agent) {
        let battles = battles_in_cell(agent);
        // console.log(battles)
        for (let item of battles) {
            let battle = data_objects_1.Data.Battles.from_id(item);
            if (!(system_4.BattleSystem.battle_finished(battle))) {
                let team = check_team_to_join(agent, battle);
                if (team == 'no_interest')
                    continue;
                else {
                    system_4.BattleSystem.add_figther(battle, agent, team, 100);
                    return true;
                }
            }
        }
        return false;
    }
    AIfunctions.join_local_battle = join_local_battle;
    function check_team_to_join(agent, battle, exclude) {
        let potential_team = -1;
        for (const target_id of battle.heap) {
            if (target_id == undefined)
                continue;
            const target = data_objects_1.Data.Characters.from_id(target_id);
            if (TRIGGERS_1.BattleTriggers.is_friend(agent, target) && (target.team != exclude)) {
                if (potential_team == 0)
                    continue;
                else
                    potential_team = target.team;
            }
        }
        if (potential_team == -1)
            return 'no_interest';
        if (TRIGGERS_1.BattleTriggers.safe_expensive(battle))
            return 'no_interest';
        return potential_team;
    }
    AIfunctions.check_team_to_join = check_team_to_join;
})(AIfunctions || (exports.AIfunctions = AIfunctions = {}));

