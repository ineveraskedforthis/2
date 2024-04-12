// const game_tabs = ['map', 'battle', 'skilltree', 'market', 'character', 'quest', 'stash', 'craft']
import { update_stash, update_tags } from './modules/Stash/stash.js';
import { init_authentication_control } from './modules/Auth/login.js';
import { BattleImage } from './modules/Battle/battle_image.js';
import { init_battle_control } from './modules/Battle/battle_image_init.js';
import { set_up_character_creation_UI } from './modules/CharacterCreation/main.js';
import { set_up_character_model, update_equip_image } from './modules/CharacterImage/main.js';
import { CharacterInfoCorner } from './modules/CharacterInfo/main.js';
import { CharacterScreen } from './modules/CharacterScreen/character_screen.js';
import { init_character_list_interactions, update_characters_list } from './modules/CharactersList/main.js';
import { backpack_list } from './modules/Equipment/backpack.js';
import { elementById } from './modules/HTMLwrappers/common.js';
import { init_market_items, market_items } from './modules/Market/items_market.js';
import { init_market_bulk_infrastructure, new_market_bulk } from './modules/Market/market.js';
import { set_up_market_headers } from './modules/Market/market_header.js';
import { init_messages_interactions, new_log_message } from './modules/MessageBox/new_log_message.js';
import { init_skills } from './modules/Skills/main.js';
import { login, reg } from './modules/ViewManagement/scene.js';
import { tab } from './modules/ViewManagement/tab.js';
import { socket } from "./modules/Socket/socket.js";
import { loadImages } from './modules/load_images.js';
import { draw_map_related_stuff } from './modules/map.js';
import { init_detailed_character_statistics } from './request_perks.js';
import { globals } from './modules/globals.js';
import { Value } from './modules/Values/collection.js';
import { equip_list } from './modules/Equipment/equipment.js';
import { new_craft_bulk, new_craft_item, new_craft_table, update_craft_item_div } from './modules/Craft/craft.js';
import { init_locations } from './modules/Buildings/request_buildings.js';
// noselect tabs
[...document.querySelectorAll(".noselect")].forEach(el => el.addEventListener('contextmenu', e => e.preventDefault()));
socket.on('connect', () => {
    console.log('connected');
    let tmp = localStorage.getItem('session');
    if ((tmp != null) && (tmp != 'null')) {
        socket.emit('session', tmp);
    }
});
init_authentication_control();
init_messages_interactions();
const informationCorner = new CharacterInfoCorner(socket);
const character_screen = new CharacterScreen(socket);
set_up_character_model(socket);
init_skills(socket);
set_up_character_creation_UI(socket);
set_up_market_headers();
init_detailed_character_statistics();
init_character_list_interactions();
init_market_items();
init_locations();
init_battle_control();
const market_bulk = new_market_bulk();
socket.on("character_data", (msg) => {
    globals.character_data = {
        id: msg.id,
        name: msg.name,
        savings: new Value(socket, "savings", [market_bulk, market_items]),
        savings_trade: new Value(socket, "savings_trade", []),
        stash: []
    };
    socket.emit('request-tags');
});
socket.on('tags', msg => {
    update_tags(msg, [market_bulk]);
    init_market_bulk_infrastructure(market_bulk);
    const craft_table = new_craft_table();
    socket.on('craft-bulk-complete', (msg) => {
        new_craft_bulk(craft_table, msg);
    });
    socket.on('craft-item', (msg) => {
        update_craft_item_div(craft_table, msg);
    });
    socket.on('craft-item-complete', (msg) => {
        new_craft_item(craft_table, msg);
    });
    socket.emit('request-craft');
    socket.emit('request-belongings');
});
socket.on('stash-update', msg => {
    console.log('stash-update');
    console.log(msg);
    update_stash(msg);
});
socket.on('log-message', msg => {
    if (msg == null) {
        return;
    }
    if (msg == 'you_are_dead') {
        tab.turn_off('battle');
    }
    new_log_message(msg);
});
socket.on('is-reg-completed', msg => reg(msg));
socket.on('is-login-completed', msg => login(msg));
socket.on('session', msg => { localStorage.setItem('session', msg); });
socket.on('reset_session', () => { localStorage.setItem('session', 'null'); });
socket.on('char-info-detailed', msg => character_screen.update(msg));
socket.on('equip-update', (msg) => {
    update_equip_image(msg.equip);
    let equip_data = [];
    for (let item of Object.values(msg.equip)) {
        if (item == undefined)
            continue;
        equip_data.push(item);
    }
    equip_list.data = equip_data;
    backpack_list.data = msg.backpack.items;
});
{
    let test_data = [
        { name: 'Someone', id: 100, dead: false },
        { name: 'Noone', id: 200, dead: true },
        { name: 'Who?', id: 300, dead: true },
        { name: "He", id: 400, dead: false }
    ];
    update_characters_list(test_data);
}
// UI animations update loop
var delta = 0;
var previous = undefined;
function draw(time) {
    if (previous == undefined) {
        previous = time;
    }
    delta = (time - previous) / 1000;
    previous = time;
    draw_map_related_stuff(delta);
    if (elementById('actual_game_scene').style.visibility == 'visible') {
        if (!elementById('battle_tab').classList.contains('hidden')) {
            BattleImage.draw(delta);
        }
    }
    window.requestAnimationFrame(draw);
}
const images = loadImages(() => {
    console.log(images);
    window.requestAnimationFrame(draw);
});
