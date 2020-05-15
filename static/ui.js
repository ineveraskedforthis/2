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
	} else if (msg == 'ok'){
		document.getElementById('login_container').style.visibility = 'hidden';
		document.getElementById('game_container').style.visibility = 'visible';
	}
});


var char_image = new CharacterImage(document.getElementById('char_image'), document.getElementById('tmp-canvas'));

function draw(tmp) {
	if (check_loading()) {
		char_image.draw()
		// battle_image.draw()
	} 
	// game_field.draw();
	window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
