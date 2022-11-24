"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftProbability = exports.BASIC_WOOD_DIFFICULTY = exports.RAT_SKIN_DIFFICULTY = exports.COOK_RAT_DIFFICULTY = exports.COOK_ELODINO_DIFFICULTY = void 0;
exports.COOK_ELODINO_DIFFICULTY = 50;
exports.COOK_RAT_DIFFICULTY = 20;
exports.RAT_SKIN_DIFFICULTY = 20;
exports.BASIC_WOOD_DIFFICULTY = 10;
var CraftProbability;
(function (CraftProbability) {
    function from_rat_skin(character) {
        if (character.perks.skin_armour_master)
            return 1;
        let skill = character.skills.clothier;
        return Math.min(character.skills.clothier / exports.RAT_SKIN_DIFFICULTY, 1);
    }
    CraftProbability.from_rat_skin = from_rat_skin;
    function meat_to_food(character) {
        if (character.perks.meat_master) {
            var res = 1;
        }
        else {
            var res = check(character.skills.cooking, exports.COOK_RAT_DIFFICULTY);
        }
        return Math.min(res, 1);
    }
    CraftProbability.meat_to_food = meat_to_food;
    function elo_to_food(character) {
        let base = 0;
        if (character.perks.meat_master) {
            base += 0.2;
        }
        let worst_skill = Math.min(character.skills.cooking, character.skills.magic_mastery);
        return Math.min(base + check(worst_skill, exports.COOK_ELODINO_DIFFICULTY), 1);
    }
    CraftProbability.elo_to_food = elo_to_food;
    function basic_wood(character) {
        return Math.min(1, check(character.skills.woodwork, exports.BASIC_WOOD_DIFFICULTY));
    }
    CraftProbability.basic_wood = basic_wood;
    function arrow(character) {
        if (character.perks.fletcher)
            return 1;
        return Math.min(1, check(character.skills.woodwork, exports.BASIC_WOOD_DIFFICULTY));
    }
    CraftProbability.arrow = arrow;
    function check(skill, difficulty) {
        return skill / difficulty;
    }
})(CraftProbability = exports.CraftProbability || (exports.CraftProbability = {}));
