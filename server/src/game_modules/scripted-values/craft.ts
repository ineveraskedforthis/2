import { MaterialStorage, MATERIAL_CATEGORY, ArmourStorage, EQUIP_SLOT } from "@content/content";
import { CraftBulkTemplate, CraftItemTemplate, box } from "@custom_types/inventory";
import { trim } from "../calculations/basic_functions";
import { Character } from "../data/entities/character";
import { CharacterValues } from "./character";
import { MAX_SKILL_MULTIPLIER_BULK, skill_to_ratio } from "../craft/helpers";

export namespace CraftValues {
    function base_durability(skill: number, difficulty: number): number {
        const base = Math.round(skill / difficulty * 100);
        return trim(base, 5, 150);
    }
    function bonus_durability(character: Character, craft: CraftItemTemplate) {
        let durability = 0;
        let skin_flag = false;
        let bone_flag = false;
        let flesh_flag = false;

        for (let item of craft.input) {
            const material = MaterialStorage.get(item.material);
            if (material.category == MATERIAL_CATEGORY.SKIN) skin_flag = true;
            if (material.category == MATERIAL_CATEGORY.LEATHER) skin_flag = true;
            if (material.category == MATERIAL_CATEGORY.BONE) bone_flag = true;
            if (material.category == MATERIAL_CATEGORY.MEAT) flesh_flag = true;
        }

        const template = {
            model_tag: craft.output,
            affixes: craft.output_affixes
        };


        if (craft.output.tag == "weapon") {
            if (character._perks.weapon_maker)
                durability += 10;
        } else {
            const data = ArmourStorage.get(craft.output.value);
            if (character._perks.skin_armour_master && skin_flag)
                durability += 20;
            if (character._perks.shoemaker && (data.slot == EQUIP_SLOT.BOOTS)) {
                durability += 20;
            }
        }

        return durability;
    }

    export function durability(character: Character, craft: CraftItemTemplate): number {
        // calculate base durability as average
        let durability = 0;
        for (let item of craft.difficulty) {
            durability += base_durability(CharacterValues.skill(character, item.skill), item.difficulty);
        }
        durability = durability / craft.difficulty.length;
        return Math.floor(durability + bonus_durability(character, craft));
    }

    export function output_bulk(character: Character, craft: CraftBulkTemplate) {
        let result: box[] = [];
        //calculating skill output
        // min is 0
        // max is 10
        // choose minimum across all skills
        let ratio = MAX_SKILL_MULTIPLIER_BULK;
        for (let check of craft.difficulty) {
            const skill = CharacterValues.skill(character, check.skill);
            ratio = Math.min(skill_to_ratio(skill, check.difficulty), ratio);
        }

        for (let item of craft.output) {
            const material = MaterialStorage.get(item.material);

            //calculate bonus from perks
            let bonus = 0;
            if (material.category == MATERIAL_CATEGORY.MEAT) {
                if (character._perks.meat_master)
                    bonus += 1;
            }

            if (material.magic_power > 0) {
                if (character._perks.alchemist)
                    bonus += 2;
                if (character._perks.mage_initiation)
                    bonus += 1;
            }

            if (material.category == MATERIAL_CATEGORY.BOW_AMMO) {
                if (character._perks.fletcher)
                    bonus += 5;
            }

            let amount = Math.floor(item.amount * ratio + bonus);
            if (character.race == 'rat') amount = 0;
            result.push({ material: item.material, amount: amount });
        }

        return result;
    }
}