"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftValues = void 0;
const content_1 = require("../../.././../game_content/src/content");
const basic_functions_1 = require("../calculations/basic_functions");
const character_1 = require("./character");
var CraftValues;
(function (CraftValues) {
    function base_durability(skill, difficulty) {
        const base = Math.round(skill / difficulty * 100);
        return (0, basic_functions_1.trim)(base, 5, 150);
    }
    function bonus_durability(character, craft) {
        let durability = 0;
        let skin_flag = false;
        let bone_flag = false;
        let flesh_flag = false;
        for (let item of craft.input) {
            const material = content_1.MaterialStorage.get(item.material);
            if (material.category == 4 /* MATERIAL_CATEGORY.SKIN */)
                skin_flag = true;
            if (material.category == 5 /* MATERIAL_CATEGORY.LEATHER */)
                skin_flag = true;
            if (material.category == 3 /* MATERIAL_CATEGORY.BONE */)
                bone_flag = true;
            if (material.category == 6 /* MATERIAL_CATEGORY.MEAT */)
                flesh_flag = true;
        }
        const template = {
            model_tag: craft.output,
            affixes: craft.output_affixes
        };
        if (bone_flag && character_1.CharacterValues.perk(character, 2 /* PERK.PRO_BONEWORK */))
            durability += 10;
        if (skin_flag && character_1.CharacterValues.perk(character, 4 /* PERK.PRO_LEATHERWORK */))
            durability += 10;
        if (flesh_flag && character_1.CharacterValues.perk(character, 0 /* PERK.PRO_BUTCHER */))
            durability += 10;
        return durability;
    }
    function durability(character, craft) {
        // calculate base durability as average
        let durability = 0;
        for (let item of craft.difficulty) {
            durability += base_durability(character_1.CharacterValues.skill(character, item.skill), item.difficulty);
        }
        durability = durability / craft.difficulty.length;
        const output = craft.output;
        switch (output.tag) {
            case "weapon": {
                if (content_1.WeaponStorage.get(output.value).bow_power > 0) {
                    durability *= (0.5 + character_1.CharacterValues.skill(character, 7 /* SKILL.BOWMAKING */) / 100);
                }
                break;
            }
            case "armour": {
                if (content_1.ArmourStorage.get(output.value).slot == 8 /* EQUIP_SLOT.BOOTS */) {
                    durability += 50 * character_1.CharacterValues.perk(character, 6 /* PERK.PRO_CORDWAINER */);
                }
                break;
            }
        }
        return Math.floor(durability + bonus_durability(character, craft));
    }
    CraftValues.durability = durability;
    function output_bulk(character, craft) {
        let result = [];
        for (let item of craft.output) {
            const material = content_1.MaterialStorage.get(item.material);
            let skill_ratio = 1;
            for (const skill_check of item.skill_checks) {
                skill_ratio = Math.min(skill_ratio, character_1.CharacterValues.skill(character, skill_check.skill) / skill_check.difficulty);
            }
            //calculate bonus from perks
            let bonus = 0;
            if (material.category == 6 /* MATERIAL_CATEGORY.MEAT */) {
                if (character_1.CharacterValues.perk(character, 0 /* PERK.PRO_BUTCHER */))
                    bonus += 1;
            }
            if (material.magic_power > 0) {
                if (character_1.CharacterValues.perk(character, 12 /* PERK.PRO_ALCHEMIST */))
                    bonus += 2;
                if (character_1.CharacterValues.perk(character, 11 /* PERK.MAGIC_INITIATION */))
                    bonus += 1;
            }
            if (material.category == 0 /* MATERIAL_CATEGORY.BOW_AMMO */) {
                if (character_1.CharacterValues.perk(character, 3 /* PERK.PRO_FLETCHER */))
                    bonus += 5;
            }
            let amount = Math.floor(item.amount * skill_ratio + bonus);
            if (character.race == 'rat')
                amount = 0;
            if (character.race == 'ball')
                amount = 0;
            result.push({ material: item.material, amount: amount });
        }
        return result;
    }
    CraftValues.output_bulk = output_bulk;
})(CraftValues || (exports.CraftValues = CraftValues = {}));

