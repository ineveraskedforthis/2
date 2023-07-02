"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_ACTIONS = void 0;
const actions_00_1 = require("../actions/actions_00");
const manager_1 = require("../actions/manager");
const system_1 = require("../battle/system");
const systems_communication_1 = require("../systems_communication");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const helpers_1 = require("./helpers");
const effects_1 = require("../events/effects");
const data_1 = require("../data");
const scripted_values_1 = require("../events/scripted_values");
const ACTIONS_BASIC_1 = require("./ACTIONS_BASIC");
const constraints_1 = require("./constraints");
const materials_manager_1 = require("../manager_classes/materials_manager");
const AI_TRIGGERS_1 = require("./AI_TRIGGERS");
const AI_CONSTANTS_1 = require("./AI_CONSTANTS");
const AI_ROUTINE_CRAFTER_1 = require("./AI_ROUTINE_CRAFTER");
const AI_ROUTINE_URBAN_TRADER_1 = require("./AI_ROUTINE_URBAN_TRADER");
function rest_budget(character) {
    let budget = character.savings.get();
    if (budget < 50) {
        budget = 0;
    }
    return (budget - 50);
}
function has_memory(character, memory) {
    return character.ai_memories.indexOf(memory) >= 0;
}
exports.AI_ACTIONS = {
    FIGHT: {
        action: (character) => {
            let target = helpers_1.AIhelper.enemies_in_cell(character);
            const target_char = systems_communication_1.Convert.id_to_character(target);
            if (target_char != undefined) {
                system_1.BattleSystem.start_battle(character, target_char);
                return;
            }
        },
        utility: (character) => {
            let target = helpers_1.AIhelper.enemies_in_cell(character);
            if (target == undefined)
                return 0;
            return character.get_hp() / character.get_max_hp();
        }
    },
    REST: {
        action: (character) => {
            character.ai_state = "go_to_rest" /* AIstate.GoToRest */;
            if (character.current_building != undefined) {
                let building = data_1.Data.Buildings.from_id(character.current_building);
                let tier = scripted_values_1.ScriptedValue.building_rest_tier(building.type, character);
                let fatigue_target = scripted_values_1.ScriptedValue.rest_target_fatigue(tier, building.durability, character.race);
                const stress_target = scripted_values_1.ScriptedValue.rest_target_stress(tier, building.durability, character.race);
                if ((fatigue_target + 1 >= character.get_fatigue()) && (stress_target + 1 >= character.get_stress())) {
                    effects_1.Effect.leave_room(character.id);
                    character.ai_memories.push("rested" /* AImemory.RESTED */);
                }
            }
            if (!AI_TRIGGERS_1.AI_TRIGGER.at_home(character)) {
                (0, ACTIONS_BASIC_1.home_walk)(character);
                return;
            }
            else {
                let building_to_rest = (0, AI_ROUTINE_GENERIC_1.find_building_to_rest)(character, rest_budget(character));
                if (building_to_rest == undefined) {
                    manager_1.ActionManager.start_action(actions_00_1.CharacterAction.REST, character, character.cell_id);
                    character.ai_memories.push("rested" /* AImemory.RESTED */);
                    return;
                }
                effects_1.Effect.rent_room(character.id, building_to_rest);
            }
        },
        utility: (character) => {
            if (has_memory(character, "rested" /* AImemory.RESTED */))
                return 0;
            return (character.get_stress() + character.get_fatigue()) / 200;
        }
    },
    RAT_PATROL: {
        action(character) {
            character.ai_state = "patrol" /* AIstate.Patrol */;
            let target = helpers_1.AIhelper.free_rats_in_cell(character);
            const target_char = systems_communication_1.Convert.id_to_character(target);
            if (target_char != undefined) {
                system_1.BattleSystem.start_battle(character, target_char);
            }
            else {
                manager_1.ActionManager.start_action(actions_00_1.CharacterAction.HUNT, character, character.cell_id);
                (0, ACTIONS_BASIC_1.random_walk)(character, constraints_1.simple_constraints);
            }
        },
        utility(character) {
            if (character.ai_map == 'rat_hunter') {
                return 0.4;
            }
            return 0;
        }
    },
    SELL_LOOT: {
        action: (character) => {
            character.ai_state = "go_to_market" /* AIstate.GoToMarket */;
            effects_1.Effect.leave_room(character.id);
            if (AI_TRIGGERS_1.AI_TRIGGER.at_home(character)) {
                (0, ACTIONS_BASIC_1.update_price_beliefs)(character);
                (0, ACTIONS_BASIC_1.remove_orders)(character);
                (0, ACTIONS_BASIC_1.sell_loot)(character);
            }
            else {
                (0, ACTIONS_BASIC_1.home_walk)(character);
            }
        },
        utility: (character) => {
            if (character.ai_map == 'dummy')
                return 0;
            return (0, ACTIONS_BASIC_1.loot)(character) / 20;
        }
    },
    EAT: {
        action: (character) => {
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.EAT, character, character.cell_id);
        },
        utility: (character) => {
            if (character.stash.get(materials_manager_1.FOOD) < 1)
                return 0;
            return 1 - character.get_hp() / character.get_max_hp();
        }
    },
    BUY_FOOD: {
        action: (character) => {
            character.ai_state = "go_to_market" /* AIstate.GoToMarket */;
            if (!AI_TRIGGERS_1.AI_TRIGGER.at_home(character)) {
                (0, ACTIONS_BASIC_1.home_walk)(character);
                return;
            }
            (0, ACTIONS_BASIC_1.update_price_beliefs)(character);
            (0, ACTIONS_BASIC_1.buy)(character, materials_manager_1.FOOD);
        },
        utility: (character) => {
            if (!AI_TRIGGERS_1.AI_TRIGGER.can_buy(character, materials_manager_1.FOOD, character.savings.get()))
                return 0;
            return 1 - character.stash.get(materials_manager_1.FOOD) / AI_CONSTANTS_1.AI_RESERVE.FOOD;
        }
    },
    BUY_ARROWS: {
        action: (character) => {
            character.ai_state = "go_to_market" /* AIstate.GoToMarket */;
            if (!AI_TRIGGERS_1.AI_TRIGGER.at_home(character)) {
                (0, ACTIONS_BASIC_1.home_walk)(character);
                return;
            }
            (0, ACTIONS_BASIC_1.update_price_beliefs)(character);
            (0, ACTIONS_BASIC_1.buy)(character, materials_manager_1.ARROW_BONE);
        },
        utility: (character) => {
            if (!AI_TRIGGERS_1.AI_TRIGGER.can_buy(character, materials_manager_1.ARROW_BONE, character.savings.get()))
                return 0;
            return 1 - character.stash.get(materials_manager_1.ARROW_BONE) / AI_CONSTANTS_1.AI_RESERVE.ARROW_BONE;
        }
    },
    RAT_WALK: {
        action: (character) => {
            (0, ACTIONS_BASIC_1.rat_walk)(character, constraints_1.simple_constraints);
        },
        utility(character) {
            if (character.race != 'rat')
                return 0;
            return 0.6;
        },
    },
    URBAN_WALK: {
        action(character) {
            character.ai_state = "patrol" /* AIstate.Patrol */;
            (0, ACTIONS_BASIC_1.urban_walk)(character);
        },
        utility(character) {
            if (character.ai_map == 'urban_guard') {
                return 0.5;
            }
            return 0;
        },
    },
    CRAFT: {
        action(character) {
            (0, AI_ROUTINE_CRAFTER_1.crafter_routine)(character);
        },
        utility(character) {
            if (character.ai_map == 'dummy')
                return 0.8;
            return 0;
        }
    },
    TRADE: {
        action(character) {
            (0, AI_ROUTINE_URBAN_TRADER_1.TraderRoutine)(character);
        },
        utility(character) {
            if (character.ai_map == 'urban_trader') {
                return 0.8;
            }
            return 0;
        },
    },
    STEPPE_WALK: {
        action(character) {
            (0, AI_ROUTINE_GENERIC_1.SteppePassiveRoutine)(character);
        },
        utility(character) {
            if (character.ai_map == 'steppe_walker_passive') {
                return 0.8;
            }
            return 0;
        }
    },
    FOREST_WALK: {
        action(character) {
            (0, AI_ROUTINE_GENERIC_1.ForestPassiveRoutine)(character);
        },
        utility(character) {
            if (character.ai_map == 'forest_walker') {
                return 0.8;
            }
            return 0;
        }
    }
};
