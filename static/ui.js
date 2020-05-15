// eslint-disable-next-line no-undef
var socket = io();

document.getElementById('open_reg_window_button').onclick = () => {
	document.getElementById('login-frame').style.visibility = 'hidden';
	document.getElementById('reg-frame').style.visibility = 'visible';
	document.getElementById('open_login_window_button').classList.remove('selected');
	document.getElementById('open_reg_window_button').classList.add('selected');
}

document.getElementById('open_login_window_button').onclick = () => {
	document.getElementById('reg-frame').style.visibility = 'hidden';
	document.getElementById('login-frame').style.visibility = 'visible';
	document.getElementById('open_reg_window_button').classList.remove('selected');
	document.getElementById('open_login_window_button').classList.add('selected');
}

document.getElementById('reg-frame').onsubmit = (event) => {
	event.preventDefault();
	let login = document.getElementById('login-r').value;
	let password = document.getElementById('password-r').value;
	socket.emit('reg', {login: login, password: password});
}

document.getElementById('login-frame').onsubmit = (event) => {
	event.preventDefault();
	let login = document.getElementById('login-l').value;
	let password = document.getElementById('password-l').value;
	socket.emit('login', {login: login, password: password});
}

document.getElementById('open_chat_button').onclick = () => {
	document.getElementById('log').style.visibility = 'hidden';
	document.getElementById('chat').style.visibility = 'visible';
	document.getElementById('open_log_button').classList.remove('selected');
	document.getElementById('open_chat_button').classList.add('selected');
}

document.getElementById('open_log_button').onclick = () => {
	document.getElementById('chat').style.visibility = 'hidden';
	document.getElementById('log').style.visibility = 'visible';
	document.getElementById('open_chat_button').classList.remove('selected');
	document.getElementById('open_log_button').classList.add('selected');
}

document.getElementById('send_message_button').onclick = (event) => {
	event.preventDefault();
	let message = document.getElementById('message_field').value;
	socket.emit('new-message', message);
}


document.getElementById('attack_button').onclick = () => {
	socket.emit('attack', null);
}


socket.on('is-reg-valid', msg => {
	if (msg != 'ok') {
		alert(msg);
	}
});

socket.on('is-reg-completed', msg => {
	if (msg != 'ok') {
		alert(msg);
	} else if (msg == 'ok') {
		document.getElementById('login_container').style.visibility = 'hidden';
		document.getElementById('game_container').style.visibility = 'visible';
		// document.getElementById('bg_fade').style.visibility = 'hidden';
	}
});

socket.on('is-login-valid', msg => {
	if (msg != 'ok') {
		alert(msg);
	}
});

socket.on('is-login-completed', msg => {
	if (msg != 'ok') {
		alert(msg);
	} else if (msg == 'ok') {
		document.getElementById('login_container').style.visibility = 'hidden';
		document.getElementById('game_container').style.visibility = 'visible';
		// document.getElementById('bg_fade').style.visibility = 'hidden';
	}
});

socket.on('log-message', msg => {
	var log = document.getElementById('log');
	var new_line = document.createElement('p');
	var text = document.createTextNode(msg);
	new_line.append(text);
	log.appendChild(new_line);
	log.scrollTop = log.scrollHeight
});

socket.on('new-message', msg => {
	if (msg != 'message-too-long')
		var chat = document.getElementById('chat');
		var new_line = document.createElement('p');
		var text = document.createTextNode(msg.user + ': ' + msg.msg);
		new_line.append(text);
		chat.appendChild(new_line);
		chat.scrollTop = chat.scrollHeight
})

socket.on('char-info', msg => {
	let status = document.getElementById('status');
	status.textContent = '';
	let name_line = document.createElement('p');
	let hp_line = document.createElement('p');
	let exp_line = document.createElement('p');
	let level_line = document.createElement('p');
	let points_line = document.createElement('p');
	let savings_line = document.createElement('p');

	name_line.append(document.createTextNode(`name: ${msg.name}`));
	hp_line.append(document.createTextNode(`hp:${msg.hp}/${msg.max_hp}`));
	exp_line.append(document.createTextNode(`exp: ${msg.data.exp}`));
	level_line.append(document.createTextNode(`level: ${msg.data.level}`));
	points_line.append(document.createTextNode(`skill points: ${msg.data.skill_points}`));
	savings_line.append(document.createTextNode(`savings: ${msg.savings.data['standard_money']}`));

	status.appendChild(name_line);
	status.appendChild(hp_line);
	status.appendChild(exp_line);
	status.appendChild(level_line);
	status.appendChild(points_line);
	status.appendChild(savings_line);

	for (let i in msg.data.stats) {
		let stats_line = document.createElement('p');
		stats_line.append(document.createTextNode(`${i}: ${msg.data.stats[i]}`));
		status.appendChild(stats_line);
	}
	for (let i in msg.data.other) {
		let other_line = document.createElement('p');
		other_line.append(document.createTextNode(`${i}: ${msg.data.other[i]}`))
		status.appendChild(other_line);
	}
	for (let i in msg.stash) {
		let other_line = document.createElement('p');
		other_line.append(document.createTextNode(`${i}: ${msg.stash[i]}`))
		status.appendChild(other_line);
	}

	char_image.update(msg.data.other.rage, msg.data.other.blood_covering, msg.data.stats.pow)
	// skill_tree.update(SKILLS, msg.data.skills);
	// tactic_screen.update(msg.data.tactic)
	
});

socket.on('battle-has-started', data => {
	battle_image.clear()
	battle_image.load(data)
})

socket.on('battle-update', data => {
	battle_image.update(data)
})

socket.on('battle-has-ended', () => {
	battle_image.clear()
})


// eslint-disable-next-line no-undef
var char_image = new CharacterImage(document.getElementById('char_image'), document.getElementById('tmp_canvas'));
// eslint-disable-next-line no-undef
var battle_image = new BattleImage(document.getElementById('battle_canvas'), document.getElementById('battle_canvas_tmp'));

function draw() {
	// eslint-disable-next-line no-undef
	if (check_loading()) {
		char_image.draw()
		// battle_image.draw()
	} 
	// game_field.draw();
	window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
