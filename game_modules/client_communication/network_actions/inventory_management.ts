import { roll_affix_armour, roll_affix_weapon } from "../../base_game_classes/affix";
import { User } from "../user";
import { ZAZ } from "../../manager_classes/materials_manager";
import { Alerts } from "./alerts";
import { Validator } from "./common_validations";
import { Convert } from "../../systems_communication";
import { CharacterSystem } from "../../base_game_classes/character/system";
import { Event } from "../../events";

export namespace InventoryCommands {
    export function equip_armour(user: User, msg: number) {
        if (!Validator.valid_user(user)) return false
        let character = Convert.user_to_character(user)
        character.equip_armour(msg);
    }

    export function equip_weapon(user: User, msg: number) {
        if (!Validator.valid_user(user)) return false
        let character = Convert.user_to_character(user)
        character.equip_weapon(msg);
    }

    export function enchant_weapon(user: User, msg: number) {
        if (!Validator.valid_user(user)) return false
        let character = Convert.user_to_character(user)
        let item = character.equip.data.backpack.weapons[msg];
        

        if (item != undefined) {
            let REQUIRED_AMOUNT = 1
            let AMOUNT = character.stash.get(ZAZ)

            if ( AMOUNT >= REQUIRED_AMOUNT) {
                roll_affix_weapon(character.get_enchant_rating(), item)
                character.stash.inc(ZAZ, -1)
            } else {
                Alerts.not_enough_to_user(user, 'zaz', REQUIRED_AMOUNT, AMOUNT)
            }                
        }
    }

    export function enchant_armour(user: User, msg: number) {
        if (!Validator.valid_user(user)) return false
        let character = Convert.user_to_character(user)

        let item = character.equip.data.backpack.armours[msg]
        if (item != undefined) {
            let REQUIRED_AMOUNT = 1
            let AMOUNT = character.stash.get(ZAZ)

            if (AMOUNT >= REQUIRED_AMOUNT) {
                roll_affix_armour(character.get_enchant_rating(), item)
                character.stash.inc(ZAZ, -1)
            } else {
                Alerts.not_enough_to_user(user, 'zaz', REQUIRED_AMOUNT, AMOUNT)
            }                
        }            
    }

    export function switch_weapon(user:User) {
        if (!Validator.valid_user(user)) return false
        let character = Convert.user_to_character(user)

        if (character.in_battle()) {
            user.socket.emit('alert', 'in_battle')
            return
        }
        character.switch_weapon();

    }

    // potential inputs 'right_hand', 'body', 'legs', 'foot', 'head', 'arms'
    export function unequip(user:User, msg: string) {
        if (!Validator.valid_user(user)) return false
        let character = Convert.user_to_character(user)

        if (msg == "right_hand") {
            character.unequip_weapon()
        } else {
            switch(msg) {
                case 'secondary': {character.unequip_secondary();break;}
                case 'body': {character.unequip_armour(ARMOUR_TYPE.BODY);break;}
                case 'legs': {character.unequip_armour(ARMOUR_TYPE.LEGS);break;}
                case 'foot': {character.unequip_armour(ARMOUR_TYPE.FOOT);break;}
                case 'head': {character.unequip_armour(ARMOUR_TYPE.HEAD);break;}
                case 'arms': {character.unequip_armour(ARMOUR_TYPE.ARMS);break;}
            }
        }
    }
    export function sell_item(user: User, msg: any) {
        if (!Validator.valid_user(user)) return false
        let character = Convert.user_to_character(user)
        let index = parseInt(msg.index);

        let type = msg.item_type
        let price = parseInt(msg.price);
        if ((type != 'armour') && (type != 'weapon')) return;
        if (isNaN(index) || isNaN(price)) return;
        AuctionManagement.sell(entity_manager, character, type, index, price as money, price as money)
    }

    export function buyout(user: User, msg: string) {
        if (!Validator.valid_user(user)) return false
        let character = Convert.user_to_character(user)

        // validate that user input is safe
        let id = parseInt(msg);
        if (isNaN(id)) {
            return
        }

        let responce = AuctionManagement.buyout(entity_manager, character, id as auction_order_id_raw)
    }
}