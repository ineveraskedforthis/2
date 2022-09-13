import { CharacterGenericPart } from "../base_game_classes/character_generic_part";
import { DummyUser, User } from "../user";
import { PgPool, World } from "../world";
var bcrypt = require('bcryptjs');
var salt = process.env.SALT;
import {constants} from '../static_data/constants'
import { socket_manager } from "../../game_launch";
var common = require("../common.js")

type LoginResponce = {login_prompt: 'wrong-login', user: undefined}|{login_prompt: 'wrong-password', user: undefined}|{login_prompt: 'ok', user: User}
type RegResponce = {reg_prompt: 'login-is-not-available', user: undefined}|{reg_prompt: 'ok', user: User}

export var users: User[]
export var users_online: boolean[]


namespace UserManagement {
    function create_dummy_user() {
        return new DummyUser()
    }

    function register_player(data: {login: string, password: string}) {
        var login_is_available = this.check_login(pool, data.login);
        if (!login_is_available) {
            return {reg_prompt: 'login-is-not-available', user: undefined};
        }
        var hash = bcrypt.hash(data.password, salt);
        var new_user = this.create_new_user();
        new_user.set_login(data.login);
        new_user.set_password_hash(hash);
        var id = 
        var id = await new_user.init(pool);
        this.users[id] = new_user;
        return({reg_prompt: 'ok', user: new_user});
    }

}

export class UserManager{
    users: User[]
    users_online: boolean[]


    constructor() {
        this.users = [];
        this.users_online = [];
    }

    async reg_player(pool: PgPool, ): Promise<RegResponce> {
        
    }

    create_new_user() {
        return new User()
    }

    async login_player(pool: PgPool, data: {login: string, password: string}): Promise<LoginResponce> {
        var user_data = await this.load_user_data_from_db(pool, data.login);
        if (user_data == undefined) {
            return {login_prompt: 'wrong-login', user: undefined};
        }
        var password_hash = user_data.password_hash;
        var f = await bcrypt.compare(data.password, password_hash);
        if (f) {
            var user = await this.load_user_to_memory(pool, user_data);
            return({login_prompt: 'ok', user: user});
        }
        return {login_prompt: 'wrong-password', user: undefined};
    }

    new_user_online(user: User) {
        if (user.id != -1) {
            this.users_online[user.id] = true;
            console.log(user.login, ' logged in');
            socket_manager.update_user_list()
        }
    }
    
    user_disconnects(user: User) {
        if (this.users_online[user.id]) {
            this.users_online[user.id] = false;
            socket_manager.update_user_list();
        }
    }

    get_user_from_character(character: CharacterGenericPart):User|undefined {
        return this.users[character.user_id]
    }

    get_user(user_id: number) {
        return this.users[user_id]
    }

    async check_login(pool: PgPool, login: string) {
        var res = await common.send_query(pool, constants.find_user_by_login_query, [login]);
         // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            return true
        }
        if (res.rows.length == 0) {
            return true;
        }
        return false;
    }

    async load_user_data_from_db(pool: PgPool, login: string) {
        var res = await common.send_query(pool, constants.find_user_by_login_query, [login]);
         // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            return undefined;
        }
        if (res.rows.length == 0) {
            return undefined;
        }
        return res.rows[0];
    }

    async load_user_to_memory(pool: PgPool, data: any) {
        var user = this.create_new_user();
        await user.load_from_json(pool, data);
        this.users[user.id] = user;
        return user;
    }
}