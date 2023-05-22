import { CharacterActionResponce } from "../CharacterActionResponce";
import { FISH, MEAT, RAT_SKIN } from "../manager_classes/materials_manager";
import type { Character } from "../character/character";
import { Convert } from "../systems_communication";
import { map_position } from "../types";
import { UserManagement } from "../client_communication/user_manager";
import { UI_Part } from "../client_communication/causality_graph";
import { Event } from "../events/events";
import { Effect } from "../events/effects";
import { MapSystem } from "../map/system";


export const hunt = {
    duration(char: Character) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.hunt) / 100;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            if (MapSystem.can_hunt(char.cell_id)) {
                return CharacterActionResponce.OK
            } else {
                return CharacterActionResponce.NO_RESOURCE
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let skill = char.skills.hunt
        let skinning = char.skills.skinning
        Effect.Change.fatigue(char, 10)

        let amount_meat = Math.floor(skill / 10) + 1
        let amount_skin = Math.max(Math.floor(skill / 20))

        if (Math.random() < 0.1) {
            amount_meat += 10
            amount_skin += 1
        }

        
        if (Math.random() * Math.random() > skill / 100) {
            Effect.Change.skill(char, 'hunt', 1)
            Effect.Change.stress(char, 1)
        }

        if (amount_skin * Math.random() > skinning / 20) {
            Effect.Change.skill(char, 'skinning', 1)
        }

        Event.change_stash(char, MEAT, amount_meat)
        Event.change_stash(char, RAT_SKIN, amount_skin)
    },

    start:  function(char:Character, data: map_position) {
    },
}

export const fish = {
    duration(char: Character) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.fishing) / 100;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            if (MapSystem.can_fish(char.cell_id)) {
                return CharacterActionResponce.OK
            } else {
                return CharacterActionResponce.NO_RESOURCE
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let skill = char.skills.fishing

        Effect.Change.fatigue(char, 10)

        let amount = Math.floor(skill / 20) + 1

        if (Math.random() < 0.01) {
            amount += 10
        }

        if (Math.random() < 0.0001) {
            amount += 100
        }
        
        if (Math.random() * Math.random() > skill / 100) {
            Effect.Change.skill(char, 'fishing', 1)
            Effect.Change.stress(char, 1)
        }

        Event.change_stash(char, FISH, amount)
    },

    start:  function(char:Character, data: map_position) {
    },
}