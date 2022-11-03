import { set_version } from "./game_launch"

export function migrate(current_version:number, target_version:number) {
    console.log('migration from ' + current_version  + ' to ' + target_version)
    if (current_version == 0) {
        set_up_initial_data()
    } 
}

function set_up_initial_data() {
    set_version(1)
}