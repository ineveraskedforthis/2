"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterCondition = void 0;
var CharacterCondition;
(function (CharacterCondition) {
    function can_eat(character, material) {
        if (character.race == "rat") {
            if (material.category == 6 /* MATERIAL_CATEGORY.MEAT */)
                return true;
            if (material.category == 1 /* MATERIAL_CATEGORY.PLANT */)
                return true;
        }
        if (material.category == 9 /* MATERIAL_CATEGORY.FRUIT */)
            return true;
        if (material.category == 8 /* MATERIAL_CATEGORY.FOOD */)
            return true;
        return false;
    }
    CharacterCondition.can_eat = can_eat;
    function can_bulk_craft(character, craft) {
        for (const item of craft.input) {
            if (character.stash.get(item.material) < item.amount) {
                return false;
            }
        }
        return true;
    }
    CharacterCondition.can_bulk_craft = can_bulk_craft;
    function can_potentially_bulk_craft(character, craft) {
        for (const item of craft.input) {
            if (character.stash.get(item.material) + character.trade_stash.get(item.material) < item.amount) {
                return false;
            }
        }
        return true;
    }
    CharacterCondition.can_potentially_bulk_craft = can_potentially_bulk_craft;
    function can_item_craft(character, craft) {
        for (const item of craft.input) {
            if (character.stash.get(item.material) < item.amount) {
                return false;
            }
        }
        return true;
    }
    CharacterCondition.can_item_craft = can_item_craft;
})(CharacterCondition || (exports.CharacterCondition = CharacterCondition = {}));
