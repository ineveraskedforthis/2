import { SocketWrapper, user_id, user_online_id } from "../../user";
import { UserManagement} from "../user_manager";
import { Alerts } from "./alerts";
import { ValidatorSM } from "./common_validations";

var current_sessions:{[_: string]: user_id} = {}

export namespace Auth {
    export function login_with_session(sw: SocketWrapper, session: string)
    {
        console.log('attempt to login with session')

        // check if this session is legit
        if (!(session in current_sessions)) {
            sw.socket.emit('reset_session', undefined);
            return
        }

        // retrieve user id and check if such user still exists
        let user_id = current_sessions[session]
        if (UserManagement.user_exists(user_id)) {
            sw.socket.emit('reset_session', undefined);
            return
        }

        // if this user_id was already logged in, then attempt to login it
        if (UserManagement.user_was_online(user_id)) {
            // if yes, then just update socket and status on old entry, depending on online status
            if (UserManagement.user_is_online(user_id)) {
                sw.socket.emit('alert', 'you are already logged in elsewhere');
                return
            }

            let user = UserManagement.get_user(user_id as user_online_id) 
            UserManagement.link_socket_wrapper_and_user(sw, user)            
            return
        }

        // if not, create new online user entry
        let user_data = UserManagement.get_user_data(user_id as user_id)
        let user = UserManagement.construct_user(sw, user_data)
        user.logged_in = true

        Alerts.log_to_user(user, 'hello ' + user.data.login)
        Alerts.login_is_completed(user)
    }

    export function login(sw: SocketWrapper, data: {login: string, password: string}) {
        // check that user doesn't try to log in while being logged in
        if (sw.user_id != '#') {
            sw.socket.emit('is-login-valid', 'you-are-logged-in');
            return
        }

        console.log('attempt to login')
        console.log(data)

        // check that credentials are valid
        var error_message = ValidatorSM.validate_creds(data);
        sw.socket.emit('is-login-valid', error_message);
        if (error_message != 'ok') {
            return
        }

        // attempt to login and handle responce
        var answer = UserManagement.login_user(sw, data);
        sw.socket.emit('is-login-completed', answer.login_prompt);
        if (answer.login_prompt == 'ok') {
            let user = answer.user
            Alerts.log_to_user(user, 'hello ' + data.login)

            // this.send_battle_data_to_user(answer.user);
            // this.send_all(user.get_character());

            // generate session for easier login later on
            let session = generate_session(20);
            user.socket.emit('session', session);
            current_sessions[session] = user.data.id;

            console.log('user ' + data.login + ' logged in')
        }
    }

    export function register(sw: SocketWrapper, data: {login: string, password: string}) {
        // check that user doesn't try to register while being logged in
        if (sw.user_id != '#') {
            sw.socket.emit('is-login-valid', 'you-are-logged-in');
            return
        }

        //validate credentials
        let responce = ValidatorSM.validate_creds(data)
        sw.socket.emit('is-reg-valid', responce);
        if (responce != 'ok') {
            return
        }

        // attempt registration and handle responce
        let answer = UserManagement.register_user(sw, data)
        sw.socket.emit('is-reg-completed', answer.reg_prompt);
        if (answer.reg_prompt == 'ok') {
            let user = answer.user
            user.socket.emit('log-message', 'hello ' + data.login);

            //generate session for easier login later on
            let session = generate_session(20);
            user.socket.emit('session', session);
            current_sessions[session] = user.data.id;

            console.log('user ' + data.login + ' registered')
        }
    }

    function generate_session(length: number): string {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}