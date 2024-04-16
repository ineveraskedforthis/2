import { money } from "@custom_types/common";
import { CharacterAction } from "../actions/actions_00";
import { ActionManager } from "../actions/manager";
import { BattleSystem } from "../battle/system";
import { AImemory, AIstate } from "../character/AIstate";
import { Character } from "../character/character"
import { ForestPassiveRoutine, SteppePassiveRoutine } from "./AI_ROUTINE_GENERIC";
import { AIhelper } from "./helpers";
import { ScriptedValue } from "../events/scripted_values";
import { buy, coast_walk, home_walk, loot, random_walk, rat_walk, remove_orders, sell_loot, sell_material, update_price_beliefs, urban_walk } from "./ACTIONS_BASIC";
import { simple_constraints } from "./constraints";
import { AI_TRIGGER } from "./AI_TRIGGERS";
import { AI_RESERVE } from "./AI_CONSTANTS";
import { crafter_routine } from "./AI_ROUTINE_CRAFTER";
import { TraderRoutine } from "./AI_ROUTINE_URBAN_TRADER";
import { Data } from "../data/data_objects";
import { MATERIAL } from "@content/content";
import { CharacterSystem } from "../character/system";
import { CHANGE_REASON, Effect } from "../events/effects";

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
    | 'FISH'
    | 'SELL_FISH'
    | 'CUT_WOOD'
    | 'SELL_WOOD'


export const AI_ACTIONS: Record<ActionKeys, CampaignAction> = {
    FIGHT: {
        action : (character: Character) => {
            let target = AIhelper.enemies_in_cell(character)
            if (target != undefined) {
                const target_char = Data.Characters.from_id(target)
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
            let location = Data.Locations.from_id(character.location_id)
            let tier = ScriptedValue.rest_tier(character, location)
            let fatigue_target = ScriptedValue.rest_target_fatigue(tier, ScriptedValue.max_devastation - location.devastation, character.race)
            const stress_target = ScriptedValue.rest_target_stress(tier, ScriptedValue.max_devastation - location.devastation, character.race)
            if ((fatigue_target + 1 >= character.get_fatigue()) && (stress_target + 1 >= character.get_stress())) {
                character.ai_memories.push(AImemory.RESTED)
            }
            return
        },

        utility: (character: Character) => {
            if (has_memory(character, AImemory.RESTED)) return 0
            if (character.ai_state == AIstate.GoToRest) return 1
            return (character.get_stress() + character.get_fatigue()) / 200
        }
    },

    RAT_PATROL: {
        action(character: Character) {
            character.ai_state = AIstate.Patrol
            let target = AIhelper.free_rats_in_cell(character);
            if (target != undefined) {
                const target_char = Data.Characters.from_id(target)
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
            if (AI_TRIGGER.at_home(character)) {
                update_price_beliefs(character)
                remove_orders(character)
                sell_loot(character)
            } else {
                home_walk(character)
            }
        },

        utility: (character: Character) => {
            if (character.ai_map == 'crafter') return 0
            return loot(character) / 20
        }
    },

    EAT: {
        action: (character: Character) => {
            if (character.stash.get(MATERIAL.MEAT_RAT_FRIED) > 0) {
                Effect.Change.hp(character, 25, CHANGE_REASON.EATING)
                character.stash.inc(MATERIAL.MEAT_RAT_FRIED, -1)
            }
        },

        utility: (character: Character) => {
            if (character.stash.get(MATERIAL.MEAT_RAT_FRIED) < 1) return 0
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
            buy(character, MATERIAL.MEAT_RAT_FRIED)
        },

        utility: (character: Character) => {
            if (!AI_TRIGGER.can_buy(character, MATERIAL.MEAT_RAT_FRIED, character.savings.get())) return 0
            return 1 - character.stash.get(MATERIAL.MEAT_RAT_FRIED) / AI_RESERVE.FOOD
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
            buy(character, MATERIAL.ARROW_BONE)
        },

        utility: (character: Character) => {
            if (!AI_TRIGGER.can_buy(character, MATERIAL.ARROW_BONE, character.savings.get())) return 0
            return 1 - character.stash.get(MATERIAL.ARROW_BONE) / AI_RESERVE.ARROW_BONE
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
            character.ai_state = AIstate.Craft
            crafter_routine(character)
        },

        utility(character) {
            if (character.ai_map == 'crafter') return 0.8
            return 0
        }
    },

    TRADE: {
        action(character) {
            // character.ai_state = AIstate.Trading
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
            character.ai_state = AIstate.Patrol
            SteppePassiveRoutine(character)
        },

        utility(character) {
            if (character.ai_map == 'nomad') {
                return 0.8
            }
            return 0
        }
    },

    FOREST_WALK: {
        action(character) {
            character.ai_state = AIstate.Patrol
            ForestPassiveRoutine(character)
        },

        utility(character) {
            if (character.ai_map == 'forest_dweller') {
                return 0.8
            }
            return 0
        }
    },

    FISH: {
        action(character) {
            character.ai_state = AIstate.Patrol
            if (Data.Locations.from_id(character.location_id).fish > 0) {
                ActionManager.start_action(CharacterAction.FISH, character, character.cell_id)
            } else {
                coast_walk(character)
            }
        },

        utility(character) {
            if (character.ai_map == 'fisherman') return 0.5
            return 0
        }
    },

    SELL_FISH: {
        action(character) {
            character.ai_state = AIstate.GoToMarket
            if (AI_TRIGGER.at_home(character)) {
                remove_orders(character)
                update_price_beliefs(character)
                sell_material(character, MATERIAL.FISH_OKU)
            } else {
                home_walk(character)
            }
        },

        utility(character) {
            if (character.ai_map == 'crafter') return 0
            if (character.trade_stash.get(MATERIAL.FISH_OKU) > 0) return 1
            return character.stash.get(MATERIAL.FISH_OKU) / 20
        }
    },

    CUT_WOOD: {
        action(character) {
            character.ai_state = AIstate.Patrol
            if (Data.Locations.from_id(character.location_id).forest == 0) {
                random_walk(character, simple_constraints)
                return
            }
            ActionManager.start_action(CharacterAction.GATHER_WOOD, character, character.cell_id)
        },

        utility(character) {
            if (character.ai_map == 'lumberjack') return 0.7
            return 0
        }
    },

    SELL_WOOD: {
        action(character) {
            character.ai_state = AIstate.GoToMarket
            if (AI_TRIGGER.at_home(character)) {
                remove_orders(character)
                update_price_beliefs(character)
                sell_material(character, MATERIAL.WOOD_RED)
            } else {
                home_walk(character)
            }
        },

        utility(character) {
            if (character.ai_map == 'crafter') return 0
            if (character.trade_stash.get(MATERIAL.WOOD_RED) > 0) return 1
            return character.stash.get(MATERIAL.WOOD_RED) / 40
        }
    }
}