document.getElementById('reg_btn').onclick = () => {
	document.getElementById('login-frame').style.visibility = 'hidden';
	document.getElementById('reg-frame').style.visibility = 'visible';
	document.getElementById('log_btn').classList.remove('selected');
	document.getElementById('reg_btn').classList.add('selected');
}
document.getElementById('log_btn').onclick = () => {
	document.getElementById('reg-frame').style.visibility = 'hidden';
	document.getElementById('login-frame').style.visibility = 'visible';
	document.getElementById('reg_btn').classList.remove('selected');
	document.getElementById('log_btn').classList.add('selected');
}