"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Craft = exports.BASIC_WOOD_DIFFICULTY = exports.RAT_SKIN_DIFFICULTY = exports.COOK_RAT_DIFFICULTY = exports.EXTRACT_ZAZ_DIFFICULTY = exports.COOK_ELODINO_DIFFICULTY = void 0;
const basic_functions_1 = require("./basic_functions");
exports.COOK_ELODINO_DIFFICULTY = 30;
exports.EXTRACT_ZAZ_DIFFICULTY = 30;
exports.COOK_RAT_DIFFICULTY = 20;
exports.RAT_SKIN_DIFFICULTY = 20;
exports.BASIC_WOOD_DIFFICULTY = 30;
const ARROWS_DIFFICULTY = 30;
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
            function meat(character) {
                const ratio = ratio_from_skill(character.skills.cooking, exports.COOK_RAT_DIFFICULTY);
                let base_amount = Math.round(ratio * MEAT_TO_FOOD);
                if (character.perks.meat_master)
                    base_amount += 1;
                return base_amount + 1;
            }
            Cooking.meat = meat;
            function elodino(character) {
                const ratio = ratio_from_skill(character.skills.cooking, exports.COOK_ELODINO_DIFFICULTY);
                let base_amount = Math.round(ratio * ELODINO_TO_FOOD);
                if (character.perks.meat_master)
                    base_amount += 1;
                return base_amount;
            }
            Cooking.elodino = elodino;
        })(Cooking = Amount.Cooking || (Amount.Cooking = {}));
        function elodino_zaz_extraction(character) {
            const ratio = ratio_from_skill(character.skills.magic_mastery, exports.EXTRACT_ZAZ_DIFFICULTY);
            let base_amount = Math.round(ratio * ELODINO_TO_ZAZ);
            if (character.perks.mage_initiation)
                base_amount += 1;
            return base_amount;
        }
        Amount.elodino_zaz_extraction = elodino_zaz_extraction;
        function arrow(character) {
            let skill = character.skills.woodwork;
            if (character.perks.fletcher)
                skill += 10;
            return Math.round(ARROW_BASE * ratio_from_skill(skill, ARROWS_DIFFICULTY));
        }
        Amount.arrow = arrow;
        function ratio_from_skill(skill, difficulty) {
            return (0, basic_functions_1.trim)(skill / difficulty, 0, 10);
        }
        Amount.ratio_from_skill = ratio_from_skill;
    })(Amount = Craft.Amount || (Craft.Amount = {}));
    let Durability;
    (function (Durability) {
        function wood_item(character) {
            return from_skill(character.skills.woodwork, exports.BASIC_WOOD_DIFFICULTY);
        }
        Durability.wood_item = wood_item;
        function skin_item(character) {
            let durability = from_skill(character.skills.clothier, exports.RAT_SKIN_DIFFICULTY);
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
// export namespace CraftProbability {
//     export function from_rat_skin(character: Character) {
//         if (character.perks.skin_armour_master) return 1
//         let skill = character.skills.clothier
//         return Math.min(character.skills.clothier / RAT_SKIN_DIFFICULTY, 1)
//     }
//     export function meat_to_food(character: Character) {
//         if (character.perks.meat_master) {
//             var res = 1
//         } else {
//             var res = check(character.skills.cooking, COOK_RAT_DIFFICULTY)
//         }
//         return Math.min(res, 1)
//     }
//     export function elo_to_food(character: Character) {
//         let base = 0;
//         if (character.perks.meat_master) {
//             base += 0.2
//         }
//         let worst_skill = Math.min(character.skills.cooking, character.skills.magic_mastery)
//         return Math.min(base + check(worst_skill, COOK_ELODINO_DIFFICULTY), 1)
//     }
//     export function basic_wood(character: Character) {
//         return Math.min(1, check(character.skills.woodwork, BASIC_WOOD_DIFFICULTY))
//     }
//     export function arrow(character: Character) {
//         if (character.perks.fletcher) return 1
//         return Math.min(1, check(character.skills.woodwork, BASIC_WOOD_DIFFICULTY))
//     }
//     function check(skill: number, difficulty: number) {
//         return skill / difficulty
//     }
// }
