import * as path from "path";
import * as fs from 'fs';


export var SAVE_GAME_PATH = path.join('save_1');
if (!fs.existsSync(SAVE_GAME_PATH)) {
    fs.mkdirSync(SAVE_GAME_PATH);
}
console.log(SAVE_GAME_PATH);

export var DEFAULT_WORLD_PATH = path.join('default_world')
if (!fs.existsSync(DEFAULT_WORLD_PATH)) {
    console.log('CREATE NEW WORLD IN WORLD EDITOR')
}

