import { Socket } from "../../server";
import { TEMP_character_id } from "@custom_types/common";
import { character_id, user_id, user_online_id } from "@custom_types/ids";
import { Update, update_flags } from "./causality_graph";

export class UserData {
    id: user_id
    login: string
    password_hash: string
    character_id: character_id|TEMP_character_id
    tester_account: boolean|undefined

    constructor(id: number, character_id:character_id|TEMP_character_id, login:string, password_hash:string, tester_flag:boolean) {
        this.id = id as user_id
        this.character_id = character_id
        this.login = login
        this.password_hash = password_hash
        this.tester_account = tester_flag
    }
}

export class SocketWrapper {
    socket: Socket
    user_id: user_online_id|undefined

    constructor(socket: Socket) {
        this.socket = socket
        this.user_id = undefined
    }
}

export class User {
    data: UserData
    socket: Socket
    updates: update_flags
    logged_in: boolean
    character_created: boolean
    character_removed: boolean

    constructor(socket: Socket, data: UserData) {
        this.socket = socket
        this.data = data
        this.logged_in = false
        this.character_created = false
        this.character_removed = false
        this.updates = Update.construct()
    }
}