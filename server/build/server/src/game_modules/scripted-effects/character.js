"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterEffect = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const effects_1 = require("../effects/effects");
var CharacterEffect;
(function (CharacterEffect) {
    function eat(character, material) {
        character.stash.inc(material.id, -1);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 8 /* UI_Part.STASH */);
        effects_1.Effect.Change.hp(character, Math.round(material.unit_size * material.density * 20 + material.magic_power * 5 + 1), "Eating" /* CHANGE_REASON.EATING */);
        effects_1.Effect.Change.stress(character, -Math.round(material.unit_size * material.density * 5 + material.magic_power * 10 + 1), "Eating" /* CHANGE_REASON.EATING */);
        effects_1.Effect.Change.fatigue(character, -Math.round(material.unit_size * material.density * 20 + material.magic_power * 5 + 1), "Eating" /* CHANGE_REASON.EATING */);
    }
    CharacterEffect.eat = eat;
    function open_shop(character) {
        character.open_shop = true;
        character.equip.data.backpack.limit = 100;
    }
    CharacterEffect.open_shop = open_shop;
    function close_shop(character) {
        character.open_shop = false,
            character.equip.data.backpack.limit = 10;
    }
    CharacterEffect.close_shop = close_shop;
})(CharacterEffect || (exports.CharacterEffect = CharacterEffect = {}));
