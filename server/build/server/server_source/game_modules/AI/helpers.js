"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIhelper = exports.base_price = void 0;
const racial_hostility_1 = require("../races/racial_hostility");
const events_1 = require("../events/events");
const systems_communication_1 = require("../systems_communication");
const CraftBulk_1 = require("../craft/CraftBulk");
const materials_manager_1 = require("../manager_classes/materials_manager");
const basic_functions_1 = require("../calculations/basic_functions");
const CraftItem_1 = require("../craft/CraftItem");
function base_price(character, material) {
    switch (material) {
        case materials_manager_1.WOOD: {
            let cell = systems_communication_1.Convert.character_to_cell(character);
            if (cell.can_gather_wood())
                return 3;
            return 10;
        }
        case materials_manager_1.RAT_BONE:
            return 3;
        case materials_manager_1.RAT_SKIN:
            return 10;
        case materials_manager_1.WOOD:
            return 10;
        case materials_manager_1.ELODINO_FLESH:
            return 50;
        case materials_manager_1.MEAT:
            return 8;
    }
    return 50;
}
exports.base_price = base_price;
var AIhelper;
(function (AIhelper) {
    function enemies_in_cell(char) {
        let cell = systems_communication_1.Convert.character_to_cell(char);
        let a = cell.get_characters_list();
        for (let { id, name } of a) {
            let target_char = systems_communication_1.Convert.id_to_character(id);
            if ((0, racial_hostility_1.hostile)(char.race(), target_char.race())) {
                if (!target_char.in_battle() && !target_char.dead()) {
                    return target_char.id;
                }
            }
        }
        return -1;
    }
    AIhelper.enemies_in_cell = enemies_in_cell;
    function battles_in_cell(char) {
        let battles = [];
        let cell = systems_communication_1.Convert.character_to_cell(char);
        if (cell == undefined)
            return battles;
        let a = cell.get_characters_list();
        for (let { id, name } of a) {
            let target_char = systems_communication_1.Convert.id_to_character(id);
            if (target_char.in_battle() && !target_char.dead()) {
                battles.push(target_char.battle_id);
            }
        }
        return battles;
    }
    AIhelper.battles_in_cell = battles_in_cell;
    function check_battles_to_join(agent) {
        let battles = battles_in_cell(agent);
        for (let item of battles) {
            let battle = systems_communication_1.Convert.id_to_battle(item);
            if (!(battle.ended)) {
                let team = check_team_to_join(agent, battle);
                if (team == 'no_interest')
                    continue;
                else {
                    events_1.Event.join_battle(agent, battle, team);
                    return true;
                }
            }
        }
        return false;
    }
    AIhelper.check_battles_to_join = check_battles_to_join;
    function check_team_to_join(agent, battle, exclude) {
        let data = battle.heap.raw_data;
        let potential_team = -1;
        for (let item of data) {
            const target = systems_communication_1.Convert.unit_to_character(item);
            if (agent.race() == target.race() && (item.team != exclude) && (!target.dead())) {
                if (potential_team == 0)
                    continue;
                else
                    potential_team = item.team;
            }
        }
        if (potential_team == -1)
            return 'no_interest';
        return potential_team;
    }
    AIhelper.check_team_to_join = check_team_to_join;
    function price_norm(character, items_vector) {
        let norm = 0;
        for (let item of items_vector) {
            norm += item.amount * item.price;
        }
        return norm;
    }
    function price_norm_box(character, items_vector) {
        let norm = 0;
        for (let item of items_vector) {
            norm += item.amount * base_price(character, item.material);
        }
        return norm;
    }
    function buy_craft_inputs(character, budget, input) {
        // solve
        // sum (buy * base_price) < budget
        // (buy + stash) / input < 10
        let buy = [];
        // (buy) = (10 * input - stash) - find corner of buyment box
        for (let item of input) {
            const amount = (0, basic_functions_1.trim)(10 * item.amount - character.stash.get(item.material), 0, 50);
            buy.push({ material: item.material, amount: amount, price: base_price(character, item.material) });
        }
        // normalise (buy) with price metric down to budget
        let norm = price_norm(character, buy);
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
        const input_price = price_norm_box(character, craft.input);
        const estimated_output = (0, CraftBulk_1.output_bulk)(character, craft);
        let prices = [];
        for (let item of estimated_output) {
            prices.push({ material: item.material, price: Math.round(input_price * 2 / item.amount) });
        }
        return prices;
    }
    AIhelper.sell_prices_craft_bulk = sell_prices_craft_bulk;
    function sell_price_craft_item(character, craft) {
        const input_price = price_norm_box(character, craft.input);
        const estimated_quality = (0, CraftItem_1.durability)(character, craft);
        return Math.floor(input_price * 2 * estimated_quality / 100 + Math.random() * 10) + 1;
    }
    AIhelper.sell_price_craft_item = sell_price_craft_item;
})(AIhelper = exports.AIhelper || (exports.AIhelper = {}));
