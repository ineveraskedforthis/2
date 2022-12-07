import { CharacterActionResponce } from "../../action_manager";
import { ARROW_BONE, RAT_BONE, WOOD } from "../../../manager_classes/materials_manager";
import { Character } from "../../../character/character";
import { map_position } from "../../../types";
import { Craft } from "../../../calculations/craft";
import { craft_bulk } from "../../../craft/craft";

export const ARROW_TIER = 10

export const craft_bone_arrow = {
    duration(char: Character) {
        return 0.5;
    },

    check: function (char: Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD);
            let tmp_2 = char.stash.get(RAT_BONE);
            if ((tmp >= 1) && (tmp_2 >= 10)) {
                return CharacterActionResponce.OK;
            }
            return CharacterActionResponce.NO_RESOURCE;
        }
        return CharacterActionResponce.IN_BATTLE;
    },

    result: function (char: Character, data: map_position) {
        let tmp = char.stash.get(WOOD);
        let tmp_2 = char.stash.get(RAT_BONE);
        if ((tmp >= 1) && (tmp_2 >= 10)) {
            char.stash.inc(WOOD, -1);
            char.stash.inc(RAT_BONE, -10);

            craft_bulk(char, ARROW_BONE, Craft.Amount.arrow, 'woodwork', 10);
        }
    },

    start: function (char: Character, data: map_position) {
    },
};
