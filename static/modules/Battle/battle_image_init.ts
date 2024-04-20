import { BattleImage } from "./battle_image.js";
import { BattleData, BattleKeyframeSocket, BattleActionData } from "../../../shared/battle_data.js"
import { tab } from "../ViewManagement/tab.js";
import { socket } from "../Socket/socket.js";
import { character_id } from "@custom_types/ids.js";
import { elementById } from "../HTMLwrappers/common.js";
import { BattleView } from "./View/battle_view.js";
import { keybinds } from "./Widgets/action_list.js";


// export const battle_image = new BattleImageNext();
const events_queue: BattleKeyframeSocket[] = []

var battle_is_on = false

export function init_battle_control() {
    socket.on('battle-action-set-up', (data: BattleActionData) => {
        BattleImage.update_action(data, keybinds[data.tag])
    })

    socket.on('battle-action-update', (data: BattleActionData) => {
        BattleImage.update_action(data, keybinds[data.tag])
    })

    socket.on('battle-in-process',          bCallback.update_battle_process)
    socket.on('battle-update-units',        data => BattleImage.load(data, battle_is_on))
    socket.on('current-unit-turn',          bCallback.link_current_turn)
    socket.on('battle-event',               bCallback.event)
    socket.on('battle-remove-unit',         BattleImage.unload_unit_by_id)

    console.log('battle callbacks are loaded')
}

namespace bCallback {
    export function link_current_turn(data: character_id) {
        BattleImage.set_current_turn(data, 0)
    }

    export function update_battle_state(data: BattleData) {
        BattleImage.load(data, battle_is_on)
    }

    export function update_battle_process(flag: boolean) {
        console.log('battle-in-process ' + flag)
        if (flag) {
            if (battle_is_on) {
                console.log("but we are already in one")
                return
            }
            start_battle()
            socket.emit('request-battle-data')
        } else {
            end_battle()
        }
    }

    export function event(keyframe: BattleKeyframeSocket) {
        BattleImage.new_event(keyframe)
    }
}



function start_battle() {
    if (battle_is_on) {
        return
    }

    battle_is_on = true
    console.log('start battle')

    tab.turn_on('battle')

    console.log("battle tab is supposed to show now...")

    BattleImage.request_all_actions()

    const container = elementById("battle_display_container")
    BattleView.canvas.width = container.clientWidth
    BattleView.canvas.height = container.clientHeight
    BattleView.scale = Math.floor(Math.min(container.clientWidth, container.clientHeight) / 35)
    BattleImage.request_actions_self()

    setTimeout(() => {
        const container = elementById("battle_display_container")
        BattleView.canvas.width = container.clientWidth
        BattleView.canvas.height = container.clientHeight
        BattleView.scale = Math.floor(Math.min(container.clientWidth, container.clientHeight) / 35)
        BattleImage.request_actions_self()
    }, 1000)
}

function end_battle() {
    if (!battle_is_on) {
        return
    }
    battle_is_on = false
    tab.turn_off('battle')
    BattleImage.reset()
}