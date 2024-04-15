"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skill_price = void 0;
const data_id_1 = require("../data/data_id");
function skill_price(tag, student, teacher) {
    let price = 10;
    if (data_id_1.DataID.Reputation.a_X_b(teacher.id, 'enemy', student.id))
        price = price * 10;
    if (!data_id_1.DataID.Reputation.a_X_b(teacher.id, 'friend', student.id))
        price = price * 1.5;
    if (!data_id_1.DataID.Reputation.a_X_b(teacher.id, 'member', student.id))
        price = price * 1.5;
    return Math.round(student._skills[tag] * price + 10);
}
exports.skill_price = skill_price;
