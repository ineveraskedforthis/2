"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_melee_skill = exports.is_crafting_skill = exports.SkillList = void 0;
class SkillList {
    constructor() {
        this.clothier = 0;
        this.cooking = 0;
        this.onehand = 0;
        this.polearms = 0;
        this.noweapon = 0;
        this.twohanded = 0;
        this.skinning = 0;
        this.magic_mastery = 0;
        this.blocking = 0;
        this.evasion = 0;
        this.woodwork = 0;
        this.hunt = 0;
        this.ranged = 0;
        this.bone_carving = 0;
        this.travelling = 0;
        this.fishing = 0;
        this.smith = 0;
    }
}
exports.SkillList = SkillList;
function is_crafting_skill(skill) {
    switch (skill) {
        case "clothier": return true;
        case "cooking": return false;
        case "onehand": return false;
        case "polearms": return false;
        case "noweapon": return false;
        case "twohanded": return false;
        case "skinning": return false;
        case "magic_mastery": return false;
        case "blocking": return false;
        case "evasion": return false;
        case "woodwork": return true;
        case "hunt": return false;
        case "ranged": return false;
        case "bone_carving": return true;
        case "travelling": return false;
        case "fishing": return false;
        case "smith": return true;
    }
}
exports.is_crafting_skill = is_crafting_skill;
function is_melee_skill(skill) {
    if (skill === 'blocking')
        return true;
    if (skill === 'noweapon')
        return true;
    if (skill === 'onehand')
        return true;
    if (skill === 'twohanded')
        return true;
    if (skill === 'polearms')
        return true;
    if (skill === 'evasion')
        return true;
    return false;
}
exports.is_melee_skill = is_melee_skill;
