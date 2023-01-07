import { socket } from './modules/globals.js';

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

function switch_log_to(target) {
    for (let tag of message_boxes) {
        document.getElementById(tag).classList.add('hidden');
        document.getElementById(`open_${tag}_button`).classList.remove('selected');
    }

    document.getElementById(target).classList.remove('hidden');
    document.getElementById(`open_${target}_button`).classList.add('selected');
}
document.getElementById('open_chat_button').onclick = () => {
    switch_log_to('chat');
};
document.getElementById('open_log_button').onclick = () => {
    switch_log_to('log');
};
document.getElementById('open_log-attack_button').onclick = () => {
    switch_log_to('log-attack');
};
document.getElementById('send_message_button').onclick = (event) => {
    event.preventDefault();
    let message = document.getElementById('message_field').value;
    socket.emit('new-message', message);
};

socket.on('log-attack', msg => { new_log_attack_message(msg); });
socket.on('log-message', msg => new_log_message(msg));
socket.on('new-message', msg => new_message(msg));
socket.on('alert', msg => {my_alert(msg); new_log_message(msg)});