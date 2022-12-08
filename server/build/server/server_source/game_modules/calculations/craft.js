"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Craft = void 0;
const basic_functions_1 = require("./basic_functions");
const ARROW_BASE = 10;
const MEAT_TO_FOOD = 3;
const ELODINO_TO_FOOD = 2;
const ELODINO_TO_ZAZ = 1;
var Craft;
(function (Craft) {
    let Amount;
    (function (Amount) {
        let Cooking;
        (function (Cooking) {
            function meat(character, tier) {
                const ratio = ratio_from_skill(character.skills.cooking, tier);
                let base_amount = Math.round(ratio * MEAT_TO_FOOD);
                if (character.perks.meat_master)
                    base_amount += 1;
                return base_amount + 1;
            }
            Cooking.meat = meat;
            function elodino(character, tier) {
                const ratio = ratio_from_skill(character.skills.cooking, tier);
                let base_amount = Math.round(ratio * ELODINO_TO_FOOD);
                if (character.perks.meat_master)
                    base_amount += 1;
                return base_amount;
            }
            Cooking.elodino = elodino;
        })(Cooking = Amount.Cooking || (Amount.Cooking = {}));
        function elodino_zaz_extraction(character, tier) {
            const ratio = ratio_from_skill(character.skills.magic_mastery, tier);
            let base_amount = Math.round(ratio * ELODINO_TO_ZAZ);
            if (character.perks.mage_initiation)
                base_amount += 1;
            if (character.perks.alchemist)
                base_amount += 2;
            return base_amount;
        }
        Amount.elodino_zaz_extraction = elodino_zaz_extraction;
        function arrow(character, tier) {
            let skill = character.skills.woodwork;
            if (character.perks.fletcher)
                skill += 10;
            return Math.round(ARROW_BASE * ratio_from_skill(skill, tier));
        }
        Amount.arrow = arrow;
        function ratio_from_skill(skill, difficulty) {
            return (0, basic_functions_1.trim)(skill / difficulty, 0, 10);
        }
        Amount.ratio_from_skill = ratio_from_skill;
    })(Amount = Craft.Amount || (Craft.Amount = {}));
    let Durability;
    (function (Durability) {
        function wood_item(character, tier) {
            return from_skill(character.skills.woodwork, tier);
        }
        Durability.wood_item = wood_item;
        function bone_item(character, tier) {
            return from_skill(character.skills.bone_carving, tier);
        }
        Durability.bone_item = bone_item;
        function skin_item(character, tier) {
            let durability = from_skill(character.skills.clothier, tier);
            if (character.perks.skin_armour_master)
                durability += 10;
            return durability;
        }
        Durability.skin_item = skin_item;
        function from_skill(skill, difficulty) {
            const base = Math.round(skill / difficulty * 100);
            return (0, basic_functions_1.trim)(base, 10, 100);
        }
        Durability.from_skill = from_skill;
    })(Durability = Craft.Durability || (Craft.Durability = {}));
})(Craft = exports.Craft || (exports.Craft = {}));
