"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unlink = exports.Link = exports.Convert = void 0;
const data_id_1 = require("./data/data_id");
const data_objects_1 = require("./data/data_objects");
const content_1 = require("../.././../game_content/src/content");
const VALUES_1 = require("./battle/VALUES");
const system_1 = require("./character/system");
const user_manager_1 = require("./client_communication/user_manager");
const character_1 = require("./scripted-values/character");
const item_system_1 = require("./systems/items/item_system");
var Convert;
(function (Convert) {
    function reputation_to_socket(reputation) {
        return {
            reputation: reputation.reputation,
            faction_id: reputation.faction_id,
            faction_name: data_objects_1.Data.Factions.from_id(reputation.faction_id).name
        };
    }
    Convert.reputation_to_socket = reputation_to_socket;
    function character_id_to_character_view(id) {
        const data = data_objects_1.Data.Characters.from_id(id);
        const equip_slots = {};
        for (let slot of content_1.EquipSlotConfiguration.SLOT) {
            equip_slots[content_1.EquipSlotStorage.get(slot).id_string] = item_system_1.ItemSystem.data_from_id(data.equip.data.slots[slot]);
        }
        return {
            name: data.name,
            dead: data.dead(),
            id: data.id,
            race: data.race,
            robbed: system_1.CharacterSystem.is_empty_inventory(data),
            equip: equip_slots,
            body: data.model
        };
    }
    Convert.character_id_to_character_view = character_id_to_character_view;
    function order_to_socket_data(index, order, owner) {
        let response = item_system_1.ItemSystem.data(order);
        return {
            price: response.price,
            prototype_id: order.prototype.id_string,
            is_weapon: response.is_weapon,
            name: response.name,
            affixes: response.affixes,
            damage: response.damage,
            ranged_damage: response.ranged_damage,
            affixes_list: response.affixes_list,
            resists: response.resists,
            durability: response.durability,
            item_type: response.item_type,
            id: index,
            seller: owner.get_name(),
            seller_id: owner.id
        };
    }
    Convert.order_to_socket_data = order_to_socket_data;
    function cell_id_to_item_orders_socket(cell_id) {
        const result = [];
        data_id_1.DataID.Cells.for_each_guest(cell_id, (character_id) => {
            const items = data_objects_1.Data.Characters.from_id(character_id).equip.data.backpack.items;
            for (let order_id = 0; order_id < items.length; order_id++) {
                const order = data_objects_1.Data.Items.from_id(items[order_id]);
                if (order == undefined)
                    continue;
                if (order.price == undefined)
                    continue;
                let character = data_objects_1.Data.Characters.from_id(character_id);
                result.push(order_to_socket_data(order_id, order, character));
            }
        });
        return result;
    }
    Convert.cell_id_to_item_orders_socket = cell_id_to_item_orders_socket;
    function user_to_character(user) {
        if (user.data.character_id == '@')
            return undefined;
        return data_objects_1.Data.Characters.from_id(user.data.character_id);
    }
    Convert.user_to_character = user_to_character;
    function character_to_battle(character) {
        if (character.battle_id == undefined)
            return undefined;
        return data_objects_1.Data.Battles.from_id(character.battle_id);
    }
    Convert.character_to_battle = character_to_battle;
    function character_to_user_data(character) {
        if (character.user_id == undefined)
            return undefined;
        return user_manager_1.UserManagement.get_user_data(character.user_id);
    }
    Convert.character_to_user_data = character_to_user_data;
    function unit_to_unit_socket(character) {
        return {
            tag: character.model,
            position: character.position,
            range: character_1.CharacterValues.range(character),
            name: character.get_name(),
            hp: character.get_hp(),
            max_hp: character.get_max_hp(),
            ap: character.action_points_left,
            max_ap: character.action_points_max,
            id: character.id,
            next_turn: character.next_turn_after,
            dead: character.dead(),
            move_cost: VALUES_1.BattleValues.move_cost(character),
            action: {
                type: "unit",
                target: character.id,
                action: "update"
            }
        };
    }
    Convert.unit_to_unit_socket = unit_to_unit_socket;
    function socket_wrapper_to_user_character(socket) {
        if (socket.user_id == undefined) {
            return [undefined, undefined];
        }
        const user = user_manager_1.UserManagement.get_user(socket.user_id);
        const character = Convert.user_to_character(user);
        if (character == undefined) {
            return [undefined, undefined];
        }
        return [user, character];
    }
    Convert.socket_wrapper_to_user_character = socket_wrapper_to_user_character;
    function character_to_user(character) {
        let data = character_to_user_data(character);
        if (data == undefined)
            return undefined;
        return user_manager_1.UserManagement.get_user(data.id);
    }
    Convert.character_to_user = character_to_user;
    function character_to_cell(character) {
        let cell = data_objects_1.Data.Cells.from_id(character.cell_id);
        return cell;
    }
    Convert.character_to_cell = character_to_cell;
})(Convert || (exports.Convert = Convert = {}));
var Link;
(function (Link) {
    function character_and_user_data(character, user) {
        console.log('linking user and character');
        character.user_id = user.id;
        user.character_id = character.id;
        if (user_manager_1.UserManagement.user_is_online(user.id)) {
            console.log('user is online');
            let user_online = user_manager_1.UserManagement.get_user(user.id);
            user_online.character_created = true;
            user_manager_1.UserManagement.add_user_to_update_queue(user_online.data.id, 'character_creation');
        }
        user_manager_1.UserManagement.save_users();
        data_objects_1.Data.Characters.save();
    }
    Link.character_and_user_data = character_and_user_data;
    function send_local_characters_info(location) {
        const characters = data_id_1.DataID.Location.guest_list(location);
        for (let item of characters) {
            const local_character = data_objects_1.Data.Characters.from_id(item);
            user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 13 /* UI_Part.LOCAL_CHARACTERS */);
            user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 22 /* UI_Part.MARKET */);
        }
    }
    Link.send_local_characters_info = send_local_characters_info;
    function character_and_location(character, new_location) {
        // console.log('linking character with cell ' + cell.x + ' ' + cell.y)
        // add to the list and notify locals
        // note: rewrite later to lazy sending: send local characters to local characters once in X seconds if there are changes
        //       and send list immediately only to entering user
        // above is not needed
        const data_character = data_objects_1.Data.Characters.from_id(character);
        const old_location = data_character.location_id;
        data_character.location_id = new_location;
        send_local_characters_info(old_location);
        send_local_characters_info(new_location);
        const new_cell = data_id_1.DataID.Location.cell_id(new_location);
        // exploration
        const character_object = data_objects_1.Data.Characters.from_id(character);
        character_object.explored[new_cell] = true;
        let neighbours = data_objects_1.Data.World.neighbours(new_cell);
        for (let item of neighbours) {
            character_object.explored[item] = true;
        }
        //updates
        user_manager_1.UserManagement.add_user_to_update_queue(character_object.user_id, 14 /* UI_Part.EXPLORED */);
        user_manager_1.UserManagement.add_user_to_update_queue(character_object.user_id, 15 /* UI_Part.LOCAL_ACTIONS */);
    }
    Link.character_and_location = character_and_location;
})(Link || (exports.Link = Link = {}));
var Unlink;
(function (Unlink) {
    function user_data_and_character(user, character) {
        if (user == undefined)
            return;
        if (character == undefined)
            return;
        console.log('unlinking user and character');
        user.character_id = '@';
        character.user_id = undefined;
        user_manager_1.UserManagement.add_user_to_update_queue(user.id, 'character_removal');
    }
    Unlink.user_data_and_character = user_data_and_character;
})(Unlink || (exports.Unlink = Unlink = {}));

