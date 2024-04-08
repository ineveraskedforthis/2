import { set_up_header_with_strings } from '../../headers.js';
import { elementById, inputById } from '../HTMLwrappers/common.js';
import { globals } from '../globals.js';
import { socket } from "../Socket/socket.js";

// MESSAGES STUFF

const message_boxes = ['log', 'log-attack', 'chat'];

export function init_messages_interactions() {
    set_up_header_with_strings([
        {element: 'open_chat_button',       connected_element: 'chat'},
        {element: 'open_log_button',        connected_element: 'log'},
        {element: 'open_log-attack_button', connected_element: 'log-attack'}
    ])

    elementById('send_message_button').onclick = (event) => {
        event.preventDefault();
        let message_field = inputById('message_field')
        let message = message_field.value;
        message_field.value = '';
        socket.emit('new-message', message);
    };

    elementById('hide_chat_button').onclick = (event) => {
        let chat_box = elementById('messages_frame');
        let msg_box = elementById('list_of_messages');
        let send_box = elementById('send_message_frame');
        let but = elementById('hide_chat_button');

        if (chat_box.classList.contains('chat_display_true')) {
            chat_box.classList.toggle('chat_display_true');
            chat_box.style.height = "40px";
            msg_box.style.visibility = "hidden";
            send_box.style.visibility = "hidden";
            but.innerHTML = "&#9650;"
        } else {
            chat_box.classList.toggle('chat_display_true');
            chat_box.style.height = "300px";
            msg_box.style.visibility = "visible";
            send_box.style.visibility = "visible";
            but.innerHTML = "&#9660;"
        }
    }

    socket.on('log-attack', msg => { new_log_attack_message(msg); });

    socket.on('new-message', msg => new_message(msg));
    socket.on('alert', msg => {my_alert(msg); new_log_message(msg)});
    socket.on('is-reg-valid', msg => my_alert(msg));
    socket.on('is-login-valid', msg => my_alert(msg));
    socket.on('not_enough', msg => {
        my_alert('not enough ' + JSON.stringify(msg))
        globals.keep_doing = undefined
    });
}

export function new_log_message(msg: string) {
    new_message_to_box('log', msg)
    console.log(msg)
}

export function new_message_to_box(target: string, log_message: string) {
    var log = elementById(target);
    var new_line = document.createElement('p');
    var text = document.createTextNode(log_message);
    if (target != 'chat') new_line.style.whiteSpace = 'pre-line';
    new_line.append(text);
    log.appendChild(new_line);
    log.scrollTop = log.scrollHeight;
}

function new_message(msg: ChatMessage) {
    new_message_to_box('chat', msg.user + ': ' + msg.msg)
}

const damage_types: DamageTag[] = ['fire', 'blunt', 'pierce', 'slice']

function new_log_attack_message(msg: BattleLogData) {
    let log_message = '';
    if (msg.role == 'attacker')
        log_message += 'you has attacked \n';

    else
        log_message += 'you was attacked \n';
    log_message += 'damage | resist | after \n';

    for (let tag of damage_types) {
        log_message += `${tag}: ${msg.attack.damage[tag]}, ${msg.res[tag]}, ${Math.max(0, msg.attack.damage[tag] - msg.res[tag])} \n`;
    }

    log_message += `total damage: ${msg.total} \n`;

    new_message_to_box('log-attack', log_message)
}

function my_alert(msg: string) {
    if (msg != 'ok') {
        alert(msg);
    }
}

