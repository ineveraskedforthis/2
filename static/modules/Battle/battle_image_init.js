import { BattleImage } from "./battle_image.js";
import { tab } from "../ViewManagement/tab.js";
import { socket } from "../Socket/socket.js";
import { elementById } from "../HTMLwrappers/common.js";
import { BattleView } from "./View/battle_view.js";
import { keybinds } from "./Widgets/action_list.js";
// export const battle_image = new BattleImageNext();
const events_queue = [];
var battle_is_on = false;
export function init_battle_control() {
    socket.on('battle-action-set-up', (data) => {
        BattleImage.update_action(data, keybinds[data.tag]);
    });
    socket.on('battle-action-update', (data) => {
        BattleImage.update_action(data, keybinds[data.tag]);
    });
    socket.on('battle-in-process', bCallback.update_battle_process);
    socket.on('battle-update-units', data => BattleImage.load(data));
    socket.on('current-unit-turn', bCallback.link_current_turn);
    socket.on('battle-event', bCallback.event);
    socket.on('battle-remove-unit', BattleImage.unload_unit_by_id);
    console.log('battle callbacks are loaded');
}
var bCallback;
(function (bCallback) {
    function link_current_turn(data) {
        BattleImage.set_current_turn(data, 0);
    }
    bCallback.link_current_turn = link_current_turn;
    function update_battle_state(data) {
        BattleImage.load(data);
    }
    bCallback.update_battle_state = update_battle_state;
    function update_battle_process(flag) {
        console.log('battle-in-process ' + flag);
        if (flag) {
            if (battle_is_on) {
                console.log("but we are already in one");
                return;
            }
            start_battle();
            socket.emit('request-battle-data');
        }
        else {
            end_battle();
        }
    }
    bCallback.update_battle_process = update_battle_process;
    function event(keyframe) {
        BattleImage.new_event(keyframe);
    }
    bCallback.event = event;
})(bCallback || (bCallback = {}));
function start_battle() {
    if (battle_is_on) {
        return;
    }
    battle_is_on = true;
    console.log('start battle');
    tab.turn_on('battle');
    console.log("battle tab is supposed to show now...");
    BattleImage.request_all_actions();
    const container = elementById("battle_display_container");
    BattleView.canvas.width = container.clientWidth;
    BattleView.canvas.height = container.clientHeight;
    BattleView.scale = Math.floor(Math.min(container.clientWidth, container.clientHeight) / 35);
    BattleImage.request_actions_self();
    setTimeout(() => {
        const container = elementById("battle_display_container");
        BattleView.canvas.width = container.clientWidth;
        BattleView.canvas.height = container.clientHeight;
        BattleView.scale = Math.floor(Math.min(container.clientWidth, container.clientHeight) / 35);
        BattleImage.request_actions_self();
    }, 1000);
}
function end_battle() {
    if (!battle_is_on) {
        return;
    }
    battle_is_on = false;
    tab.turn_off('battle');
    BattleImage.reset();
}
