import { char_id } from "../base_game_classes/character/character";
import { SocketWrapper, TEMP_CHAR_ID, TEMP_USER_ID, User, UserData, user_id, user_online_id } from "../client_communication/user";
var bcrypt = require('bcryptjs');
var salt = process.env.SALT;

import fs from "fs"
import { CharacterSystem } from "../base_game_classes/character/system";
import { HumanTemplateNotAligned } from "../base_game_classes/character/races/human";
import { Link } from "../systems_communication";
import { SendUpdate } from "./network_actions/updates";
import { Alerts } from "./network_actions/alerts";
import { Update } from "./causality_graph";

type LoginResponce = {login_prompt: 'wrong-login', user: undefined}|{login_prompt: 'wrong-password', user: undefined}|{login_prompt: 'ok', user: User}
type RegResponce = {reg_prompt: 'login-is-not-available', user: undefined}|{reg_prompt: 'ok', user: User}


export type UsersData = {[_ in user_id]: UserData}
export type UsersOnline = {[id: user_online_id]: User}

export var users_data_dict: UsersData                           = {}
var users_data_list: UserData[]                                 = []
var login_to_user_data: {[login: string]: UserData|undefined}   = {}
export var users_online_dict: UsersOnline                       = {}
var users_to_update: Set<User>                                  = new Set()

var last_id = 0


export namespace UserManagement {

    export function load_users() {
        console.log('loading users')
        let data = fs.readFileSync('users.txt').toString()
        let lines = data.split('\n')

        for (let line of lines) {
            if (line == '') {continue}
            let data = line.split(' ')
            console.log(data)

            let char_id:char_id|'@' = '@'
            if (data[1] != '@') {
                char_id = Number(data[1]) as char_id
            }

            let user = new UserData(Number(data[0]), char_id, data[2], data[3])            
            users_data_dict[user.id] = user
            login_to_user_data[user.login] = user
            users_data_list.push(user)

            if (user.id > last_id) {
                last_id = user.id
            }
        }
    }

    export function save_users() {
        console.log('saving users')
        let str:string = ''
        for (let item of users_data_list) {
            str = str + item.id + ' ' + item.char_id + ' ' + item.login + ' ' + item.password_hash + '\n'
        }
        fs.writeFileSync('users.txt', str)
        console.log('users saved')
    }

    export function log_out(sw: SocketWrapper) {
        if (sw.user_id == '#') return
        users_online_dict[sw.user_id].logged_in = false
    }

    export function link_socket_wrapper_and_user(sw: SocketWrapper, user: User) {
        user.socket = sw.socket
        sw.user_id = user.data.id as user_online_id
        user.logged_in = true
    }

    export function construct_user(sw: SocketWrapper, data: UserData) {
        let user = new User(sw.socket, data)
        sw.user_id = user.data.id as user_online_id
        users_online_dict[sw.user_id] = user;
        save_users()
        return user
    }

    function construct_user_data(char_id: char_id|TEMP_CHAR_ID, login: string, hash: string) {
        last_id = (last_id + 1)
        let user_data = new UserData(last_id, char_id, login, hash)
        users_data_dict[last_id as user_id] = user_data
        login_to_user_data[login] = user_data
        users_data_list.push(user_data)

        return user_data
    }

    export function login_user(sw: SocketWrapper, data: {login: string, password: string}): LoginResponce {
        // check that user exists
        let user_data = login_to_user_data[data.login]
        if (user_data == undefined) {
            return {login_prompt: 'wrong-login', user: undefined};
        }

        // compare hash of password with hash in storage
        var password_hash = user_data.password_hash;
        let responce =  bcrypt.compareSync(data.password, password_hash)
        if (responce) {
            var user = construct_user(sw, user_data)
            user.logged_in = true
            return({login_prompt: 'ok', user: user});
        }
        return {login_prompt: 'wrong-password', user: undefined};
    }

    export function register_user(sw: SocketWrapper, data: {login: string, password: string}):RegResponce {
        if (login_to_user_data[data.login] != undefined) {
            return {reg_prompt: 'login-is-not-available', user: undefined};
        }

        let hash = bcrypt.hashSync(data.password, salt) 
        let user_data = construct_user_data('@', data.login, hash)
        let user = construct_user(sw, user_data)
        user.logged_in = true
        return({reg_prompt: 'ok', user: user});
    }

    export function user_exists(id: number) {
        if (users_data_dict[id as user_id] == undefined) {
            return false
        }
        return true
    }

    export function user_was_online(id: number) {
        let x = users_online_dict[id as user_online_id]
        if (x == undefined) return false
        return true
    }

    export function user_is_online(id: number) {
        let x = users_online_dict[id as user_online_id]
        if (x == undefined) return false
        if (!x.logged_in) return false
        return true
    }    

    export function get_user(id: user_online_id) {
        return users_online_dict[id]
    }

    export function get_user_data(id: user_id) {
        return users_data_dict[id]
    }

    export function get_new_character(id: user_id, name: string, model_variation: any) {
        let user = get_user_data(id)
        if (user.char_id != '@') {
            console.log('attempt to generate character for user who already owns one')
            return
        }

        let character = CharacterSystem.template_to_character(HumanTemplateNotAligned, name)
        character.set_model_variation(model_variation)

        console.log('user ' + user.login + ' gets new character: ' + name + '(id:' + character.id + ')')
        Link.character_and_user_data(character, user)
    }

    export function add_user_to_update_queue(id: user_id|TEMP_USER_ID) {
        console.log('add user to update')
        console.log(id)
        if (id == '#') return
        let user = get_user(id as user_online_id)
        if (user == undefined) return
        console.log('ok')

        users_to_update.add(user)
    }

    export function update_users() {
        console.log('update loop')
        for (let item of users_to_update) {
            console.log('send_update to ' + item.data.login)          
            if (item.character_created) {
                Alerts.generic_user_alert(item, 'character_exists', undefined)
                item.character_created = false
            }
            Update.update_root(item)
        }
        users_to_update.clear()
    }
}