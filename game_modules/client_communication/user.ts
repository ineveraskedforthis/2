import { Socket } from "../../server";
import { char_id, TEMP_CHAR_ID, TEMP_USER_ID, user_id, user_online_id } from "../types";
import { Update, update_flags } from "./causality_graph";

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

export class User {
    data: UserData
    socket: Socket
    updates: update_flags
    logged_in: boolean
    character_created: boolean
    market_update: boolean

    constructor(socket: Socket, data: UserData) {
        this.socket = socket
        this.data = data
        this.logged_in = false
        this.character_created = false
        this.market_update = false
        this.updates = Update.construct()
    }
}