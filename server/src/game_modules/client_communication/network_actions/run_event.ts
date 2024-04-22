import { Event } from "../../events/events";
import { Convert } from "../../systems_communication";
import { location_id } from "@custom_types/ids";
import { SocketWrapper } from "../user";
import { Validator } from "./common_validations";

import { BattleSystem } from "../../battle/system";
import { CharacterSystem } from "../../character/system";
import { Perks } from "@custom_types/character";
import { Request } from "./request";
import { skill } from "@custom_types/inventory";
import { Data } from "../../data/data_objects";
import { Effect } from "../../effects/effects";
import { DataID } from "../../data/data_id";
import { CharacterValues } from "../../scripted-values/character";

export namespace SocketCommand {


    // data is a raw id of character
    export function attack_character(socket_wrapper: SocketWrapper, raw_data: unknown) {
        const [user, character] = Convert.socket_wrapper_to_user_character(socket_wrapper)
        const [valid_user, valid_character, target] = Validator.valid_action_to_character(user, character, raw_data)
        if (target == undefined) return
        if (target.dead()) return
        console.log('attack_character ' + raw_data)
        BattleSystem.start_battle(valid_character, target)
    }

    export function rob_character(socket_wrapper: SocketWrapper, raw_data: unknown) {
        console.log('rob_character ' + raw_data)
        const [user, character] = Convert.socket_wrapper_to_user_character(socket_wrapper)
        const [valid_user, valid_character, target] = Validator.valid_action_to_character(user, character, raw_data)
        if (target == undefined) return

        Event.rob_the_dead(valid_character, target)
    }

    export function support_character(socket_wrapper: SocketWrapper, raw_data: unknown) {
        console.log('support_character ' + raw_data)
        const [user, character] = Convert.socket_wrapper_to_user_character(socket_wrapper)
        const [valid_user, valid_character, target] = Validator.valid_action_to_character(user, character, raw_data)
        if (target == undefined) return
        if (target.dead()) return
        BattleSystem.support_in_battle(valid_character, target)
    }

    export function learn_perk(sw: SocketWrapper, msg: undefined|{id: unknown, tag: unknown}) {
        if (msg == undefined) return
        let character_id = msg.id
        let perk_tag = msg.tag

        if (typeof perk_tag != 'string') return

        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        const [valid_user, valid_character, target_character] = Validator.valid_action_to_character(user, character, character_id)
        if (target_character == undefined) return

        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell')
            return
        }
        if (!CharacterValues.perk(target_character, perk_tag as Perks)) {
            valid_user.socket.emit('alert', "target doesn't know this perk")
            return
        }
        if (CharacterValues.perk(valid_character, perk_tag as Perks)) {
            valid_user.socket.emit('alert', "you already know it")
            return
        }

        Event.buy_perk(valid_character, perk_tag as Perks, target_character)
    }

    export function learn_skill(sw: SocketWrapper, msg: undefined|{id: unknown, tag: unknown}) {
        if (msg == undefined) return
        let character_id = msg.id
        let skill_tag = msg.tag

        if (typeof skill_tag != 'string') return

        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        const [valid_user, valid_character, target_character] = Validator.valid_action_to_character(user, character, character_id)
        if (target_character == undefined) return

        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell')
            return
        }

        if (valid_character._skills[skill_tag as skill] == undefined) {
            return
        }

        // console.log('validation passed')
        Event.buy_skill(valid_character, skill_tag as skill, target_character)
    }

    export function enter_location(sw: SocketWrapper, msg: unknown) {
        if (msg == undefined) return
        let location_id = Number(msg)
        if (typeof(location_id) != "number") {
            return
        }
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) {
            return
        }

        const location = Data.Locations.from_number(location_id)
        if (location == undefined) return false
        if (location.cell_id != character.cell_id) return false

        Effect.enter_location(character.id, location.id)
        Request.local_locations(sw)
    }

    // export function create_plot(sw: SocketWrapper) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return

    //     Event.create_land_plot(character)
    //     Request.local_locations(sw)
    // }

    // export function develop_plot(sw: SocketWrapper, msg: undefined|{id: unknown, type: unknown}) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return

    //     if (msg == undefined) return
    //     let location_id = msg.id
    //     if (typeof location_id != 'number') return
    //     let location = Data.Locations.from_id(location_id as location_id)
    //     if (location == undefined) return
    //     let type = msg.type
    //     if (type == undefined) return

    //     let true_type = LandPlotType.Shack
    //     if (type == LandPlotType.HumanHouse) true_type = LandPlotType.HumanHouse
    //     if (type == LandPlotType.Inn) true_type = LandPlotType.Inn
    //     if (type == LandPlotType.CottonField) true_type = LandPlotType.CottonField


    //     Event.develop_land_plot(character, location_id as location_id, true_type)
    //     Request.local_locations(sw)
    // }

    // export function change_rent_price(sw: SocketWrapper, msg: undefined|{id: unknown, price: unknown}) {
    //     console.log('change rent price', msg)
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return
    //     if (msg == undefined) return
    //     let location_id = msg.id
    //     if (typeof location_id != 'number') return
    //     let location = Data.Locations.from_id(location_id as location_id)
    //     if (location == undefined) return
    //     let price = msg.price
    //     if (typeof price != 'number') return

    //     console.log('change rent price', character.name, location, price)

    //     Event.change_rent_price(character, location_id as location_id, price as money)
    //     Request.local_locations(sw)
    // }

    export function repair_location(sw: SocketWrapper, msg: undefined|{id: unknown}) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        if (msg == undefined) return
        let location_id = msg.id
        if (typeof location_id != 'number') return
        let location = Data.Locations.from_number(location_id)
        if (location == undefined) return

        Event.repair_location(character, location_id as location_id)
        Request.local_locations(sw)
    }
}