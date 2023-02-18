"use strict";
// This file is an attempt to make a simple instruction for agents
Object.defineProperty(exports, "__esModule", { value: true });
const materials_manager_1 = require("../manager_classes/materials_manager");
var RatHunter;
(function (RatHunter) {
    function decide_state(character) {
        if ((character.get_fatigue() > 70) || (character.get_stress() > 30)) {
            return 3 /* HunterStates.Rest */;
        }
        if (character.stash.get(materials_manager_1.MEAT) > 0) {
            return 4 /* HunterStates.SellMeat */;
        }
        if (character.stash.get(materials_manager_1.RAT_SKIN) > 0) {
            return 5 /* HunterStates.SellSkin */;
        }
        if (character.stash.get(materials_manager_1.RAT_BONE) > 0) {
            return 6 /* HunterStates.SellBones */;
        }
        if (character.get_hp() < character.get_max_hp() * 0.8) {
            if ((character.stash.get(materials_manager_1.FOOD) == 0) && (character.savings.get() > 30)) {
                return 1 /* HunterStates.BuyFood */;
            }
            else if (character.stash.get(materials_manager_1.FOOD) > 0) {
                return 2 /* HunterStates.Eat */;
            }
        }
        return 0 /* HunterStates.FindRat */;
    }
    function decide_action(character) {
        const state = decide_state(character);
        switch (state) {
            case 1 /* HunterStates.BuyFood */: {
                break;
            }
            case 7 /* HunterStates.BuyWeapon */: {
                break;
            }
            case 2 /* HunterStates.Eat */: {
                break;
            }
            case 0 /* HunterStates.FindRat */: {
                break;
            }
            case 3 /* HunterStates.Rest */: {
                break;
            }
            case 6 /* HunterStates.SellBones */: {
                break;
            }
            case 4 /* HunterStates.SellMeat */: {
                break;
            }
            case 5 /* HunterStates.SellSkin */: {
                break;
            }
        }
    }
})(RatHunter || (RatHunter = {}));
