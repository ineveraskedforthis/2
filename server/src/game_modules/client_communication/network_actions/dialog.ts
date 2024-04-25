import { PerksResponse } from "@custom_types/responses"
import { Convert } from "../../systems_communication"
import { SocketWrapper } from "../user"
import { perk_price } from "../../prices/perk_base_price"
import { ResponseNegativeQuantified, Trigger } from "../../events/triggers"
import { skill_price } from "../../prices/skill_price"
import { can_talk, is_enemy_characters } from "../../SYSTEM_REPUTATION"
import { Character } from "../../data/entities/character"
import { Data } from "../../data/data_objects"
import { DataID } from "../../data/data_id"
import { Extract } from "../../data-extraction/extract-data"
import { CharacterValues } from "../../scripted-values/character"
import { PERK, PerkConfiguration, SKILL, SkillConfiguration } from "@content/content"
import { money } from "@custom_types/common"

export namespace Dialog {
    function talking_check(sw: SocketWrapper, character_id: unknown): [undefined, undefined]|[Character, Character]  {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (typeof character_id != 'number') {
            sw.socket.emit('alert', 'invalid character id')
            return [undefined, undefined]
        }
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist')
            return [undefined, undefined]
        }
        let target_character = Data.Characters.from_number(character_id)
        if (target_character == undefined) {
            sw.socket.emit('alert', 'character does not exist')
            return [undefined, undefined]
        }
        if (character.cell_id != target_character.cell_id) {
            user.socket.emit('alert', 'not in the same cell')
            return [undefined, undefined]
        }
        if (character_id == character.id) {
            user.socket.emit('alert', "can't talk with yourself")
            return [undefined, undefined]
        }
        if (!can_talk(character, target_character)) {
            user.socket.emit('alert', "can't talk with enemies or creatures of different race")
            return  [undefined, undefined]
        }


        return [character, target_character]
    }

    export function request_prices(sw: SocketWrapper, character_id: unknown) {
        const [character, target_character] = talking_check(sw, character_id)
        if ((character == undefined || target_character == undefined)) {
            return
        }

        let buy = target_character.ai_price_buy_expectation
        let sell = target_character.ai_price_sell_expectation

        let buy_precision = target_character.ai_price_buy_log_precision
        let sell_precision = target_character.ai_price_sell_log_precision

        sw.socket.emit('character-prices', {
            buy: buy,
            sell: sell,
            buy_log_precision: buy_precision,
            sell_log_precision: sell_precision
        })
    }


    export function request_greeting(sw: SocketWrapper, character_id: unknown) {
        const [character, target_character] = talking_check(sw, character_id)
        if ((character == undefined || target_character == undefined)) {
            return
        }

        // if (target_character.dead()) return

        let data = target_character._perks
        let response: PerksResponse = {
            name: target_character.get_name(),
            race: target_character.race,
            factions: DataID.Reputation.character(target_character.id).map(Convert.reputation_to_socket),
            current_goal: target_character.current_ai_action,
            perks: [] as Partial<Record<PERK, money>>,
            skills: [] as Partial<Record<SKILL, [number, number]>>,
            model: target_character.model,
            equip: Extract.CharacterEquipModel(target_character)
        }
        for (let perk of PerkConfiguration.PERK ) {
            if (data[perk]) {
                response.perks[perk] = perk_price(perk, character, target_character)
            }
        }
        for (let skill of SkillConfiguration.SKILL) {
            let teaching_response = Trigger.can_learn_from(character, target_character, skill)
            if (teaching_response.response == 'ok' || teaching_response.response == ResponseNegativeQuantified.Money) {
                const teacher_skill = CharacterValues.skill(target_character, skill)
                response.skills[skill] = [
                    teacher_skill,
                    skill_price(skill, character, target_character)
                ]
            }
        }
        sw.socket.emit('perks-info', response)
    }
}