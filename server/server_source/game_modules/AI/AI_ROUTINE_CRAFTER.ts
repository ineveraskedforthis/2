import { Character } from "../character/character";
import { AmmunitionCraft } from "../craft/ammunition";
import { Cooking } from "../craft/cooking";
import { RAT_BONE, RAT_SKIN, WOOD } from "../manager_classes/materials_manager";
import { AItrade } from "./AI_SCRIPTED_VALUES";
import { AIactions } from "./AIactions";
import { rest_building, rest_outside } from "./actions";
import { base_price } from "./helpers";
import { tired } from "./triggers";

export function crafter_routine(character: Character) {
    if (character.in_battle()) return
    if (character.action != undefined) return
    if (character.is_player()) return
    if (character.current_building != undefined) return

    if (tired(character)) {
        let responce = rest_building(character, character.savings.get())
        if (!responce) {
            rest_outside(character)
            return
        }
        return
    }

    if ((character.skills.cooking > 40) || (character.perks.meat_master == true)) {
        AIactions.craft_bulk(character, Cooking.meat);
    }

    if ((character.skills.woodwork > 40) && (character.perks.fletcher == true)) {
        AIactions.craft_bulk(character, AmmunitionCraft.bone_arrow);
    }

    if ((character.perks.alchemist)) {
        AIactions.craft_bulk(character, Cooking.elodino);
    }

    if ((character.skills.woodwork > 40) && (character.perks.weapon_maker == true)) {
        AIactions.make_wooden_weapon(character, AItrade.buy_price_bulk(character, WOOD));
    }

    if ((character.skills.bone_carving > 40) && (character.perks.weapon_maker == true)) {
        AIactions.make_bone_weapon(character, AItrade.buy_price_bulk(character, RAT_BONE));
    }

    if ((character.skills.clothier > 40) && (character.perks.skin_armour_master == true)) {
        AIactions.make_armour(character, AItrade.buy_price_bulk(character, RAT_SKIN));
    }

    if ((character.skills.clothier > 40) && (character.perks.shoemaker == true)) {
        AIactions.make_boots(character, AItrade.buy_price_bulk(character, RAT_SKIN));
    }
}