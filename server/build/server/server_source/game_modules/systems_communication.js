"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unlink = exports.Link = exports.Convert = void 0;
const system_1 = require("./items/system");
const user_manager_1 = require("./client_communication/user_manager");
const data_1 = require("./data");
const VALUES_1 = require("./battle/VALUES");
var Convert;
(function (Convert) {
    // export function number_to_order_item_id(id: number): order_item_id|undefined {
    //     const temp = Data.ItemOrders.from_id(id as order_item_id)
    //     if (temp == undefined) return undefined
    //     return temp.id
    // }
    // export function id_to_order_item(id: order_item_id):OrderItem
    // export function id_to_order_item(id: number):OrderItem|undefined
    // export function id_to_order_item(id: order_item_id|number):OrderItem|undefined {
    //     return Data.ItemOrders.from_id(id as order_item_id)
    // }
    function order_to_socket_data(index, order, owner) {
        // let owner = Convert.id_to_character(order.owner_id)
        let responce = system_1.ItemSystem.item_data(order);
        // responce.price = order.price
        responce.id = index;
        responce.seller = owner.get_name();
        responce.seller_id = owner.id;
        return responce;
    }
    Convert.order_to_socket_data = order_to_socket_data;
    function id_to_bulk_order(id) {
        return data_1.Data.BulkOrders.from_id(id);
    }
    Convert.id_to_bulk_order = id_to_bulk_order;
    function char_id_to_bulk_orders(id) {
        return data_1.Data.CharacterBulkOrders(id);
    }
    Convert.char_id_to_bulk_orders = char_id_to_bulk_orders;
    function cell_id_to_bulk_orders(id) {
        const chars = data_1.Data.Cells.get_characters_set_from_cell(id);
        const result = new Set();
        if (chars == undefined)
            return result;
        for (let char_id of chars) {
            const char_orders = char_id_to_bulk_orders(char_id);
            for (let [_, order] of char_orders.entries()) {
                result.add(order);
            }
        }
        return result;
    }
    Convert.cell_id_to_bulk_orders = cell_id_to_bulk_orders;
    function cell_id_to_item_orders_socket(cell_id) {
        const chars = data_1.Data.Cells.get_characters_set_from_cell(cell_id);
        const result = [];
        if (chars == undefined) {
            return result;
        }
        for (let char_id of chars) {
            const char_orders = data_1.Data.CharacterItemOrders(char_id);
            for (let order_id = 0; order_id < char_orders.length; order_id++) {
                const order = char_orders[order_id];
                if (order == undefined)
                    continue;
                if (order.price == undefined)
                    continue;
                let character = data_1.Data.CharacterDB.from_id(char_id);
                result.push(order_to_socket_data(order_id, order, character));
            }
        }
        return result;
    }
    Convert.cell_id_to_item_orders_socket = cell_id_to_item_orders_socket;
    function id_to_battle(id) {
        return data_1.Data.Battle.from_id(id);
    }
    Convert.id_to_battle = id_to_battle;
    function id_to_character(id) {
        if (id == undefined)
            return undefined;
        if (id == -1)
            return undefined;
        return data_1.Data.CharacterDB.from_id(id);
    }
    Convert.id_to_character = id_to_character;
    function number_to_character(id) {
        return data_1.Data.CharacterDB.from_id(id);
    }
    Convert.number_to_character = number_to_character;
    function unit_to_character(unit) {
        return id_to_character(unit.char_id);
    }
    Convert.unit_to_character = unit_to_character;
    function user_to_character(user) {
        if (user.data.char_id == '@')
            return undefined;
        return id_to_character(user.data.char_id);
    }
    Convert.user_to_character = user_to_character;
    function character_to_battle(character) {
        if (character.battle_id == undefined)
            return undefined;
        return Convert.id_to_battle(character.battle_id);
    }
    Convert.character_to_battle = character_to_battle;
    function character_to_unit(character) {
        const battle = character_to_battle(character);
        if (battle == undefined)
            return undefined;
        if (character.battle_unit_id == undefined)
            return undefined;
        return battle.heap.get_unit(character.battle_unit_id);
    }
    Convert.character_to_unit = character_to_unit;
    function character_to_user_data(character) {
        if (character.user_id == '#')
            return undefined;
        return user_manager_1.UserManagement.get_user_data(character.user_id);
    }
    Convert.character_to_user_data = character_to_user_data;
    function unit_to_unit_socket(unit) {
        const character = unit_to_character(unit);
        return {
            tag: character.model,
            position: unit.position,
            range: character.range(),
            name: character.get_name(),
            hp: character.get_hp(),
            max_hp: character.get_max_hp(),
            ap: unit.action_points_left,
            id: unit.id,
            next_turn: unit.next_turn_after,
            dead: character.dead(),
            move_cost: VALUES_1.BattleValues.move_cost(unit, character)
        };
    }
    Convert.unit_to_unit_socket = unit_to_unit_socket;
    function socket_wrapper_to_user_character(socket) {
        if (socket.user_id == '#') {
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
        let cell = data_1.Data.Cells.from_id(character.cell_id);
        return cell;
    }
    Convert.character_to_cell = character_to_cell;
})(Convert = exports.Convert || (exports.Convert = {}));
var Link;
(function (Link) {
    function character_battle_unit(character, battle, unit) {
        character.battle_id = battle.id;
        character.battle_unit_id = unit.id;
    }
    Link.character_battle_unit = character_battle_unit;
    function character_and_user_data(character, user) {
        console.log('linking user and character');
        character.user_id = user.id;
        user.char_id = character.id;
        if (user_manager_1.UserManagement.user_is_online(user.id)) {
            console.log('user is online');
            let user_online = user_manager_1.UserManagement.get_user(user.id);
            user_online.character_created = true;
            user_manager_1.UserManagement.add_user_to_update_queue(user_online.data.id, 'character_creation');
        }
        user_manager_1.UserManagement.save_users();
        data_1.Data.CharacterDB.save();
    }
    Link.character_and_user_data = character_and_user_data;
    function send_local_characters_info(cell) {
        const characters = data_1.Data.Cells.get_characters_list_from_cell(cell);
        for (let item of characters) {
            const local_character = Convert.id_to_character(item);
            user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 8 /* UI_Part.LOCAL_CHARACTERS */);
            user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 19 /* UI_Part.MARKET */);
        }
    }
    Link.send_local_characters_info = send_local_characters_info;
    function character_and_cell(character, new_cell) {
        // console.log('linking character with cell ' + cell.x + ' ' + cell.y)
        // add to the list and notify locals
        // note: rewrite later to lazy sending: send local characters to local characters once in X seconds if there are changes
        //       and send list immediately only to entering user
        // above is not needed
        const old_cell = data_1.Data.Connection.character_cell(character, new_cell);
        send_local_characters_info(old_cell);
        send_local_characters_info(new_cell);
        // exploration
        const character_object = data_1.Data.CharacterDB.from_id(character);
        character_object.explored[new_cell] = true;
        let neighbours = data_1.Data.World.neighbours(new_cell);
        for (let item of neighbours) {
            character_object.explored[item] = true;
        }
        //updates
        user_manager_1.UserManagement.add_user_to_update_queue(character_object.user_id, 9 /* UI_Part.EXPLORED */);
        user_manager_1.UserManagement.add_user_to_update_queue(character_object.user_id, 10 /* UI_Part.LOCAL_ACTIONS */);
    }
    Link.character_and_cell = character_and_cell;
})(Link = exports.Link || (exports.Link = {}));
var Unlink;
(function (Unlink) {
    function user_data_and_character(user, character) {
        if (user == undefined)
            return;
        if (character == undefined)
            return;
        console.log('unlinking user and character');
        user.char_id = '@';
        character.user_id = '#';
        user_manager_1.UserManagement.add_user_to_update_queue(user.id, 'character_removal');
    }
    Unlink.user_data_and_character = user_data_and_character;
    // export function character_and_cell(character: Character, cell: Cell) {
    //     cell.exit(character.id)
    //     Alerts.cell_locals(cell)
    // }
    function character_and_battle(character) {
        // if (battle == undefined) return
        // const unit = Convert.character_to_unit(character)
        // BattleEvent.Leave(battle, unit)
        character.battle_id = undefined;
        character.battle_unit_id = undefined;
    }
    Unlink.character_and_battle = character_and_battle;
})(Unlink = exports.Unlink || (exports.Unlink = {}));
// enter(char: Character) {
//     this.characters_set.add(char.id)
//     this.world.socket_manager.send_market_info_character(this, char)
//     this.world.socket_manager.send_cell_updates(this)
// }
// exit(char: Character) {
//     this.characters_set.delete(char.id)
//     this.world.socket_manager.send_cell_updates(this)
// }
