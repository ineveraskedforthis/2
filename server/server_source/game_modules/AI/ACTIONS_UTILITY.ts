import { money } from "@custom_types/common";
import { CharacterAction } from "../actions/actions_00";
import { ActionManager } from "../actions/manager";
import { BattleSystem } from "../battle/system";
import { AImemory, AIstate } from "../character/AIstate";
import { Character } from "../character/character"
import { Convert } from "../systems_communication";
import { ForestPassiveRoutine, SteppePassiveRoutine, find_building_to_rest } from "./AI_ROUTINE_GENERIC";
import { AIhelper } from "./helpers";
import { Effect } from "../events/effects";
import { Data } from "../data";
import { ScriptedValue } from "../events/scripted_values";
import { MapSystem } from "../map/system";
import { buy, home_walk, loot, random_walk, rat_walk, remove_orders, sell_loot, update_price_beliefs, urban_walk } from "./ACTIONS_BASIC";
import { simple_constraints } from "./constraints";
import { ARROW_BONE, FOOD } from "../manager_classes/materials_manager";
import { AI_TRIGGER } from "./AI_TRIGGERS";
import { AI_RESERVE } from "./AI_CONSTANTS";
import { utimes } from "fs";
import { crafter_routine } from "./AI_ROUTINE_CRAFTER";
import { TraderRoutine } from "./AI_ROUTINE_URBAN_TRADER";

function rest_budget(character: Character) {
    let budget = character.savings.get()
    if (budget < 50) {
        budget = 0 as money
    }
    return (budget - 50) as money
}
function has_memory(character: Character, memory: AImemory) {
    return character.ai_memories.indexOf(memory) >= 0
}



type CampaignAction = {
    action: (character: Character) => void;
    utility: (character: Character) => number;
}

type ActionKeys = 
    'FIGHT'
    | 'REST'
    | 'RAT_PATROL'
    | 'SELL_LOOT'
    | 'EAT'
    | 'BUY_FOOD'
    | 'BUY_ARROWS'
    | 'RAT_WALK'
    | 'URBAN_WALK'
    | 'CRAFT'
    | 'TRADE'
    | 'STEPPE_WALK'
    | 'FOREST_WALK'


