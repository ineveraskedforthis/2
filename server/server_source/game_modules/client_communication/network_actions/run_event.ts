import { Perks } from "../../../../../shared/character";
// import { Perks } from "../../character/Perks";
import { skill } from "../../character/SkillList";
import { Data } from "../../data";
import { Effect } from "../../events/effects";
import { Event } from "../../events/events";
import { Convert } from "../../systems_communication";
import { building_id } from "../../types";
import { SocketWrapper, User } from "../user";
import { Validator } from "./common_validations";

import { LandPlotType } from "../../../../../shared/buildings"
import { BattleSystem } from "../../battle/system";
import { CharacterSystem } from "../../character/system";

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
        if (!CharacterSystem.perk(target_character, perk_tag as Perks)) {
            valid_user.socket.emit('alert', "target doesn't know this perk")
            return
        }
        if (CharacterSystem.perk(valid_character, perk_tag as Perks)) {
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

    export function rent_room(sw: SocketWrapper, msg: undefined|{id: unknown}) {
        if (msg == undefined) return
        let building_id = msg.id
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (typeof building_id != 'number') return
        let building = Data.Buildings.from_id(building_id as building_id)
        if (building == undefined) return
        let responce = Effect.rent_room(character.id, building_id as building_id)
    }

    export function leave_room(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        Effect.leave_room(character.id)
    }

    function validate_building_type(msg: string) {
        switch(msg){
            case(LandPlotType.ElodinoHouse): return true;
            case(LandPlotType.HumanHouse): return true;
            case(LandPlotType.Inn): return true;
            case(LandPlotType.RatLair): return true
            case(LandPlotType.Shack): return true;
        }

        return false
    }

    // export function build_building(sw: SocketWrapper, msg: unknown) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return

    //     if (typeof msg != 'string') return
    //     if (!validate_building_type(msg)) return true

    //     // Event.build_building(character, msg as LandPlotType)
    // }

    export function buy_plot(sw: SocketWrapper,  msg: undefined|{id: unknown}) {
        if (msg == undefined) return
        let character_id = msg.id
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        const [valid_user, valid_character, target_character] = Validator.valid_action_to_character(user, character, character_id)
        if (character == undefined) return
        if (target_character == undefined) return
        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell')
            return
        }
        Event.buy_land_plot(character, target_character)
    }

    export function create_plot(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        
        Event.create_land_plot(character)
    }

    export function develop_plot(sw: SocketWrapper, msg: undefined|{id: unknown, type: unknown}) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        if (msg == undefined) return
        let building_id = msg.id
        if (typeof building_id != 'number') return
        let building = Data.Buildings.from_id(building_id as building_id)
        if (building == undefined) return
        let type = msg.type
        if (type == undefined) return

        let true_type = LandPlotType.Shack
        if (type == LandPlotType.HumanHouse) true_type = LandPlotType.HumanHouse
        if (type == LandPlotType.Inn) true_type = LandPlotType.Inn
        if (type == LandPlotType.CottonField) true_type = LandPlotType.CottonField


        Event.develop_land_plot(character, building_id as building_id, true_type)
    }

    export function repair_building(sw: SocketWrapper, msg: undefined|{id: unknown}) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        if (msg == undefined) return
        let building_id = msg.id
        if (typeof building_id != 'number') return
        let building = Data.Buildings.from_id(building_id as building_id)
        if (building == undefined) return

        Event.repair_building(character, building_id as building_id)
    }
}