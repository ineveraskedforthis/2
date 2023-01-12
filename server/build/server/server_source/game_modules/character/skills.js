"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skill_price = exports.SkillList = void 0;
const data_1 = require("../data");
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
function skill_price(tag, student, teacher) {
    let price = 10;
    if (data_1.Data.Reputation.a_X_b(teacher.id, 'enemy', student.id))
        price = price * 10;
    if (!data_1.Data.Reputation.a_X_b(teacher.id, 'friend', student.id))
        price = price * 1.5;
    if (!data_1.Data.Reputation.a_X_b(teacher.id, 'member', student.id))
        price = price * 1.5;
    return Math.round(student.skills[tag] * price);
}
exports.skill_price = skill_price;
