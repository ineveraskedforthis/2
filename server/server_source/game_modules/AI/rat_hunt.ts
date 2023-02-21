// This file is an attempt to make a simple instruction for agents

import { ActionManager } from "../actions/action_manager";
import { CharacterAction } from "../action_types";
import { Character } from "../character/character";
import { Event } from "../events/events";
import { EventMarket } from "../events/market";
import { FOOD, MEAT, RAT_BONE, RAT_SKIN } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { money } from "../types";
import { CampaignAI } from "./ai_manager";
import { AIhelper, base_price } from "./helpers";

const enum HunterStates {
    FindRat,
    BuyFood,
    Eat,
    Rest,
    SellMeat,
    SellSkin,
    SellBones,
    BuyWeapon
}

namespace RatHunter {
    function decide_state(character: Character):HunterStates {
        if ((character.get_fatigue() > 70) || (character.get_stress() > 30)) {
            return HunterStates.Rest
        }
        if (character.stash.get(MEAT) > 0) {
            return HunterStates.SellMeat
        }
        if (character.stash.get(RAT_SKIN) > 0) {
            return HunterStates.SellSkin
        }
        if (character.stash.get(RAT_BONE) > 0) {
            return HunterStates.SellBones
        }
        if (character.get_hp() < character.get_max_hp() * 0.8) {
            if ((character.stash.get(FOOD) == 0) && (character.savings.get() > 30)) {
                return HunterStates.BuyFood
            } else if (character.stash.get(FOOD) > 0) {
                return HunterStates.Eat
            }
        }
        return HunterStates.FindRat
    }
    
    function decide_action(character: Character) {
        if (character.action != undefined) {
            return
        }

        const state = decide_state(character)
        switch(state) {
            case HunterStates.BuyFood: {
                break
            }
            case HunterStates.BuyWeapon: {
                break
            }
            case HunterStates.Eat: {
                ActionManager.start_action(CharacterAction.EAT, character, [0, 0])
                break
            }
            case HunterStates.FindRat: {
                let target = AIhelper.free_rats_in_cell(character)
                const target_char = Convert.id_to_character(target)
                if (target_char != undefined) {
                    Event.start_battle(character, target_char)
                    break
                }

                CampaignAI.random_walk(character, (cell) => {return true}) 
                break
            }
            case HunterStates.Rest: {
                ActionManager.start_action(CharacterAction.REST, character, [0, 0])
                break
            }
            case HunterStates.SellBones: {
                EventMarket.sell(
                    character, 
                    RAT_BONE, 
                    character.stash.get(RAT_BONE), 
                    base_price(character, RAT_BONE) - 1 as money
                )
                break
            }
            case HunterStates.SellMeat: {
                EventMarket.sell(
                    character, 
                    MEAT, 
                    character.stash.get(MEAT), 
                    base_price(character, MEAT) - 1 as money
                )
                break
            }
            case HunterStates.SellSkin: {
                EventMarket.sell(
                    character, 
                    RAT_SKIN, 
                    character.stash.get(RAT_SKIN), 
                    base_price(character, RAT_SKIN) - 1 as money
                )
                break
            }
        }
    }
}