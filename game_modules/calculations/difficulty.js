"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Difficulty = exports.BONUS_SPEAR = exports.DIFFICULTY_SPEAR = void 0;
exports.DIFFICULTY_SPEAR = 5;
exports.BONUS_SPEAR = 0.1;
// export const DIFFICULTY_HUNTING = 10
var Difficulty;
(function (Difficulty) {
    function success(skill, difficulty, bonus) {
        return (Math.random() < success_ratio(skill, difficulty, bonus));
    }
    Difficulty.success = success;
    function success_ratio(skill, difficulty, bonus) {
        return Math.min(1, skill / difficulty + bonus);
    }
    Difficulty.success_ratio = success_ratio;
    function failure_to_skill_up(skill, difficulty, bonus) {
        const x = skill / 100;
        const d = difficulty / 100 + 0.05;
        return (Math.random() < Math.max(0, Math.min(1, x / d + bonus)));
    }
    Difficulty.failure_to_skill_up = failure_to_skill_up;
    function success_to_skill_up(skill, difficulty, bonus) {
        if (skill > difficulty)
            return false;
        const x = skill / 100;
        const d = difficulty / 100 + 0.05;
        return (Math.random() < Math.max(0, Math.min(1, (d - x) / (d) + bonus)));
    }
    Difficulty.success_to_skill_up = success_to_skill_up;
})(Difficulty = exports.Difficulty || (exports.Difficulty = {}));
