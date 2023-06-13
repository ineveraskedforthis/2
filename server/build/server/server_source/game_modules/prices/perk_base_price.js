"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perk_price = void 0;
const data_1 = require("../data");
// import { Perks } from "../character/Perks";
function perk_base_price(tag) {
    switch (tag) {
        case 'meat_master': return 100;
        case 'advanced_unarmed': return 200;
        case 'advanced_polearm': return 200;
        case 'mage_initiation': return 1000;
        case 'blood_mage': return 1000;
        case 'magic_bolt': return 100;
        case 'fletcher': return 200;
        case 'skin_armour_master': return 1000;
    }
}
function perk_price(tag, student, teacher) {
    let price = perk_base_price(tag);
    if (data_1.Data.Reputation.a_X_b(teacher.id, 'enemy', student.id))
        price = price * 10;
    if (!data_1.Data.Reputation.a_X_b(teacher.id, 'friend', student.id))
        price = price * 1.5;
    if (!data_1.Data.Reputation.a_X_b(teacher.id, 'member', student.id))
        price = price * 1.5;
    return Math.round(price);
}
exports.perk_price = perk_price;
