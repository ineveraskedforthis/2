"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI = exports.CampaignAI = void 0;
const craft_rat_armour_1 = require("../actions/actions_set_up/character_actions/craft_rat_armour");
const action_manager_1 = require("../actions/action_manager");
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const system_1 = require("../map/system");
const helpers_1 = require("./helpers");
const events_1 = require("../events/events");
const system_2 = require("../market/system");
const market_1 = require("../events/market");
const craft_1 = require("../calculations/craft");
const basic_functions_1 = require("../calculations/basic_functions");
// function MAYOR_AI(mayor: Character) {
//     let faction = mayor.get_faction()
//     let territories = faction.get_territories_list()
//     for (let ter of territories)  {
//         if (ter.is_contested(faction)) {
//             let enemy = ter.get_largest_enemy_faction(faction)
//             mayor.create_quest({quest_tag: "extermination", target_tag: enemy.get_tag(), territory: ter.tag}, {reputation: 1, money:1})
//         }
//     }
// }
// export const AI = {
//     'major' : MAYOR_AI
// }
let dp = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
function forest_constraints(cell) {
    return (cell.development['urban'] < 1) && (cell.development['wild'] > 0);
}
function steppe_constraints(cell) {
    return (cell.development['urban'] < 1) && (cell.development['wild'] < 1);
}
var CampaignAI;
(function (CampaignAI) {
    // constructor(world:World) {
    //     this.world = world
    // }
    // path_finding_calculations() {
    // }
    // move_toward_colony(char: Character) {
    // }
    function random_walk(char, constraints) {
        let cell = systems_communication_1.Convert.character_to_cell(char);
        let possible_moves = [];
        for (let d of dp) {
            let tmp = [d[0] + cell.x, d[1] + cell.y];
            // let territory = this.world.get_territory(tmp[0], tmp[1])
            let target = system_1.MapSystem.coordinate_to_cell(tmp);
            if (target != undefined) {
                if (system_1.MapSystem.can_move(tmp) && constraints(target)) {
                    possible_moves.push(tmp);
                }
            }
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
            action_manager_1.ActionManager.start_action(action_manager_1.CharacterAction.MOVE, char, move_direction);
        }
    }
    CampaignAI.random_walk = random_walk;
    function decision(char) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return;
        }
        if (char.in_battle()) {
            return;
        }
        if (char.action != undefined) {
            return;
        }
        let responce = helpers_1.AIhelper.check_battles_to_join(char);
        if (responce)
            return;
        switch (char.archetype.ai_map) {
            case 'steppe_walker_agressive': {
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    action_manager_1.ActionManager.start_action(action_manager_1.CharacterAction.REST, char, [0, 0]);
                }
                else {
                    let target = helpers_1.AIhelper.enemies_in_cell(char);
                    const target_char = systems_communication_1.Convert.id_to_character(target);
                    if (target_char != undefined) {
                        events_1.Event.start_battle(char, target_char);
                    }
                    else {
                        random_walk(char, steppe_constraints);
                    }
                }
                break;
            }
            case 'steppe_walker_passive': {
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    action_manager_1.ActionManager.start_action(action_manager_1.CharacterAction.REST, char, [0, 0]);
                }
                else {
                    random_walk(char, steppe_constraints);
                }
                break;
            }
            case 'forest_walker': {
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    action_manager_1.ActionManager.start_action(action_manager_1.CharacterAction.REST, char, [0, 0]);
                }
                else {
                    random_walk(char, forest_constraints);
                }
                break;
            }
        }
        if ((char.get_fatigue() > 60) || (char.get_stress() > 40)) {
            action_manager_1.ActionManager.start_action(action_manager_1.CharacterAction.REST, char, [0, 0]);
            return;
        }
        if ((char.skills.cooking > 40) || (char.perks.meat_master == true)) {
            AI.cook_food(char);
        }
        if ((char.skills.woodwork > 40) || (char.perks.fletcher == true)) {
            AI.make_arrow(char);
        }
        if ((char.skills.clothier > 40) || (char.perks.skin_armour_master == true)) {
            AI.make_armour(char);
        }
    }
    CampaignAI.decision = decision;
})(CampaignAI = exports.CampaignAI || (exports.CampaignAI = {}));
var AI;
(function (AI) {
    function cook_food(character) {
        let prepared_meat = character.trade_stash.get(materials_manager_1.FOOD) + character.stash.get(materials_manager_1.FOOD);
        let resource = character.stash.get(materials_manager_1.MEAT);
        let food_in_stash = character.stash.get(materials_manager_1.FOOD);
        let base_buy_price = 5;
        // let base_sell_price = 10 as money
        const profit = 1.5;
        let sell_price = Math.round(base_buy_price * (1 + profit) / craft_1.Craft.Amount.Cooking.meat(character)) + 1;
        let savings = character.savings.get();
        // console.log("AI tick")
        // console.log(prepared_meat, resource, food_in_stash, savings)
        //  character.world.entity_manager.remove_orders(character)
        if ((resource < 5) && (savings > base_buy_price)) {
            system_2.BulkOrders.remove_by_condition(character, materials_manager_1.MEAT);
            // console.log(Math.floor(savings / base_buy_price), base_buy_price)
            market_1.EventMarket.buy(character, materials_manager_1.MEAT, Math.floor(savings / base_buy_price), base_buy_price);
        }
        if (prepared_meat < 10) {
            action_manager_1.ActionManager.start_action(action_manager_1.CharacterAction.COOK.MEAT, character, [0, 0]);
        }
        if (food_in_stash > 0) {
            system_2.BulkOrders.remove_by_condition(character, materials_manager_1.FOOD);
            market_1.EventMarket.sell(character, materials_manager_1.FOOD, food_in_stash, sell_price);
        }
    }
    AI.cook_food = cook_food;
    function make_arrow(character) {
        system_2.BulkOrders.remove_by_condition(character, materials_manager_1.WOOD);
        system_2.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_BONE);
        let arrows = character.trade_stash.get(materials_manager_1.ARROW_BONE) + character.stash.get(materials_manager_1.ARROW_BONE);
        let wood = character.stash.get(materials_manager_1.WOOD);
        let bones = character.stash.get(materials_manager_1.RAT_BONE);
        let savings = character.savings.get();
        let trade_savings = character.trade_savings.get();
        let reserve_units = Math.min(wood, bones / 10);
        let arrows_in_stash = character.stash.get(materials_manager_1.ARROW_BONE);
        let base_price_wood = 10;
        let cell = systems_communication_1.Convert.character_to_cell(character);
        if (cell.can_gather_wood())
            base_price_wood = 3;
        let base_price_bones = 3;
        let input_price = (base_price_wood + 10 * base_price_bones);
        let profit = 3;
        let sell_price = Math.floor(input_price * (1 + profit) / craft_1.Craft.Amount.arrow(character)) + 1;
        // bones_to_buy * b_p + wood_to_buy * w_p = savings
        // (bones_to_buy + bones) - 10 (wood_to_buy + wood) = 0
        // so
        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        // bones_to_buy       - wood_to_buy * 10             = -bones + 10 * wood
        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        // bones_to_buy * b_p - wood_to_buy * 10 b_p         = (-bones + 10 * wood) * b_p
        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        //                    - wood_to_buy * (10 b_p + w_p) = (-bones + 10 * wood) * b_p - savings
        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        //                    - wood_to_buy                  = ((-bones + 10 * wood) * b_p - savings) / (10 b_p + w_p)
        // bones_to_buy                                      = (savings - wood_to_buy * w_p) / b_p
        //                    - wood_to_buy                  = ((-bones + 10 * wood) * b_p - savings) / (10 b_p + w_p)
        // makes sense only if results are not negative
        if (reserve_units < 5) {
            let savings = character.savings.get();
            let wood_to_buy = -((-bones + 10 * wood) * base_price_bones - savings) / (10 * base_price_bones + base_price_wood);
            let bones_to_buy = (savings - wood_to_buy * base_price_wood) / base_price_bones;
            // console.log(savings, bones, wood)
            // console.log(wood_to_buy, bones_to_buy)
            if ((wood_to_buy >= 1) && (bones_to_buy >= 1)) {
                market_1.EventMarket.buy(character, materials_manager_1.WOOD, Math.floor(wood_to_buy), base_price_wood);
                market_1.EventMarket.buy(character, materials_manager_1.RAT_BONE, Math.floor(bones_to_buy), base_price_bones);
            }
            else if ((wood_to_buy >= 1) && (bones_to_buy < 1)) {
                market_1.EventMarket.buy(character, materials_manager_1.WOOD, Math.floor(savings / base_price_wood), base_price_wood);
            }
            else if ((wood_to_buy < 1) && (bones_to_buy >= 1)) {
                market_1.EventMarket.buy(character, materials_manager_1.RAT_BONE, Math.floor(savings / base_price_bones), base_price_bones);
            }
        }
        if (arrows < 100) {
            action_manager_1.ActionManager.start_action(action_manager_1.CharacterAction.CRAFT.BONE_ARROW, character, [0, 0]);
        }
        if (arrows_in_stash > 0) {
            system_2.BulkOrders.remove_by_condition(character, materials_manager_1.ARROW_BONE);
            arrows_in_stash = character.stash.get(materials_manager_1.ARROW_BONE);
            market_1.EventMarket.sell(character, materials_manager_1.ARROW_BONE, arrows_in_stash, sell_price);
        }
    }
    AI.make_arrow = make_arrow;
    function make_armour(character) {
        let base_price_skin = 10;
        let resource = character.stash.get(materials_manager_1.RAT_SKIN);
        let savings = character.savings.get();
        let skin_to_buy = Math.floor(savings / base_price_skin);
        console.log('armour');
        console.log(resource, savings, skin_to_buy);
        if (skin_to_buy > 5) {
            system_2.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_SKIN);
            market_1.EventMarket.buy(character, materials_manager_1.RAT_SKIN, (0, basic_functions_1.trim)(skin_to_buy, 0, 50), base_price_skin);
        }
        if (resource > craft_rat_armour_1.RAT_SKIN_ARMOUR_SKIN_NEEDED) {
            action_manager_1.ActionManager.start_action(action_manager_1.CharacterAction.CRAFT.RAT_ARMOUR, character, [0, 0]);
        }
        let data = character.equip.data.backpack.items;
        for (let [index, item] of Object.entries(data)) {
            if (item?.slot == 'body') {
                let price = Math.floor(base_price_skin * craft_rat_armour_1.RAT_SKIN_ARMOUR_SKIN_NEEDED * 1.5);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
        }
    }
    AI.make_armour = make_armour;
})(AI = exports.AI || (exports.AI = {}));
