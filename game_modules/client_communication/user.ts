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

export class RequiredUpdates {
    character_status: boolean;
    savings: boolean;
    stash: boolean;
    inventory: boolean;
    character_created: boolean

    all_skills: boolean
    cooking: boolean
    cook_elo: boolean

    constructor() {
        this.character_status = false
        this.savings = false
        this.stash = false
        this.inventory = false
        this.character_created = false
        this.all_skills = false
        this.cooking = false
        this.cook_elo = false
    }

    switch_on_all_data() {
        this.character_status = true
        this.savings = true
        this.stash = true
        this.inventory = true
        this.all_skills = true
        // this.cooking = true
    }

    turn_off_all() {
        this.character_status = false
        this.savings = false
        this.stash = false
        this.inventory = false
        this.character_created = false
        this.all_skills = false
        this.cooking = false
        this.cook_elo = false
    }

    turn_on_cooking() {
        if (this.all_skills) return
        this.cooking = true
        this.cook_elo = true
    }

    turn_on_all_skills() {
        this.all_skills = true
        this.cooking = false
        this.cook_elo = false
    }

    new_character() {
        this.switch_on_all_data()
        this.character_created = true
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