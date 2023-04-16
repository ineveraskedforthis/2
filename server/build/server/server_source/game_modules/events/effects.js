"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Effect = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const data_1 = require("../data");
const systems_communication_1 = require("../systems_communication");
const scripted_values_1 = require("./scripted_values");
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
    let Transfer;
    (function (Transfer) {
        function savings(from, to, x) {
            from.savings.transfer(to.savings, x);
            user_manager_1.UserManagement.add_user_to_update_queue(from.user_id, 5 /* UI_Part.SAVINGS */);
            user_manager_1.UserManagement.add_user_to_update_queue(to.user_id, 5 /* UI_Part.SAVINGS */);
        }
        Transfer.savings = savings;
    })(Transfer = Effect.Transfer || (Effect.Transfer = {}));
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
    function rent_room(character_id, building_id) {
        let building = data_1.Data.Buildings.from_id(building_id);
        let rooms_not_available = data_1.Data.Buildings.occupied_rooms(building_id);
        let owner_id = data_1.Data.Buildings.owner(building_id);
        let character = data_1.Data.CharacterDB.from_id(character_id);
        if (character.current_building != undefined) {
            return "you are already somewhere";
        }
        if (rooms_not_available >= building.rooms) {
            return "no_rooms";
        }
        if (owner_id == undefined) {
            character.current_building = building_id;
            data_1.Data.Buildings.occupy_room(building_id);
            return "no_owner";
        }
        let price = scripted_values_1.ScriptedValue.room_price(building_id, character_id);
        if (character.savings.get() < price) {
            return "not_enough_money";
        }
        let owner = data_1.Data.CharacterDB.from_id(owner_id);
        if (owner.cell_id != character.cell_id)
            return "invalid_cell";
        Effect.Transfer.savings(character, owner, price);
        data_1.Data.Buildings.occupy_room(building_id);
        character.current_building = building_id;
        return "ok";
    }
    Effect.rent_room = rent_room;
    function leave_room(character_id) {
        let character = data_1.Data.CharacterDB.from_id(character_id);
        if (character.current_building == undefined)
            return;
        data_1.Data.Buildings.free_room(character.current_building);
        character.current_building = undefined;
    }
    Effect.leave_room = leave_room;
    function new_building(cell_id, tier, rooms, durability) {
        data_1.Data.Buildings.create({
            cell_id: cell_id,
            durability: durability,
            tier: tier,
            rooms: rooms,
            kitchen: 0,
            workshop: 0,
            is_inn: false,
            is_elodino: false,
            is_rat_lair: false,
            room_cost: 5
        });
    }
    Effect.new_building = new_building;
})(Effect = exports.Effect || (exports.Effect = {}));
