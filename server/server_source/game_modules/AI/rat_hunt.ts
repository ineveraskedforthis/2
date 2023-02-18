// This file is an attempt to make a simple instruction for agents

import { Character } from "../character/character";
import { FOOD, MEAT, RAT_BONE, RAT_SKIN } from "../manager_classes/materials_manager";

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
        const state = decide_state(character)
        switch(state) {
            case HunterStates.BuyFood: {
                break
            }
            case HunterStates.BuyWeapon: {
                break
            }
            case HunterStates.Eat: {
                break
            }
            case HunterStates.FindRat: {
                break
            }
            case HunterStates.Rest: {
                break
            }
            case HunterStates.SellBones: {
                break
            }
            case HunterStates.SellMeat: {
                break
            }
            case HunterStates.SellSkin: {
                break
            }
        }
    }
}