export const AI_ACTIONS: Record<ActionKeys, CampaignAction> = {
    FIGHT: {
        action : (character: Character) => {
            let target = AIhelper.enemies_in_cell(character)
            const target_char = Convert.id_to_character(target)
            if (target_char != undefined) {
                BattleSystem.start_battle(character, target_char)
                return
            }
        },

        utility: (character: Character) => {
            let target = AIhelper.enemies_in_cell(character)
            if (target == undefined) return 0
            return character.get_hp() / character.get_max_hp()
        }
    },

    REST: {
        action: (character: Character) => {
            character.ai_state = AIstate.GoToRest

            if (character.current_building != undefined) {
                let building = Data.Buildings.from_id(character.current_building)
                let tier = ScriptedValue.building_rest_tier(building.type, character)
                let fatigue_target = ScriptedValue.rest_target_fatigue(tier, building.durability, character.race)
                const stress_target = ScriptedValue.rest_target_stress(tier, building.durability, character.race)
                if ((fatigue_target + 1 >= character.get_fatigue()) && (stress_target + 1 >= character.get_stress())) {
                    Effect.leave_room(character.id)
                    character.ai_memories.push(AImemory.RESTED)
                }
                return
            }
            if (!AI_TRIGGER.at_home(character)) {
                home_walk(character)
                return
            } else {
                let building_to_rest = find_building_to_rest(character, rest_budget(character))
                if (building_to_rest == undefined) {
                    ActionManager.start_action(CharacterAction.REST, character, character.cell_id);
                    character.ai_memories.push(AImemory.RESTED)
                    return
                } 
                Effect.rent_room(character.id, building_to_rest)
            }
        },

        utility: (character: Character) => {
            if (has_memory(character, AImemory.RESTED)) return 0
            return (character.get_stress() + character.get_fatigue()) / 200
        }
    },

    RAT_PATROL: {
        action(character: Character) {
            character.ai_state = AIstate.Patrol
            let target = AIhelper.free_rats_in_cell(character)
            const target_char = Convert.id_to_character(target)
            if (target_char != undefined) {
                BattleSystem.start_battle(character, target_char)
            } else {
                ActionManager.start_action(CharacterAction.HUNT, character, character.cell_id)
                random_walk(character, simple_constraints) 
            }
        },

        utility(character: Character) {
            if (character.ai_map == 'rat_hunter') {
                return 0.4
            }
            return 0
        }
    },

    SELL_LOOT: {
        action: (character: Character) => {
            character.ai_state = AIstate.GoToMarket
            Effect.leave_room(character.id)
            if (AI_TRIGGER.at_home(character)) {
                update_price_beliefs(character)
                remove_orders(character)
                sell_loot(character)
            } else {
                home_walk(character)
            }
        },

        utility: (character: Character) => {
            if (character.ai_map == 'dummy') return 0
            return loot(character) / 20
        }
    },

    EAT: {
        action: (character: Character) => {
            ActionManager.start_action(CharacterAction.EAT, character, character.cell_id)
        },

        utility: (character: Character) => {
            if (character.stash.get(FOOD) < 1) return 0
            return 1 - character.get_hp() / character.get_max_hp()
        }
    },

    BUY_FOOD: {
        action: (character: Character) => {
            character.ai_state = AIstate.GoToMarket
            if (!AI_TRIGGER.at_home(character)) {
                home_walk(character)
                return
            }

            update_price_beliefs(character)
            buy(character, FOOD)
        },

        utility: (character: Character) => {
            if (!AI_TRIGGER.can_buy(character, FOOD, character.savings.get())) return 0
            return 1 - character.stash.get(FOOD) / AI_RESERVE.FOOD
        }
    },

    BUY_ARROWS: {
        action: (character: Character) => {
            character.ai_state = AIstate.GoToMarket
            if (!AI_TRIGGER.at_home(character)) {
                home_walk(character)
                return
            }

            update_price_beliefs(character)
            buy(character, ARROW_BONE)
        },

        utility: (character: Character) => {
            if (!AI_TRIGGER.can_buy(character, ARROW_BONE, character.savings.get())) return 0
            return 1 - character.stash.get(ARROW_BONE) / AI_RESERVE.ARROW_BONE
        }
    },

    RAT_WALK: {
        action: (character: Character) => {
            character.ai_state = AIstate.Patrol
            rat_walk(character, simple_constraints)
        },
        utility(character) {
            if (character.race != 'rat') return 0
            return 0.6
        },
    },

    URBAN_WALK: {
        action(character) {
            character.ai_state = AIstate.Patrol
            urban_walk(character)
        },

        utility(character) {
            if (character.ai_map == 'urban_guard') {
                return 0.5
            }

            return 0
        },
    },

    CRAFT: {
        action(character) {
            crafter_routine(character)
        },

        utility(character) {
            if (character.ai_map == 'dummy') return 0.8
            return 0
        }
    },

    TRADE: {
        action(character) {
            TraderRoutine(character)
        },

        utility(character) {
            if (character.ai_map == 'urban_trader') {
                return 0.8
            }

            return 0
        },        
    },

    STEPPE_WALK: {
        action(character) {
            SteppePassiveRoutine(character)
        },

        utility(character) {
            if (character.ai_map == 'steppe_walker_passive') {
                return 0.8
            }
            return 0
        }
    },

    FOREST_WALK: {
        action(character) {
            ForestPassiveRoutine(character)
        },

        utility(character) {
            if (character.ai_map == 'forest_walker') {
                return 0.8
            }
            return 0
        }
    }
}