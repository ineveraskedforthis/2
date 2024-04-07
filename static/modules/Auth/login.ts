import { set_up_header_with_strings } from '../../headers.js';
import { elementById, inputById } from '../HTMLwrappers/common.js';
import { tab } from '../ViewManagement/tab.js';
import { socket } from '../globals.js';

export function init_authentication_control() {
    elementById('logout').onclick = () => {
        localStorage.setItem('session', 'null');
        location.reload();
    };

    set_up_header_with_strings([
        {element: 'open_reg_window_button', connected_element: 'reg-frame'},
        {element: 'open_login_window_button', connected_element: 'login-frame'}
    ])

    elementById('reg-frame')!.onsubmit = (event) => {
        event.preventDefault();
        let login = inputById('login-r').value;
        let password = inputById('password-r').value;
        let code = inputById('code-r').value;
        socket.emit('reg', { login: login, password: password, code: code });
    };
    elementById('login-frame')!.onsubmit = (event) => {
        event.preventDefault();
        let login = inputById('login-l').value;
        let password = inputById('password-l').value;
        socket.emit('login', { login: login, password: password });
    };

}

