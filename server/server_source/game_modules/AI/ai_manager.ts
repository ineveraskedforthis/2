import type { Character } from "../character/character"
import { ActionManager } from "../actions/action_manager";
import { CharacterAction } from "../action_types";
import { RAT_BONE, RAT_SKIN, WOOD } from "../manager_classes/materials_manager";
import { AIhelper, base_price } from "./helpers";
import { Cooking } from "../craft/cooking";
import { AmmunitionCraft } from "../craft/ammunition";
import { RatHunterRoutine } from "./AI_ROUTINE_RAT_HUNT";
import { AIactions } from "./AIactions";
import { RatRoutine } from "./AI_ROUTINE_RAT";
import { SteppeAgressiveRoutine, SteppePassiveRoutine, ForestPassiveRoutine } from "./AI_ROUTINE_GENERIC";
import { tired } from "./triggers";

export namespace CampaignAI {
    export function decision(char: Character) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return
        }

        if (char.in_battle()) {
            return
        }

        if (char.action != undefined) {
            return
        }

        let responce = AIhelper.check_battles_to_join(char)
        if (responce) return;

        if (char.race() == 'rat') {
            RatRoutine(char)
            return
        } 

        switch(char.archetype.ai_map) {
            case "steppe_walker_agressive":{SteppeAgressiveRoutine(char);break}
            case "dummy":{break}
            case "steppe_walker_passive":{SteppePassiveRoutine(char);break}
            case "forest_walker":{ForestPassiveRoutine(char);break;}
            case "rat_hunter":{RatHunterRoutine(char);break}
        }

        if (tired(char)) {
            ActionManager.start_action(CharacterAction.REST, char, [0, 0])
            return
        }

        decide_craft(char);
    }
    

    function decide_craft(char: Character) {
        if ((char.skills.cooking > 40) || (char.perks.meat_master == true)) {
            AIactions.craft_bulk(char, Cooking.meat);
        }

        if ((char.skills.woodwork > 40) && (char.perks.fletcher == true)) {
            AIactions.craft_bulk(char, AmmunitionCraft.bone_arrow);
        }

        if ((char.perks.alchemist)) {
            AIactions.craft_bulk(char, Cooking.elodino);
        }

        if ((char.skills.woodwork > 40) && (char.perks.weapon_maker == true)) {
            AIactions.make_wooden_weapon(char, base_price(char, WOOD));
        }

        if ((char.skills.bone_carving > 40) && (char.perks.weapon_maker == true)) {
            AIactions.make_bone_weapon(char, base_price(char, RAT_BONE));
        }

        if ((char.skills.clothier > 40) && (char.perks.skin_armour_master == true)) {
            AIactions.make_armour(char, base_price(char, RAT_SKIN));
        }

        if ((char.skills.clothier > 40) && (char.perks.shoemaker == true)) {
            AIactions.make_boots(char, base_price(char, RAT_SKIN));
        }
    }
}