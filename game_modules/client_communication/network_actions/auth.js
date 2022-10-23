"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const user_manager_1 = require("../user_manager");
const alerts_1 = require("./alerts");
const common_validations_1 = require("./common_validations");
const fs_1 = __importDefault(require("fs"));
var current_sessions = {};
var Auth;
(function (Auth) {
    function load() {
        console.log('loading sessions');
        if (!fs_1.default.existsSync('sessions.txt')) {
            fs_1.default.writeFileSync('sessions.txt', '');
        }
        let data = fs_1.default.readFileSync('sessions.txt').toString();
        let lines = data.split('\n');
        for (let line of lines) {
            if (line == '') {
                continue;
            }
            let data = line.split(' ');
            console.log(data);
            let id = Number(data[1]);
            if (user_manager_1.UserManagement.user_exists(id)) {
                current_sessions[data[0]] = id;
            }
        }
        console.log('sessions are loaded');
    }
    Auth.load = load;
    function save() {
        console.log('saving sessions');
        let str = '';
        for (let session in current_sessions) {
            str = str + session + ' ' + current_sessions[session] + '\n';
        }
        fs_1.default.writeFileSync('sessions.txt', str);
        console.log('sessions saved');
    }
    Auth.save = save;
    function login_with_session(sw, session) {
        console.log('attempt to login with session');
        // check if this session is legit
        if (current_sessions[session] == undefined) {
            sw.socket.emit('reset_session', undefined);
            return;
        }
        console.log('session is legit');
        // retrieve user id and check if such user still exists
        let user_id = current_sessions[session];
        if (!user_manager_1.UserManagement.user_exists(user_id)) {
            sw.socket.emit('reset_session', undefined);
            return;
        }
        console.log('userid is ' + user_id);
        // if this user_id was already logged in, then attempt to login it
        if (user_manager_1.UserManagement.user_was_online(user_id)) {
            // if yes, then just update socket and status on old entry, depending on online status
            if (user_manager_1.UserManagement.user_is_online(user_id)) {
                sw.socket.emit('alert', 'you are already logged in elsewhere');
                return;
            }
            var user = user_manager_1.UserManagement.get_user(user_id);
            user_manager_1.UserManagement.link_socket_wrapper_and_user(sw, user);
        }
        else {
            // if not, create new online user entry    
            let user_data = user_manager_1.UserManagement.get_user_data(user_id);
            var user = user_manager_1.UserManagement.construct_user(sw, user_data);
            user.logged_in = true;
        }
        //send greeting to the user
        alerts_1.Alerts.log_to_user(user, 'hello ' + user.data.login);
        alerts_1.Alerts.login_is_completed(user);
        console.log('user ' + user.data.login + ' logged in');
    }
    Auth.login_with_session = login_with_session;
    function login(sw, data) {
        // check that user doesn't try to log in while being logged in
        if (sw.user_id != '#') {
            sw.socket.emit('is-login-valid', 'you-are-logged-in');
            return;
        }
        console.log('attempt to login');
        console.log(data);
        // check that credentials are valid
        var error_message = common_validations_1.Validator.validate_creds(data);
        sw.socket.emit('is-login-valid', error_message);
        if (error_message != 'ok') {
            return;
        }
        // attempt to login and handle responce
        var answer = user_manager_1.UserManagement.login_user(sw, data);
        sw.socket.emit('is-login-completed', answer.login_prompt);
        if (answer.login_prompt == 'ok') {
            // send greeting
            let user = answer.user;
            alerts_1.Alerts.log_to_user(user, 'hello ' + data.login);
            // generate session for easier login later on
            let session = generate_session(20);
            user.socket.emit('session', session);
            current_sessions[session] = user.data.id;
            save();
            console.log('user ' + data.login + ' logged in');
        }
        else {
            console.log('login failed: ' + answer.login_prompt);
        }
    }
    Auth.login = login;
    function register(sw, data) {
        // check that user doesn't try to register while being logged in
        if (sw.user_id != '#') {
            sw.socket.emit('is-login-valid', 'you-are-logged-in');
            return;
        }
        //validate credentials
        let responce = common_validations_1.Validator.validate_creds(data);
        sw.socket.emit('is-reg-valid', responce);
        if (responce != 'ok') {
            return;
        }
        // attempt registration and handle responce
        let answer = user_manager_1.UserManagement.register_user(sw, data);
        sw.socket.emit('is-reg-completed', answer.reg_prompt);
        if (answer.reg_prompt == 'ok') {
            //send greeting
            let user = answer.user;
            user.socket.emit('log-message', 'hello ' + data.login);
            //generate session for easier login later on
            let session = generate_session(20);
            user.socket.emit('session', session);
            current_sessions[session] = user.data.id;
            save();
            console.log('user ' + data.login + ' registrated');
        }
        else {
            console.log('registration failed: ' + answer.reg_prompt);
        }
    }
    Auth.register = register;
    function generate_session(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
})(Auth = exports.Auth || (exports.Auth = {}));
