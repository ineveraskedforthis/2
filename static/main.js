// const game_tabs = ['map', 'battle', 'skilltree', 'market', 'character', 'quest', 'stash', 'craft']
import { init_stash, update_stash } from './modules/Stash/stash.js';
import { init_authentication_control } from './modules/Auth/login.js';
import { BattleImage } from './modules/Battle/battle_image.js';
import { init_battle_control } from './modules/Battle/battle_image_init.js';
import { set_up_character_creation_UI } from './modules/CharacterCreation/main.js';
import { set_up_character_model } from './modules/CharacterImage/main.js';
import { CharacterInfoCorner } from './modules/CharacterInfo/main.js';
import { CharacterScreen } from './modules/CharacterScreen/character_screen.js';
import { init_character_list_interactions } from './modules/CharactersList/main.js';
import { elementById, selectHTMLs } from './modules/HTMLwrappers/common.js';
import { init_market_items, market_items } from './modules/Market/items_market.js';
import { init_market_bulk_infrastructure, new_market_bulk, new_market_mini } from './modules/Market/market.js';
import { set_up_market_headers } from './modules/Market/market_header.js';
import { init_messages_interactions, new_log_message } from './modules/MessageBox/new_log_message.js';
import { init_skills } from './modules/Skills/main.js';
import { init_game_scene, login, reg } from './modules/ViewManagement/scene.js';
import { tab } from './modules/ViewManagement/tab.js';
import { socket } from "./modules/Socket/socket.js";
import { loadImages } from './modules/load_images.js';
import { draw_map_related_stuff, init_map } from './modules/Map/map.js';
import { init_detailed_character_statistics } from './request_perks.js';
import { globals } from './modules/globals.js';
import { AnimatedValue, Value, animated_values_storage } from './modules/Values/collection.js';
import { new_craft_bulk, new_craft_item, new_craft_table, update_craft_item_div } from './modules/Craft/craft.js';
import { init_locations } from './modules/Locations/request_locations.js';
import { BackgroundImage } from './modules/BackgroundImage/background_image.js';
import { init_equipment_screen, init_equipment_screen_mini } from './modules/Equipment/equipment.js';
import { EquipSlotConfiguration } from "./content.js";
import { create_backpack_list, create_backpack_list_mini } from './modules/Equipment/backpack.js';
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
const locations_list = init_locations();
tab.turn_on('map');
const maps = init_map();
tab.turn_off('map');
init_game_scene(maps);
const background_image = new BackgroundImage(locations_list[0]);
const equip_tables = [];
for (const container of selectHTMLs(".equip-display")) {
    equip_tables.push(init_equipment_screen(container, socket));
}
for (const container of selectHTMLs(".equip-display-mini")) {
    equip_tables.push(init_equipment_screen_mini(container));
}
const backpack_tables = [];
for (const container of selectHTMLs(".backpack-display")) {
    backpack_tables.push(create_backpack_list(container));
}
for (const container of selectHTMLs(".backpack-display-mini")) {
    backpack_tables.push(create_backpack_list_mini(container));
}
const market_bulk = new_market_bulk();
const markets_mini = [];
for (const container of selectHTMLs(".shop-display-mini")) {
    markets_mini.push(new_market_mini(container));
}
const craft_tables = [];
for (const container of selectHTMLs(".craft-display")) {
    craft_tables.push(new_craft_table(container));
}
socket.on('craft-bulk-complete', (msg) => {
    new_craft_bulk(craft_tables, msg);
});
socket.on('craft-item', (msg) => {
    update_craft_item_div(craft_tables, msg);
});
socket.on('craft-item-complete', (msg) => {
    new_craft_item(craft_tables, msg);
});
socket.on("character_data", (msg) => {
    globals.character_data = {
        id: msg.id,
        name: msg.name,
        savings: new AnimatedValue(socket, "savings", [market_bulk, market_items, ...markets_mini]),
        savings_trade: new AnimatedValue(socket, "savings_trade", []),
        location_id: new Value(socket, "location_id", [background_image, ...locations_list]),
        stash: []
    };
    init_battle_control();
    for (const map of maps) {
        map.update_canvas_size();
    }
    socket.emit('request-tags');
    socket.emit('request-local-locations');
    socket.emit("request-map");
    socket.emit("request-battle-data");
    init_stash([market_bulk]);
    init_market_bulk_infrastructure(market_bulk);
    socket.emit('request-craft');
    socket.emit('request-belongings');
});
socket.on('stash-update', msg => {
    // console.log('stash-update');
    // console.log(msg);
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
socket.on('market-data', data => {
    market_bulk.data = data;
    for (const minimarket of markets_mini) {
        minimarket.data = data;
    }
});
// handle tutorial
{
    elementById("skip_tutorial").onclick = () => {
        localStorage.setItem("tutorial", "passed");
        elementById("tutorial").classList.add("hidden");
        elementById("tutorial_backdrop").classList.add("hidden");
    };
    //hide tutorial if it was passed
    if (localStorage.getItem("tutorial") != null) {
        elementById("tutorial").classList.add("hidden");
        elementById("tutorial_backdrop").classList.add("hidden");
    }
    else {
        // handle tutorial logic
        let saved_callback = () => { return 0; };
        function show_thing(element) {
            element.classList.add("over-backdrop");
        }
        function highlight_thing(element) {
            element.classList.add("border-yellow");
            element.classList.add("highlight-animation");
        }
        function hide_thing(element) {
            element.classList.remove("over-backdrop");
        }
        function unhighlight_thing(element) {
            element.classList.remove("border-yellow");
            element.classList.remove("highlight-animation");
        }
        function attach_tutorial_callback(element, tutorial_state_update) {
            saved_callback = element.onclick;
            function new_callback(ev) {
                if (saved_callback !== null) {
                    saved_callback(ev);
                }
                // element.classList.remove("over-backdrop");
                // element.classList.remove("border-yellow")
                // element.classList.remove("highlight-animation");
                tutorial_state_update();
                element.onclick = saved_callback;
            }
            element.onclick = new_callback;
        }
        function update_tutorial_state() {
            if (!elementById("tutorial_0").classList.contains("hidden")) {
                elementById("tutorial_0").classList.add("hidden");
                elementById("tutorial_1").classList.remove("hidden");
                // show_thing(elementById("market_tab"))
                show_thing(elementById("goods_list_buy"));
                show_thing(elementById("market_buy_header"));
                highlight_thing(elementById("market_buy_header"));
                hide_thing(elementById("market_button"));
                unhighlight_thing(elementById("market_button"));
                attach_tutorial_callback(elementById("market_buy_header"), update_tutorial_state);
            }
            else if (!elementById("tutorial_1").classList.contains("hidden")) {
                elementById("tutorial_1").classList.add("hidden");
                elementById("tutorial_2").classList.remove("hidden");
                // hide_thing(elementById("goods_list_buy"));
                hide_thing(elementById("market_buy_header"));
                unhighlight_thing(elementById("market_buy_header"));
                show_thing(elementById("open_auction"));
                highlight_thing(elementById("open_auction"));
                // show_thing(elementById("goods_list_sell"))
                attach_tutorial_callback(elementById("open_auction"), update_tutorial_state);
            }
            else if (!elementById("tutorial_2").classList.contains("hidden")) {
                elementById("tutorial_2").classList.add("hidden");
                elementById("tutorial_3").classList.remove("hidden");
                hide_thing(elementById("open_auction"));
                unhighlight_thing(elementById("open_auction"));
                hide_thing(elementById("goods_list_buy"));
                show_thing(elementById("auction_house_tab"));
                show_thing(elementById("skilltree_button"));
                highlight_thing(elementById("skilltree_button"));
                attach_tutorial_callback(elementById("skilltree_button"), update_tutorial_state);
            }
            else if (!elementById("tutorial_3").classList.contains("hidden")) {
                elementById("tutorial_3").classList.add("hidden");
                elementById("tutorial_4").classList.remove("hidden");
                hide_thing(elementById("auction_house_tab"));
                elementById("market_tab").style.zIndex = "";
                hide_thing(elementById("skilltree_button"));
                unhighlight_thing(elementById("skilltree_button"));
                elementById("skilltree_tab").style.zIndex = "";
                show_thing(elementById("skilltree_tab"));
                show_thing(elementById("craft_button"));
                highlight_thing(elementById("craft_button"));
                attach_tutorial_callback(elementById("craft_button"), update_tutorial_state);
            }
            else if (!elementById("tutorial_4").classList.contains("hidden")) {
                elementById("tutorial_4").classList.add("hidden");
                elementById("tutorial_5").classList.remove("hidden");
                hide_thing(elementById("skilltree_tab"));
                hide_thing(elementById("craft_button"));
                unhighlight_thing(elementById("craft_button"));
                elementById("craft_tab").style.zIndex = "";
                show_thing(elementById("craft_tab"));
                show_thing(elementById("map_button"));
                highlight_thing(elementById("map_button"));
                attach_tutorial_callback(elementById("map_button"), update_tutorial_state);
            }
            else if (!elementById("tutorial_5").classList.contains("hidden")) {
                elementById("tutorial_5").classList.add("hidden");
                hide_thing(elementById("map_button"));
                unhighlight_thing(elementById("map_button"));
                localStorage.setItem("tutorial", "passed");
                elementById("tutorial").classList.add("hidden");
                elementById("tutorial_backdrop").classList.add("hidden");
            }
        }
        //step 0
        {
            let market_button = elementById("market_button");
            show_thing(market_button);
            highlight_thing(market_button);
            attach_tutorial_callback(market_button, update_tutorial_state);
        }
    }
}
socket.on('is-reg-completed', msg => reg(msg));
socket.on('is-login-completed', msg => login(msg));
socket.on('session', msg => { localStorage.setItem('session', msg); });
socket.on('reset_session', () => { localStorage.setItem('session', 'null'); });
socket.on('char-info-detailed', msg => character_screen.update(msg));
socket.on('equip-update', (msg) => {
    // update_equip_image(msg.equip)
    //console.log('equip update')
    //console.log(msg)
    let equip_data = [];
    for (let slot of Object.values(EquipSlotConfiguration.EQUIP_SLOT_SLOT_STRING)) {
        const item = msg.equip[slot];
        if (item == undefined)
            continue;
        equip_data.push({
            equip_slot: slot,
            item: item
        });
    }
    console.log("filtered equip data:");
    console.log(equip_data);
    for (const item of equip_tables) {
        item.data = equip_data;
    }
    for (const item of backpack_tables) {
        item.data = msg.backpack.items;
    }
});
// UI animations update loop
var delta = 0;
var previous = undefined;
var current_tick = 0;
var zero = undefined;
// var FRAMES = 0
function draw(time) {
    // FRAMES++;
    if (previous == undefined) {
        previous = time;
    }
    if (zero == undefined) {
        zero = time;
    }
    current_tick += time - previous;
    if (current_tick > 15) {
        globals.now = Date.now();
        current_tick -= 15;
        for (const value of animated_values_storage) {
            value.update_display();
        }
    }
    delta = (time - previous) / 1000;
    previous = time;
    draw_map_related_stuff(maps, delta);
    if (elementById('actual_game_scene').style.visibility == 'visible') {
        if (!elementById('battle_tab').classList.contains('hidden')) {
            BattleImage.draw(delta);
        }
    }
    window.requestAnimationFrame(draw);
}
const images = loadImages(() => {
    //console.log(images);
    window.requestAnimationFrame(draw);
});

