"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftValues = void 0;
const content_1 = require("../../.././../game_content/src/content");
const basic_functions_1 = require("../calculations/basic_functions");
const character_1 = require("./character");
const helpers_1 = require("../craft/helpers");
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
        if (craft.output.tag == "weapon") {
            if (character._perks.weapon_maker)
                durability += 10;
        }
        else {
            const data = content_1.ArmourStorage.get(craft.output.value);
            if (character._perks.skin_armour_master && skin_flag)
                durability += 20;
            if (character._perks.shoemaker && (data.slot == 8 /* EQUIP_SLOT.BOOTS */)) {
                durability += 20;
            }
        }
        return durability;
    }
    function durability(character, craft) {
        // calculate base durability as average
        let durability = 0;
        for (let item of craft.difficulty) {
            durability += base_durability(character_1.CharacterValues.skill(character, item.skill), item.difficulty);
        }
        durability = durability / craft.difficulty.length;
        return Math.floor(durability + bonus_durability(character, craft));
    }
    CraftValues.durability = durability;
    function output_bulk(character, craft) {
        let result = [];
        //calculating skill output
        // min is 0
        // max is 10
        // choose minimum across all skills
        let ratio = helpers_1.MAX_SKILL_MULTIPLIER_BULK;
        for (let check of craft.difficulty) {
            const skill = character_1.CharacterValues.skill(character, check.skill);
            ratio = Math.min((0, helpers_1.skill_to_ratio)(skill, check.difficulty), ratio);
        }
        for (let item of craft.output) {
            const material = content_1.MaterialStorage.get(item.material);
            //calculate bonus from perks
            let bonus = 0;
            if (material.category == 6 /* MATERIAL_CATEGORY.MEAT */) {
                if (character._perks.meat_master)
                    bonus += 1;
            }
            if (material.magic_power > 0) {
                if (character._perks.alchemist)
                    bonus += 2;
                if (character._perks.mage_initiation)
                    bonus += 1;
            }
            if (material.category == 0 /* MATERIAL_CATEGORY.BOW_AMMO */) {
                if (character._perks.fletcher)
                    bonus += 5;
            }
            let amount = Math.floor(item.amount * ratio + bonus);
            if (character.race == 'rat')
                amount = 0;
            result.push({ material: item.material, amount: amount });
        }
        return result;
    }
    CraftValues.output_bulk = output_bulk;
})(CraftValues || (exports.CraftValues = CraftValues = {}));

