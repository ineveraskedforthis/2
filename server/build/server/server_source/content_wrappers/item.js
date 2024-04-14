"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_armour = exports.is_weapon = exports.is_priced_item = void 0;
function is_priced_item(x) {
    return "price" in x;
}
exports.is_priced_item = is_priced_item;
function is_weapon(x) {
    return "prototype_weapon" in x;
}
exports.is_weapon = is_weapon;
function is_armour(x) {
    return "prototype_armour" in x;
}
exports.is_armour = is_armour;
