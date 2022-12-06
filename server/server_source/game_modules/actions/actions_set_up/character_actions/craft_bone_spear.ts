import { CharacterActionResponce } from "../../action_manager";
import { ARROW_BONE, RAT_BONE, WOOD } from "../../../manager_classes/materials_manager";
import { BASIC_BOW_ARGUMENT, BONE_DAGGER_ARGUMENT, BONE_SPEAR_ARGUMENT, WOODEN_MACE_ARGUMENT } from "../../../items/items_set_up";
import { Character } from "../../../character/character";
import { map_position } from "../../../types";
import { UserManagement } from "../../../client_communication/user_manager";
import { UI_Part } from "../../../client_communication/causality_graph";
import { Craft } from "../../../calculations/craft";
import { craft_bulk, craft_item } from "../../../craft/craft";

export const craft_bone_spear = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD)
            let tmp_2 = char.stash.get(RAT_BONE)
            if ((tmp > 2) && (tmp_2 > 3))  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(WOOD)
        let tmp_2 = char.stash.get(RAT_BONE)
        if ((tmp > 2) && (tmp_2 > 3)) { 
            char.stash.inc(WOOD, -3)
            char.stash.inc(RAT_BONE, -4)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
            craft_item(char, BONE_SPEAR_ARGUMENT, Craft.Durability.wood_item, 'woodwork', 2)
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}

export const craft_bone_arrow = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD)
            let tmp_2 = char.stash.get(RAT_BONE)
            if ((tmp >= 1) && (tmp_2 >= 10))  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(WOOD)
        let tmp_2 = char.stash.get(RAT_BONE)
        if ((tmp >= 1) && (tmp_2 >= 10)) { 
            char.stash.inc(WOOD, -1)
            char.stash.inc(RAT_BONE, -10)

            craft_bulk(char, ARROW_BONE, Craft.Amount.arrow, 'woodwork', 1)
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}

export const craft_wood_bow = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD)
            if ((tmp >= 3)) {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(WOOD)
        if ((tmp >= 3)) {
            char.stash.inc(WOOD, -3)
            craft_item(char, BASIC_BOW_ARGUMENT, Craft.Durability.wood_item, 'woodwork', 3)
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}

export const craft_wooden_mace = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD)
            if ((tmp >= 8)) {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(WOOD)
        if ((tmp >= 8)) {
            char.stash.inc(WOOD, -8)
            craft_item(char, WOODEN_MACE_ARGUMENT, Craft.Durability.wood_item, 'woodwork', 1)
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}

export const craft_bone_dagger = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(RAT_BONE)
            if ((tmp >= 15)) {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(RAT_BONE)
        if ((tmp >= 15)) {
            char.stash.inc(RAT_BONE, -15)
            craft_item(char, BONE_DAGGER_ARGUMENT, Craft.Durability.bone_item, 'bone_carving', 5)
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}