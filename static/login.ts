import { set_up_header_with_strings } from './headers.js';
import { tab } from './modules/ViewManagement/tab.js';
import { socket } from './modules/globals.js';

//CREDENTIALS STUFF
{
    let button = document.getElementById('logout')!;
    button.onclick = () => { localStorage.setItem('session', 'null'); location.reload(); };
}

set_up_header_with_strings([
    {element: 'open_reg_window_button', connected_element: 'reg-frame'},
    {element: 'open_login_window_button', connected_element: 'login-frame'}
])

// document.getElementById('open_reg_window_button').onclick = () => {
//     document.getElementById('login-frame').style.visibility = 'hidden';
//     document.getElementById('reg-frame').style.visibility = 'inherit';
//     document.getElementById('open_login_window_button').classList.remove('selected');
//     document.getElementById('open_reg_window_button').classList.add('selected');
// };
// document.getElementById('open_login_window_button').onclick = () => {
//     document.getElementById('reg-frame').style.visibility = 'hidden';
//     document.getElementById('login-frame').style.visibility = 'inherit';
//     document.getElementById('open_reg_window_button').classList.remove('selected');
//     document.getElementById('open_login_window_button').classList.add('selected');
// };

document.getElementById('reg-frame')!.onsubmit = (event) => {
    event.preventDefault();
    let login = (document.getElementById('login-r') as HTMLInputElement).value;
    let password = (document.getElementById('password-r') as HTMLInputElement).value;
    let code = (document.getElementById('code-r') as HTMLInputElement).value;
    socket.emit('reg', { login: login, password: password, code: code });
};
document.getElementById('login-frame')!.onsubmit = (event) => {
    event.preventDefault();
    let login = (document.getElementById('login-l')       as HTMLInputElement).value;
    let password = (document.getElementById('password-l') as HTMLInputElement).value;
    socket.emit('login', { login: login, password: password });
};
