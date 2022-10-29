import { Convert } from "../../systems_communication";
import { SocketWrapper } from "../user";

export namespace Request {
    export function accuracy(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return;
        
    }
}