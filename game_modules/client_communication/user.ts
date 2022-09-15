import { Socket } from "../../server";
import { char_id } from "../base_game_classes/character/character";

export type user_id = number & {__brand: "user_id"}
export type user_online_id = user_id & {__brand2: "online"}

export type TEMP_USER_ID = '#'
export type TEMP_CHAR_ID = '@'

export class UserData {
    id: user_id
    login: string
    password_hash: string
    char_id: char_id|TEMP_CHAR_ID
    
    constructor(id: number, char_id:char_id|TEMP_CHAR_ID, login:string, password_hash:string) {
        this.id = id as user_id
        this.char_id = char_id
        this.login = login
        this.password_hash = password_hash
    }
}

export class SocketWrapper {
    socket: Socket
    user_id: user_online_id|TEMP_USER_ID
    
    constructor(socket: Socket) {
        this.socket = socket
        this.user_id = '#'
    }
}

export class RequiredUpdates {
    character_status: boolean;
    savings: boolean;
    stash: boolean;
    inventory: boolean;
    character_created: boolean

    constructor() {
        this.character_status = false
        this.savings = false
        this.stash = false
        this.inventory = false
        this.character_created = false
    }

    switch_on_all_data() {
        this.character_status = true
        this.savings = true
        this.stash = true
        this.inventory = true
    }

    turn_off_all() {
        this.character_status = false
        this.savings = false
        this.stash = false
        this.inventory = false
        this.character_created = false
    }

    new_character() {
        this.switch_on_all_data()
        this.character_created = true
    }
}

export class User {
    data: UserData
    socket: Socket
    updates: RequiredUpdates
    logged_in: boolean

    constructor(socket: Socket, data: UserData) {
        this.socket = socket
        this.data = data
        this.logged_in = false
        this.updates = new RequiredUpdates()
    }
}