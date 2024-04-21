import { UnitSocket } from "../../../shared/battle_data";
import { ItemOrderData, equip } from "../../../shared/inventory";
import { Battle } from "./battle/classes/battle";
import { Character } from "./character/character";
import { ItemSystem } from "./systems/items/item_system";
import { UI_Part } from "./client_communication/causality_graph";
import { SocketWrapper, User, UserData } from "./client_communication/user";
import { UserManagement } from "./client_communication/user_manager";
import { ReputationData, ReputationDataSocket } from "@custom_types/common";
import { character_id, location_id, user_online_id } from "@custom_types/ids";
import { cell_id } from "@custom_types/ids";
import { BattleValues } from "./battle/VALUES";
import { EquipmentPiece } from "./data/entities/item";
import { DataID } from "./data/data_id";
import { Data } from "./data/data_objects";
import { CellData } from "./map/cell_interface";
import { CharacterView } from "@custom_types/responses";
import { CharacterSystem } from "./character/system";
import { EquipSlotConfiguration, EquipSlotStorage } from "@content/content";


export namespace Convert {

    export function reputation_to_socket(reputation: ReputationData): ReputationDataSocket {
        return {
            reputation: reputation.reputation,
            faction_id: reputation.faction_id,
            faction_name: Data.Factions.from_id(reputation.faction_id).name
        }
    }

    export function character_id_to_character_view(id: character_id): CharacterView {
        const data = Data.Characters.from_id(id)

        const equip_slots : equip = {}
        for (let slot of EquipSlotConfiguration.SLOT) {
            equip_slots[EquipSlotStorage.get(slot).id_string] = ItemSystem.data_from_id(data.equip.data.slots[slot])
        }
        return {
            name: data.name,
            dead: data.dead(),
            id: data.id,
            race: data.race,
            robbed: CharacterSystem.is_empty_inventory(data),
            equip: equip_slots,
            body: data.model
        }
    }

    export function order_to_socket_data(index: number, order: EquipmentPiece, owner: Character):ItemOrderData {
        let response = ItemSystem.data(order)

        return {
            price: response.price as number,
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
        } as ItemOrderData
    }

    export function cell_id_to_item_orders_socket(cell_id: cell_id): ItemOrderData[] {
        const chars = DataID.Cells.local_character_id_list(cell_id)
        const result:ItemOrderData[] = []
        if (chars == undefined) {
            return result
        }
        for (let character_id of chars) {
            const items = Data.Characters.from_id(character_id).equip.data.backpack.items
            for (let order_id = 0; order_id < items.length; order_id++) {
                const order = Data.Items.from_id(items[order_id])
                if (order == undefined) continue;
                if (order.price == undefined) continue;
                let character = Data.Characters.from_id(character_id)
                result.push(order_to_socket_data(order_id, order, character))
            }
        }
        return result
    }

    export function user_to_character(user: User):Character|undefined {
        if (user.data.character_id == '@') return undefined;
        return Data.Characters.from_id(user.data.character_id)
    }

    export function character_to_battle(character: Character): Battle|undefined {
        if (character.battle_id == undefined) return undefined
        return Data.Battles.from_id(character.battle_id)
    }

    export function character_to_user_data(character:Character):UserData|undefined {
        if (character.user_id == undefined) return undefined
        return UserManagement.get_user_data(character.user_id)
    }

    export function unit_to_unit_socket(character: Character): UnitSocket {
        return {
            tag: character.model,
            position: character.position,
            range: character.range(),
            name: character.get_name(),
            hp: character.get_hp(),
            max_hp: character.get_max_hp(),
            ap: character.action_points_left,
            max_ap: character.action_points_max,
            id: character.id,
            next_turn: character.next_turn_after,
            dead: character.dead(),
            move_cost: BattleValues.move_cost(character),

            action: {
                type: "unit",
                target: character.id,
                action: "update"
            }
        }
    }

    export function socket_wrapper_to_user_character(socket: SocketWrapper): [User, Character]|[undefined, undefined] {
        if (socket.user_id == undefined) {return [undefined, undefined]}
        const user = UserManagement.get_user(socket.user_id)
        const character = Convert.user_to_character(user)
        if (character == undefined) {return [undefined, undefined]}

        return [user, character]
    }

    export function character_to_user(character:Character):User|undefined {
        let data = character_to_user_data(character)
        if (data == undefined) return undefined
        return UserManagement.get_user(data.id as user_online_id)
    }

    export function character_to_cell(character: Character):CellData {
        let cell = Data.Cells.from_id(character.cell_id)
        return cell
    }
}

export namespace Link {
    export function character_and_user_data(character: Character, user: UserData) {
        console.log('linking user and character')
        character.user_id = user.id
        user.character_id = character.id
        if (UserManagement.user_is_online(user.id)) {
            console.log('user is online')
            let user_online = UserManagement.get_user(user.id as user_online_id)
            user_online.character_created = true
            UserManagement.add_user_to_update_queue(user_online.data.id, 'character_creation')
        }
        UserManagement.save_users()
        Data.Characters.save()
    }


    export function send_local_characters_info(location: location_id) {
        const characters = DataID.Location.guest_list(location)
        for (let item of characters) {
            const local_character = Data.Characters.from_id(item)

            UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.LOCAL_CHARACTERS)
            UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.MARKET)
        }
    }

    export function character_and_location(character: character_id, new_location: location_id) {
        // console.log('linking character with cell ' + cell.x + ' ' + cell.y)
        // add to the list and notify locals
        // note: rewrite later to lazy sending: send local characters to local characters once in X seconds if there are changes
        //       and send list immediately only to entering user
        // above is not needed
        const data_character = Data.Characters.from_id(character)

        const old_location = data_character.location_id
        data_character.location_id = new_location


        send_local_characters_info(old_location)
        send_local_characters_info(new_location)

        const new_cell = DataID.Location.cell_id(new_location)

        // exploration
        const character_object = Data.Characters.from_id(character)
        character_object.explored[new_cell] = true
        let neighbours = Data.World.neighbours(new_cell)

        for (let item of neighbours) {
            character_object.explored[item] = true
        }

        //updates
        UserManagement.add_user_to_update_queue(character_object.user_id, UI_Part.EXPLORED)
        UserManagement.add_user_to_update_queue(character_object.user_id, UI_Part.LOCAL_ACTIONS)
    }
}

export namespace Unlink {
    export function user_data_and_character(user: UserData| undefined, character: Character|undefined) {
        if (user == undefined) return
        if (character == undefined) return
        console.log('unlinking user and character')
        user.character_id = '@'
        character.user_id = undefined
        UserManagement.add_user_to_update_queue(user.id, 'character_removal')
    }
}