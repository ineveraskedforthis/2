import { location_id } from "@custom_types/ids";
import { Event } from "../../events/events";
import { Convert } from "../../systems_communication";
import { SocketWrapper } from "../user";
import { Validator } from "./common_validations";

import { PerkConfiguration, SkillConfiguration } from "@content/content";
import { BattleSystem } from "../../battle/system";
import { Data } from "../../data/data_objects";
import { Effect } from "../../effects/effects";
import { CharacterValues } from "../../scripted-values/character";
import { Request } from "./request";

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

        if (typeof perk_tag != 'number') return
        if (!PerkConfiguration.is_valid_id(perk_tag)) return

        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        const [valid_user, valid_character, target_character] = Validator.valid_action_to_character(user, character, character_id)
        if (target_character == undefined) return

        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell')
            return
        }
        if (!CharacterValues.perk(target_character, perk_tag)) {
            valid_user.socket.emit('alert', "target doesn't know this perk")
            return
        }
        if (CharacterValues.perk(valid_character, perk_tag)) {
            valid_user.socket.emit('alert', "you already know it")
            return
        }

        Event.buy_perk(valid_character, perk_tag, target_character)
    }

    export function learn_skill(sw: SocketWrapper, msg: undefined|{id: unknown, tag: unknown}) {
        if (msg == undefined) return
        let character_id = msg.id
        let skill_tag = msg.tag

        if (typeof skill_tag != 'number') return
        if (!SkillConfiguration.is_valid_id(skill_tag)) return;

        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        const [valid_user, valid_character, target_character] = Validator.valid_action_to_character(user, character, character_id)
        if (target_character == undefined) return

        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell')
            return
        }

        if (valid_character._skills[skill_tag] == undefined) {
            return
        }

        // console.log('validation passed')
        Event.buy_skill(valid_character, skill_tag, target_character)
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

    export function build(sw: SocketWrapper, msg: unknown) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        if (msg == undefined) return
        let location_id = Number(msg)
        let location = Data.Locations.from_id(location_id as location_id)
        if (location == undefined) return

        Event.build_house(character, location_id as location_id)
        Request.local_locations(sw)
    }

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