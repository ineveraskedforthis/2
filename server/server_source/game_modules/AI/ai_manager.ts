import type { Character } from "../character/character"
import { AIhelper } from "./helpers";
import { decide_ai_action_campaign } from "./ACTIONS_DECISION";
import { AI_TRIGGER } from "./AI_TRIGGERS";

export namespace CampaignAI {
    export function decision(character: Character) {
        // console.log(character.misc.ai_tag)
        if (character.is_player()) {
            return
        }
        if (character.in_battle()) {
            return
        }
        if (character.action != undefined) {
            return
        }        
        if (Math.random() < 0.1) {
            character.ai_memories.shift()
        }
        if (!AI_TRIGGER.low_hp(character)) {
            let responce = AIhelper.check_battles_to_join(character)
            if (responce) return;
        }        
        decide_ai_action_campaign(character)
    }
}