import { set_up_header_with_strings } from './headers.js';
import { globals, socket } from './modules/globals.js';

// MESSAGES STUFF

const message_boxes = ['log', 'log-attack', 'chat'];

function new_message_to_box(target, log_message) {
    var log = document.getElementById(target);
    var new_line = document.createElement('p');
    var text = document.createTextNode(log_message);
    if (target != 'chat') new_line.style = 'white-space: pre-line';
    new_line.append(text);
    log.appendChild(new_line);
    log.scrollTop = log.scrollHeight;
}

function new_log_message(msg) {
    if (msg == null) {
        return;
    }
    if (msg == 'you_are_dead') {
        turn_tab_off('battle');
    }

    new_message_to_box('log', msg)
}

function new_message(msg) {
    if (msg != 'message-too-long') {
        new_message_to_box('chat', msg.user + ': ' + msg.msg)
    }
}

function new_log_attack_message(msg) {
    let log_message = '';
    if (msg.role == 'attacker')
        log_message += 'you has attacked \n';

    else
        log_message += 'you was attacked \n';
    log_message += 'damage | resist | after \n';

    for (let tag of ['fire', 'blunt', 'pierce', 'slice']) {
        log_message += `${tag}: ${msg.attack.damage[tag]}, ${msg.res[tag]}, ${Math.max(0, msg.attack.damage[tag] - msg.res[tag])} \n`;
    }

    log_message += `total damage: ${msg.total} \n`;

    new_message_to_box('log-attack', log_message)
}

set_up_header_with_strings([
    {element: 'open_chat_button',       connected_element: 'chat'},
    {element: 'open_log_button',        connected_element: 'log'},
    {element: 'open_log-attack_button', connected_element: 'log-attack'}
])

document.getElementById('send_message_button').onclick = (event) => {
    event.preventDefault();
    let message_field = document.getElementById('message_field')
    let message = message_field.value;
    message_field.value = '';
    socket.emit('new-message', message);
};


document.getElementById('hide_chat_button').onclick = (event) => {
    let chat_box = document.getElementById('messages_frame');
    let msg_box = document.getElementById('list_of_messages');
    let send_box = document.getElementById('send_message_frame');
    let but = document.getElementById('hide_chat_button');

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

function my_alert(msg) {
    if (msg != 'ok') {
        alert(msg);
    }
}

socket.on('log-attack', msg => { new_log_attack_message(msg); });
socket.on('log-message', msg => new_log_message(msg));
socket.on('new-message', msg => new_message(msg));
socket.on('alert', msg => {my_alert(msg); new_log_message(msg)});
socket.on('is-reg-valid', msg => my_alert(msg));
socket.on('is-login-valid', msg => my_alert(msg));
socket.on('not_enough', msg => {
    my_alert('not enough ' + JSON.stringify(msg))
    globals.keep_doing = undefined
});