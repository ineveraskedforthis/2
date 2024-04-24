"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIfunctions = exports.directions = exports.base_price = void 0;
const content_1 = require("../../../.././../game_content/src/content");
const data_id_1 = require("../../data/data_id");
const data_objects_1 = require("../../data/data_objects");
const SYSTEM_REPUTATION_1 = require("../../SYSTEM_REPUTATION");
const crafts_storage_1 = require("../../craft/crafts_storage");
const system_1 = require("../../market/system");
const item_1 = require("../../../content_wrappers/item");
const damage_types_1 = require("../../damage_types");
const item_system_1 = require("../../systems/items/item_system");
const system_2 = require("../../map/system");
const manager_1 = require("../../actions/manager");
const actions_00_1 = require("../../actions/actions_00");
const system_3 = require("../../battle/system");
const TRIGGERS_1 = require("../../battle/TRIGGERS");
const character_conditions_1 = require("../../scripted-conditions/character-conditions");
const craft_1 = require("../../scripted-values/craft");
const effects_1 = require("../../effects/effects");
exports.base_price = 1;
exports.directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
var AIfunctions;
(function (AIfunctions) {
    function has_home(character) {
        return character.home_location_id !== undefined;
    }
    AIfunctions.has_home = has_home;
    function items_for_sale(character) {
        let total = 0;
        for (const item_id of character.equip.data.backpack.items) {
            const item = data_objects_1.Data.Items.from_id(item_id);
            if (item.price !== undefined) {
                total++;
            }
        }
        return total;
    }
    AIfunctions.items_for_sale = items_for_sale;
    function home_cell(character) {
        if (character.home_location_id !== undefined)
            return data_objects_1.Data.Locations.from_id(character.home_location_id).cell_id;
        return undefined;
    }
    AIfunctions.home_cell = home_cell;
    function at_home_cell(character) {
        const home = home_cell(character);
        if (home) {
            return character.cell_id == home;
        }
        return true;
    }
    AIfunctions.at_home_cell = at_home_cell;
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
    function stash_disbalance(actor) {
        let total = 0;
        for (const material of content_1.MaterialConfiguration.MATERIAL) {
            total += Math.abs(actor.stash.get(material) - actor.ai_desired_stash.get(material));
        }
        return total;
    }
    AIfunctions.stash_disbalance = stash_disbalance;
    function stash_overflow(actor) {
        let total = 0;
        for (const material of content_1.MaterialConfiguration.MATERIAL) {
            total += Math.max(0, actor.stash.get(material) - actor.ai_desired_stash.get(material));
        }
        return total;
    }
    AIfunctions.stash_overflow = stash_overflow;
    function trade_stash_weight(actor) {
        let total_weight = 0;
        for (const material of content_1.MaterialConfiguration.MATERIAL) {
            const data = content_1.MaterialStorage.get(material);
            total_weight += actor.trade_stash.get(material) * data.unit_size * data.density;
        }
        return total_weight;
    }
    AIfunctions.trade_stash_weight = trade_stash_weight;
    function food_weight(actor) {
        let total_weight = 0;
        for (const material of content_1.MaterialConfiguration.MATERIAL) {
            const data = content_1.MaterialStorage.get(material);
            if (character_conditions_1.CharacterCondition.can_eat(actor, data)) {
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
        return character.ai_price_buy_expectation[material];
    }
    AIfunctions.buy_price = buy_price;
    function sell_price(character, material) {
        return character.ai_price_sell_expectation[material];
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
        const output_price = price_norm_box(character, craft_1.CraftValues.output_bulk(character, craft), sell_price);
        const profit = output_price - input_price;
        return profit;
    }
    AIfunctions.craft_bulk_profitability = craft_bulk_profitability;
    function profitable_item_craft(character) {
        const result = [];
        for (const item of Object.values(crafts_storage_1.crafts_items)) {
            if (item.output.tag == "armour") {
                if (system_1.ItemOrders.count_armour_orders_of_type(character.cell_id, item.output.value) >= 3)
                    continue;
            }
            if (item.output.tag == "weapon") {
                if (system_1.ItemOrders.count_weapon_orders_of_type(character.cell_id, item.output.value) >= 3)
                    continue;
            }
            if (craft_1.CraftValues.durability(character, item) > 100) {
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
        let next_cell = system_2.MapSystem.find_path(actor.cell_id, target.cell_id);
        if (next_cell != undefined) {
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, actor, next_cell);
        }
        else {
            effects_1.Effect.enter_location(actor.id, target.id);
            update_price_beliefs(actor);
        }
    }
    AIfunctions.go_to_location = go_to_location;
    function check_local_demand_for_material(actor, material) {
        let demanded = 0;
        const demand = data_id_1.DataID.Cells.market_order_id_list(actor.cell_id).map(data_objects_1.Data.MarketOrders.from_id);
        for (const item of demand) {
            if ((item.material == material)
                && (item.typ == "buy")
            // || (item.price >= AIfunctions.sell_price(actor, material))
            ) {
                demanded += item.amount;
            }
        }
        return demanded;
    }
    AIfunctions.check_local_demand_for_material = check_local_demand_for_material;
    function check_local_supply_for_material(actor, material) {
        let supplied = 0;
        const demand = data_id_1.DataID.Cells.market_order_id_list(actor.cell_id).map(data_objects_1.Data.MarketOrders.from_id);
        for (const item of demand) {
            if ((item.material == material)
                && (item.typ == "sell")
            // || (item.price >= AIfunctions.buy_price(actor, material))
            ) {
                supplied += item.amount;
            }
        }
        return supplied;
    }
    AIfunctions.check_local_supply_for_material = check_local_supply_for_material;
    function update_price_beliefs(character) {
        let orders = data_id_1.DataID.Cells.market_order_id_list(character.cell_id);
        // initialisation
        // updating price beliefs as you go
        for (let item of orders) {
            let order = data_objects_1.Data.MarketOrders.from_id(item);
            if (order.owner_id == character.id) {
                if (order.typ == "buy") {
                    unbought_price_update(character, order.material, order.amount);
                }
                if (order.typ == "sell") {
                    unsold_price_update(character, order.material, order.amount);
                }
            }
            else {
                if (order.typ == "buy") {
                    seen_buy_order_price_update(character, order.material, order.amount, order.price);
                }
                if (order.typ == "sell") {
                    seen_sell_order_price_update(character, order.material, order.amount, order.price);
                }
            }
        }
        for (const material of content_1.MaterialConfiguration.MATERIAL) {
            character.ai_price_buy_log_precision[material] -= 0.001;
            character.ai_price_sell_log_precision[material] -= 0.001;
            update_sell_price(character, material);
            update_buy_price(character, material);
        }
    }
    AIfunctions.update_price_beliefs = update_price_beliefs;
    function unsold_price_update(character, material, times) {
        character.ai_price_buy_log_precision[material] -= 0.001 * times;
    }
    AIfunctions.unsold_price_update = unsold_price_update;
    function unbought_price_update(character, material, times) {
        character.ai_price_sell_log_precision[material] -= 0.001 * times;
    }
    AIfunctions.unbought_price_update = unbought_price_update;
    function seen_buy_order_price_update(character, material, times, seen_price) {
        if (seen_price >= character.ai_price_sell_expectation[material]) {
            character.ai_price_sell_log_precision[material] += 0.001 * times;
        }
        if (seen_price < character.ai_price_sell_expectation[material]) {
            character.ai_price_sell_log_precision[material] -= 0.001 * times;
        }
    }
    AIfunctions.seen_buy_order_price_update = seen_buy_order_price_update;
    function seen_sell_order_price_update(character, material, times, seen_price) {
        if (seen_price > character.ai_price_buy_expectation[material]) {
            character.ai_price_buy_log_precision[material] -= 0.001 * times;
        }
        if (seen_price <= character.ai_price_buy_expectation[material]) {
            character.ai_price_buy_log_precision[material] += 0.001 * times;
        }
    }
    AIfunctions.seen_sell_order_price_update = seen_sell_order_price_update;
    function update_sell_price(character, material) {
        const sign = Math.sign(character.ai_price_sell_log_precision[material]);
        const amplitude = Math.floor(Math.abs(character.ai_price_sell_log_precision[material]));
        if (amplitude > 2) {
            character.ai_price_sell_log_precision[material] -= sign;
            character.ai_price_sell_expectation[material] += sign;
        }
        validate_price(character, material);
    }
    AIfunctions.update_sell_price = update_sell_price;
    function update_buy_price(character, material) {
        const sign = Math.sign(character.ai_price_buy_log_precision[material]);
        const amplitude = Math.floor(Math.abs(character.ai_price_buy_log_precision[material]));
        if (amplitude > 2) {
            character.ai_price_buy_log_precision[material] -= sign;
            character.ai_price_buy_expectation[material] -= sign;
        }
        validate_price(character, material);
    }
    AIfunctions.update_buy_price = update_buy_price;
    function on_sale_price_update(character, material, times) {
        character.ai_price_sell_log_precision[material] += 0.05 * times;
    }
    AIfunctions.on_sale_price_update = on_sale_price_update;
    function on_buyment_price_update(character, material, times) {
        character.ai_price_buy_log_precision[material] += 0.05 * times;
    }
    AIfunctions.on_buyment_price_update = on_buyment_price_update;
    function validate_price(character, material) {
        if (character.ai_price_buy_expectation[material] < 1) {
            character.ai_price_buy_expectation[material] = 1;
        }
        if (character.ai_price_sell_expectation[material] < 1) {
            character.ai_price_sell_expectation[material] = 1;
        }
    }
    AIfunctions.validate_price = validate_price;
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
        for (let item of battles) {
            let battle = data_objects_1.Data.Battles.from_id(item);
            if (!(system_3.BattleSystem.battle_finished(battle))) {
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
        for (let item of battles) {
            let battle = data_objects_1.Data.Battles.from_id(item);
            if (!(system_3.BattleSystem.battle_finished(battle))) {
                let team = check_team_to_join(agent, battle);
                if (team == 'no_interest')
                    continue;
                else {
                    system_3.BattleSystem.add_figther(battle, agent, team, 100);
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

