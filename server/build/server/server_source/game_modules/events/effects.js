"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Effect = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const systems_communication_1 = require("../systems_communication");
var Effect;
(function (Effect) {
    let Update;
    (function (Update) {
        function cell_market(cell) {
            const locals = cell.get_characters_list();
            for (let item of locals) {
                const id = item.id;
                const local_character = systems_communication_1.Convert.id_to_character(id);
                user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 19 /* UI_Part.MARKET */);
            }
        }
        Update.cell_market = cell_market;
    })(Update = Effect.Update || (Effect.Update = {}));
    function change_durability(character, slot, dx) {
        const item = character.equip.slot_to_item(slot);
        if (item == undefined)
            return;
        item.durability += dx;
        if (item.durability < 1)
            destroy_item(character, slot);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
    }
    Effect.change_durability = change_durability;
    function destroy_item(character, slot) {
        character.equip.destroy_slot(slot);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
    }
    Effect.destroy_item = destroy_item;
    let Change;
    (function (Change) {
        function fatigue(character, dx) {
            character.change_fatigue(dx);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.fatigue = fatigue;
        function stress(character, dx) {
            character.change_stress(dx);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.stress = stress;
        function rage(character, dx) {
            character.change_rage(dx);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        }
        Change.rage = rage;
        function skill(character, skill, dx) {
            character.skills[skill] += dx;
            if (character.skills[skill] > 100)
                character.skills[skill] = 100;
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 12 /* UI_Part.SKILLS */);
        }
        Change.skill = skill;
    })(Change = Effect.Change || (Effect.Change = {}));
    function learn_perk(student, perk) {
        student.perks[perk] = true;
        user_manager_1.UserManagement.add_user_to_update_queue(student.user_id, 12 /* UI_Part.SKILLS */);
    }
    Effect.learn_perk = learn_perk;
})(Effect = exports.Effect || (exports.Effect = {}));
