"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIhelper = void 0;
const systems_communication_1 = require("../systems_communication");
const CraftBulk_1 = require("../craft/CraftBulk");
const basic_functions_1 = require("../calculations/basic_functions");
const CraftItem_1 = require("../craft/CraftItem");
const AI_SCRIPTED_VALUES_1 = require("./AI_SCRIPTED_VALUES");
const data_1 = require("../data");
const TRIGGERS_1 = require("../battle/TRIGGERS");
const system_1 = require("../battle/system");
const SYSTEM_REPUTATION_1 = require("../SYSTEM_REPUTATION");
const damage_types_1 = require("../damage_types");
const base_values_1 = require("../items/base_values");
var AIhelper;
(function (AIhelper) {
    function enemies_in_cell(character) {
        let a = data_1.Data.Cells.get_characters_list_from_cell(character.cell_id);
        for (let id of a) {
            let target_char = systems_communication_1.Convert.id_to_character(id);
            if ((0, SYSTEM_REPUTATION_1.is_enemy_characters)(character, target_char)) {
                if (!target_char.dead()) {
                    return target_char.id;
                }
            }
            // if (hostile(char.race, target_char.race)) {
            //     if (!target_char.dead()) {
            //         return target_char.id
            //     }                
            // }
        }
        return undefined;
    }
    AIhelper.enemies_in_cell = enemies_in_cell;
    function free_rats_in_cell(char) {
        let cell = systems_communication_1.Convert.character_to_cell(char);
        let a = data_1.Data.Cells.get_characters_list_from_cell(char.cell_id);
        for (let id of a) {
            let target_char = systems_communication_1.Convert.id_to_character(id);
            if (target_char.race == 'rat') {
                if (!target_char.in_battle() && !target_char.dead()) {
                    return target_char.id;
                }
            }
        }
        return undefined;
    }
    AIhelper.free_rats_in_cell = free_rats_in_cell;
    function battles_in_cell(char) {
        let battles = [];
        let cell = systems_communication_1.Convert.character_to_cell(char);
        if (cell == undefined)
            return battles;
        let a = data_1.Data.Cells.get_characters_list_from_cell(char.cell_id);
        for (let id of a) {
            let target_char = systems_communication_1.Convert.id_to_character(id);
            const battle_id = target_char.battle_id;
            if ((battle_id != undefined) && !target_char.dead()) {
                battles.push(battle_id);
            }
        }
        return battles;
    }
    AIhelper.battles_in_cell = battles_in_cell;
    function check_battles_to_join(agent) {
        let battles = battles_in_cell(agent);
        // console.log(battles)
        for (let item of battles) {
            let battle = systems_communication_1.Convert.id_to_battle(item);
            if (!(system_1.BattleSystem.battle_finished(battle))) {
                let team = check_team_to_join(agent, battle);
                if (team == 'no_interest')
                    continue;
                else {
                    system_1.BattleSystem.add_figther(battle, agent, team);
                    return true;
                }
            }
        }
        return false;
    }
    AIhelper.check_battles_to_join = check_battles_to_join;
    function check_team_to_join(agent, battle, exclude) {
        let data = Object.values(battle.heap.data);
        let potential_team = -1;
        for (let item of data) {
            const target = systems_communication_1.Convert.unit_to_character(item);
            if (TRIGGERS_1.BattleTriggers.is_friend(agent, target) && (item.team != exclude)) {
                if (potential_team == 0)
                    continue;
                else
                    potential_team = item.team;
            }
        }
        if (potential_team == -1)
            return 'no_interest';
        if (TRIGGERS_1.BattleTriggers.safe_expensive(battle))
            return 'no_interest';
        return potential_team;
    }
    AIhelper.check_team_to_join = check_team_to_join;
    function buy_craft_inputs(character, budget, input) {
        // solve
        // sum (buy * base_price) < budget
        // (buy + stash) / input < 10
        let buy = [];
        // (buy) = (10 * input - stash) - find corner of buyment box
        for (let item of input) {
            const amount = (0, basic_functions_1.trim)(10 * item.amount - character.stash.get(item.material), 0, 9999);
            buy.push({ material: item.material, amount: amount, price: AI_SCRIPTED_VALUES_1.AItrade.buy_price_bulk(character, item.material) });
        }
        // normalise (buy) with price metric down to budget
        let norm = AI_SCRIPTED_VALUES_1.AItrade.price_norm(character, buy);
        if (norm < 1)
            norm = 1;
        const multiplier = budget / norm;
        for (let item of buy) {
            item.amount = Math.floor(item.amount * multiplier);
        }
        return buy;
    }
    AIhelper.buy_craft_inputs = buy_craft_inputs;
    function sell_prices_craft_bulk(character, craft) {
        const input_price = AI_SCRIPTED_VALUES_1.AItrade.price_norm_box(character, craft.input, AI_SCRIPTED_VALUES_1.AItrade.buy_price_bulk);
        const estimated_output = (0, CraftBulk_1.output_bulk)(character, craft);
        let prices = [];
        for (let item of estimated_output) {
            const price = Math.round(Math.max(input_price * 2 / item.amount, AI_SCRIPTED_VALUES_1.AItrade.sell_price_bulk(character, item.material)));
            prices.push({ material: item.material, price: price });
        }
        return prices;
    }
    AIhelper.sell_prices_craft_bulk = sell_prices_craft_bulk;
    function sell_price_craft_item(character, craft) {
        // const input_price = AItrade.price_norm_box(character, craft.input, AItrade.buy_price_bulk)
        const estimated_quality = (0, CraftItem_1.durability)(character, craft);
        return sell_price_item(character, (0, CraftItem_1.create_item)(craft.output_model, craft.output_affixes, estimated_quality), estimated_quality);
    }
    AIhelper.sell_price_craft_item = sell_price_craft_item;
    function sell_price_item(character, item, durability) {
        let resists = damage_types_1.DmgOps.total((0, base_values_1.base_resists)(item.model_tag));
        let damage = damage_types_1.DmgOps.total((0, base_values_1.base_damage)(item.model_tag));
        // let min_price = AItrade.price_norm_box(character, crafts_items[tag].input, AItrade.buy_price_bulk)
        return Math.floor(5 * ((resists + damage) * durability / 100 + Math.random() * 50)) + 1;
    }
    AIhelper.sell_price_item = sell_price_item;
})(AIhelper = exports.AIhelper || (exports.AIhelper = {}));
