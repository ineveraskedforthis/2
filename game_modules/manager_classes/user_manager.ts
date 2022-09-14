import { CharacterGenericPart } from "../base_game_classes/character_generic_part";
import { SocketWrapper, TEMP_CHAR_ID, User, UserData, user_id, user_online_id } from "../user";
var bcrypt = require('bcryptjs');
var salt = process.env.SALT;
import {constants} from '../static_data/constants'
import { entity_manager, socket_manager } from "../../game_launch";

import fs from "fs"

type LoginResponce = {login_prompt: 'wrong-login', user: undefined}|{login_prompt: 'wrong-password', user: undefined}|{login_prompt: 'ok', user: User}
type RegResponce = {reg_prompt: 'login-is-not-available', user: undefined}|{reg_prompt: 'ok', user: User}


export type UsersData = {[_ in user_id]: UserData}
export type UsersOnline = {[id: user_online_id]: User}

export var users_data_dict: UsersData                           = {}
var users_data_list: UserData[]                                 = []
var login_to_user_data: {[login: string]: UserData|undefined}   = {}
export var users_online_dict: UsersOnline                       = {}
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

            let char_id:number|'@' = '@'
            if (data[1] != '@') {
                char_id = Number(data[1])
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

    function construct_user_data(char_id: number|TEMP_CHAR_ID, login: string, hash: string) {
        last_id = (last_id + 1)
        let user_data = new UserData(last_id, char_id, login, hash)
        users_data_dict[last_id as user_id] = user_data
        login_to_user_data[login] = user_data
        users_data_list.push(user_data)

        return user_data
    }

    // async load_user_to_memory(pool: PgPool, data: any) {
    //     var user = this.create_new_user();
    //     await user.load_from_json(pool, data);
    //     this.users[user.id] = user;
    //     return user;
    // }

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
        if (x.logged_in) return false
    }    

    export function get_user(id: user_online_id) {
        return users_online_dict[id]
    }

    export function get_user_data(id: user_id) {
        return users_data_dict[id]
    }
    
    // function get_new_char(pool: PgPool) {
    //     console.log('user ' + this.id + ' receives a new character')

    //     let old_character = this.get_character()
    //     if (old_character != undefined) {
    //         old_character.user_id = -1;
    //     }  
    //     let character = await this.world.create_new_character(pool, this.login, this.world.get_cell_id_by_x_y(0, 3), this.id)
    //     this.char_id = character.id
    //     character.user_id = this.id;
        
    //     if ((this.world.user_manager.get_user(this.id)) != undefined) {
    //         this.world.user_manager.get_user(this.id).char_id = character.id
    //     }


    //     character.add_explored(1);
    //     await this.save_to_db(pool);
    //     console.log('NEW CHARACTER')
    //     if (this.socket != undefined) {
    //         this.socket.emit('map-data-reset')
    //         this.world.socket_manager.send_all(character)
    //         this.socket.emit('battle-action', {action: 'stop_battle'})
    //     }
    //     return this.char_id
    // }

}