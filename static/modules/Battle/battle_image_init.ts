import { BattleImageNext } from "./battle_image.js";
import { get_mouse_pos_in_canvas } from "./battle_image_helper.js";
import { BattleActionChance, Socket } from "../../../shared/battle_data"
import { tab } from "../ViewManagement/tab.js";

export function init_battle_control(battle_image:BattleImageNext, globals:any) {
    let socket:Socket = globals.socket;
    battle_image.canvas.onmousedown = (event: any) => {
        event.preventDefault();
        globals.bcp = true
    }

    battle_image.canvas.onmousemove = (event: any) => {
        let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
        battle_image.hover(mouse_pos);
    };

    battle_image.canvas.onmouseup = (event: any) => {
        let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
        if (globals.bcp) {
            battle_image.press(mouse_pos);
            globals.bcp = false;
        }
    }

    battle_image.socket = globals.socket;

    battle_image.add_action({name: 'move', tag: 'move'})
    battle_image.add_action({name: 'attack', tag: 'attack', cost: 3})
    battle_image.add_action({name: 'magic_bolt', tag: 'magic_bolt', cost: 3})
    battle_image.add_action({name: 'fast attack', tag: 'fast_attack', cost: 1})
    battle_image.add_action({name: 'shoot', tag: 'shoot', cost: 3})
    battle_image.add_action({name: 'dodge', tag: 'dodge', cost: 4})
    battle_image.add_action({name: 'push back', tag: 'push_back', cost: 5})
    battle_image.add_action({name: 'retreat', tag: 'flee', cost: 3})
    battle_image.add_action({name: 'switch weapon', tag: 'switch_weapon', cost: 3})
    battle_image.add_action({name: 'end turn', tag: 'end_turn', cost: 0})

    socket.on('new-action',      msg => battle_image.add_action({name: msg, tag:msg}));
    socket.on('b-action-chance', msg => battle_image.update_action_probability(msg.tag, msg.value))

    //              BATTLES 
    const UNIT_ID_MESSAGE = 'unit_id'
    const BATTLE_DATA_MESSAGE = 'battle_data'
    const BATTLE_CURRENT_UNIT = 'current_unit_turn'

    socket.on('battle-in-process', data => {
        if (data) start_battle()
        else end_battle()
    })

    socket.on(BATTLE_DATA_MESSAGE, data => {
        load_battle(data)
    })


    socket.on('battle-update', data => battle_image.update(data))
    socket.on('battle-action', data => {
        battle_image.handle_socket_data(data);
    })
    socket.on('enemy-update', data => battle_image.update(data))
    socket.on('player-position', data => {((bi, data) => (bi.set_player(data)))(battle_image, data)})

}

function start_battle(data) {
    console.log('start battle')
    tab.turn_on('battle')
    battle_image.clear()
}

function load_battle(data) {
    console.log('loading battle')
    battle_image.load(data)
}

function end_battle() {
    tab.turn_off('battle')
    battle_image.clear()
}