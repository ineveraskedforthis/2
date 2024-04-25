"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perk_price = void 0;
const data_id_1 = require("../data/data_id");
const content_1 = require("../../.././../game_content/src/content");
function perk_price(tag, student, teacher) {
    let price = content_1.PerkStorage.get(tag).base_price;
    if (data_id_1.DataID.Reputation.a_X_b(teacher.id, 'enemy', student.id))
        price = price * 10;
    if (!data_id_1.DataID.Reputation.a_X_b(teacher.id, 'friend', student.id))
        price = price * 1.5;
    if (!data_id_1.DataID.Reputation.a_X_b(teacher.id, 'member', student.id))
        price = price * 1.5;
    return Math.round(price);
}
exports.perk_price = perk_price;

