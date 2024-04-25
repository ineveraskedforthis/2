import { MaterialStorage, MATERIAL_CATEGORY, ArmourStorage, EQUIP_SLOT, PERK, WeaponStorage, SKILL } from "@content/content";
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


        if (bone_flag && CharacterValues.perk(character, PERK.PRO_BONEWORK))
            durability += 10;

        if (skin_flag && CharacterValues.perk(character, PERK.PRO_LEATHERWORK))
            durability += 10

        if (flesh_flag && CharacterValues.perk(character, PERK.PRO_BUTCHER))
            durability += 10

        return durability;
    }

    export function durability(character: Character, craft: CraftItemTemplate): number {
        // calculate base durability as average
        let durability = 0;
        for (let item of craft.difficulty) {
            durability += base_durability(CharacterValues.skill(character, item.skill), item.difficulty);
        }
        durability = durability / craft.difficulty.length;

        const output = craft.output
        switch(output.tag) {
            case "weapon":{
                if (WeaponStorage.get(output.value).bow_power > 0) {
                    durability *= (0.5 + CharacterValues.skill(character, SKILL.BOWMAKING) / 100)
                }
                break;
            }
            case "armour":{
                if (ArmourStorage.get(output.value).slot == EQUIP_SLOT.BOOTS) {
                    durability += 50 * CharacterValues.perk(character, PERK.PRO_CORDWAINER)
                }
                break;
            }
        }

        return Math.floor(durability + bonus_durability(character, craft));
    }

    export function output_bulk(character: Character, craft: CraftBulkTemplate) {
        let result: box[] = [];

        for (let item of craft.output) {
            const material = MaterialStorage.get(item.material);

            let skill_ratio = 1
            for (const skill_check of item.skill_checks) {
                skill_ratio = Math.min(skill_ratio, CharacterValues.skill(character, skill_check.skill) / skill_check.difficulty)
            }

            //calculate bonus from perks
            let bonus = 0;
            if (material.category == MATERIAL_CATEGORY.MEAT) {
                if (CharacterValues.perk(character, PERK.PRO_BUTCHER))
                    bonus += 1;
            }

            if (material.magic_power > 0) {
                if (CharacterValues.perk(character, PERK.PRO_ALCHEMIST))
                    bonus += 2;
                if (CharacterValues.perk(character, PERK.MAGIC_INITIATION))
                    bonus += 1;
            }

            if (material.category == MATERIAL_CATEGORY.BOW_AMMO) {
                if (CharacterValues.perk(character, PERK.PRO_FLETCHER))
                    bonus += 5;
            }

            let amount = Math.floor(item.amount * skill_ratio + bonus);
            if (character.race == 'rat') amount = 0;
            if (character.race == 'ball') amount = 0;
            result.push({ material: item.material, amount: amount });
        }

        return result;
    }
}