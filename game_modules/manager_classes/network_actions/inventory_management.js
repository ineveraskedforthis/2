"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryCommands = void 0;
const game_launch_1 = require("../../../game_launch");
const affix_1 = require("../../base_game_classes/affix");
const market_items_1 = require("../../market/market_items");
const item_tags_1 = require("../../static_data/item_tags");
const materials_manager_1 = require("../materials_manager");
const user_manager_1 = require("../user_manager");
const alerts_1 = require("./alerts");
const common_validations_1 = require("./common_validations");
var InventoryCommands;
(function (InventoryCommands) {
    function equip_armour(user, msg) {
        if (!common_validations_1.ValidatorSM.valid_user(user))
            return false;
        let character = user_manager_1.UserManagement.user_to_character(user);
        character.equip_armour(msg);
    }
    InventoryCommands.equip_armour = equip_armour;
    function equip_weapon(user, msg) {
        if (!common_validations_1.ValidatorSM.valid_user(user))
            return false;
        let character = user_manager_1.UserManagement.user_to_character(user);
        character.equip_weapon(msg);
    }
    InventoryCommands.equip_weapon = equip_weapon;
    function enchant_weapon(user, msg) {
        if (!common_validations_1.ValidatorSM.valid_user(user))
            return false;
        let character = user_manager_1.UserManagement.user_to_character(user);
        let item = character.equip.data.backpack.weapons[msg];
        if (item != undefined) {
            let REQUIRED_AMOUNT = 1;
            let AMOUNT = character.stash.get(materials_manager_1.ZAZ);
            if (AMOUNT >= REQUIRED_AMOUNT) {
                (0, affix_1.roll_affix_weapon)(character.get_enchant_rating(), item);
                character.stash.inc(materials_manager_1.ZAZ, -1);
            }
            else {
                alerts_1.Alerts.not_enough_to_user(user, 'zaz', REQUIRED_AMOUNT, AMOUNT);
            }
        }
    }
    InventoryCommands.enchant_weapon = enchant_weapon;
    function enchant_armour(user, msg) {
        if (!common_validations_1.ValidatorSM.valid_user(user))
            return false;
        let character = user_manager_1.UserManagement.user_to_character(user);
        let item = character.equip.data.backpack.armours[msg];
        if (item != undefined) {
            let REQUIRED_AMOUNT = 1;
            let AMOUNT = character.stash.get(materials_manager_1.ZAZ);
            if (AMOUNT >= REQUIRED_AMOUNT) {
                (0, affix_1.roll_affix_armour)(character.get_enchant_rating(), item);
                character.stash.inc(materials_manager_1.ZAZ, -1);
            }
            else {
                alerts_1.Alerts.not_enough_to_user(user, 'zaz', REQUIRED_AMOUNT, AMOUNT);
            }
        }
    }
    InventoryCommands.enchant_armour = enchant_armour;
    function switch_weapon(user) {
        if (!common_validations_1.ValidatorSM.valid_user(user))
            return false;
        let character = user_manager_1.UserManagement.user_to_character(user);
        if (character.in_battle()) {
            user.socket.emit('alert', 'in_battle');
            return;
        }
        character.switch_weapon();
    }
    InventoryCommands.switch_weapon = switch_weapon;
    // potential inputs 'right_hand', 'body', 'legs', 'foot', 'head', 'arms'
    function unequip(user, msg) {
        if (!common_validations_1.ValidatorSM.valid_user(user))
            return false;
        let character = user_manager_1.UserManagement.user_to_character(user);
        if (msg == "right_hand") {
            character.unequip_weapon();
        }
        else {
            switch (msg) {
                case 'secondary': {
                    character.unequip_secondary();
                    break;
                }
                case 'body': {
                    character.unequip_armour(item_tags_1.ARMOUR_TYPE.BODY);
                    break;
                }
                case 'legs': {
                    character.unequip_armour(item_tags_1.ARMOUR_TYPE.LEGS);
                    break;
                }
                case 'foot': {
                    character.unequip_armour(item_tags_1.ARMOUR_TYPE.FOOT);
                    break;
                }
                case 'head': {
                    character.unequip_armour(item_tags_1.ARMOUR_TYPE.HEAD);
                    break;
                }
                case 'arms': {
                    character.unequip_armour(item_tags_1.ARMOUR_TYPE.ARMS);
                    break;
                }
            }
        }
    }
    InventoryCommands.unequip = unequip;
    function sell_item(user, msg) {
        if (!common_validations_1.ValidatorSM.valid_user(user))
            return false;
        let character = user_manager_1.UserManagement.user_to_character(user);
        let index = parseInt(msg.index);
        let type = msg.item_type;
        let price = parseInt(msg.price);
        if ((type != 'armour') && (type != 'weapon'))
            return;
        if (isNaN(index) || isNaN(price))
            return;
        market_items_1.AuctionManagement.sell(game_launch_1.entity_manager, character, type, index, price, price);
    }
    InventoryCommands.sell_item = sell_item;
    function buyout(user, msg) {
        if (!common_validations_1.ValidatorSM.valid_user(user))
            return false;
        let character = user_manager_1.UserManagement.user_to_character(user);
        // validate that user input is safe
        let id = parseInt(msg);
        if (isNaN(id)) {
            return;
        }
        let responce = market_items_1.AuctionManagement.buyout(game_launch_1.entity_manager, character, id);
    }
    InventoryCommands.buyout = buyout;
})(InventoryCommands = exports.InventoryCommands || (exports.InventoryCommands = {}));
