import type { Character } from "../character/character"
import { AIhelper } from "./helpers";
import { RatHunterRoutine } from "./AI_ROUTINE_RAT_HUNT";
import { RatRoutine } from "./AI_ROUTINE_RAT";
import { SteppeAgressiveRoutine, SteppePassiveRoutine, ForestPassiveRoutine } from "./AI_ROUTINE_GENERIC";
import { crafter_routine } from "./AI_ROUTINE_CRAFTER";
import { TraderRoutine } from "./AI_ROUTINE_URBAN_TRADER";
import { GuardUrbanRoutine } from "./AI_ROUTINE_GUARD";

export namespace CampaignAI {
    export function decision(character: Character) {
        // console.log(character.misc.ai_tag)
        if (character.is_player()) {
            return
        }
        if (character.in_battle()) {
            return
        }
        if (character.action != undefined) {
            return
        }

        let responce = AIhelper.check_battles_to_join(character)
        if (responce) return;

        if (character.race() == 'rat') {
            RatRoutine(character)
            return
        } 

        // console.log(character.archetype.ai_map)

        switch(character.archetype.ai_map) {
            case "steppe_walker_agressive":{SteppeAgressiveRoutine(character);break}
            case "dummy":{break}
            case "steppe_walker_passive":{SteppePassiveRoutine(character);break}
            case "forest_walker":{ForestPassiveRoutine(character);break;}
            case "rat_hunter":{RatHunterRoutine(character);break}
            case "urban_trader":{TraderRoutine(character);break}
            case "urban_guard":{GuardUrbanRoutine(character);break}
        }

        if (character.archetype.ai_map == 'dummy') {
            crafter_routine(character)
        }
    }
}