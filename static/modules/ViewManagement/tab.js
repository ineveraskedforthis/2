export const game_tabs = ['map', 'skilltree', 'stash', 'craft', 'equip', 'market'];
// global state
const tabs_queue = [];
const tabs_position = {};
let tabs_properties = {};
let RESIZE_PRESSED_BOTTOM = false;
let RESIZE_PRESSED_TOP = false;
let RESIZE_ELEMENT = null;
export var tab;
(function (tab_1) {
    function save(tag) {
        let tab = document.getElementById(tag + '_tab');
        if (tab == undefined) {
            return;
        }
        tabs_properties[tag] = {
            top: tab.style.top,
            left: tab.style.left,
            width: tab.style.width,
            height: tab.style.height,
            zIndex: tab.style.zIndex,
            active: !tab.classList.contains('hidden')
        };
        localStorage.setItem('tabs_properties', JSON.stringify(tabs_properties));
    }
    tab_1.save = save;
    function load(tag) {
        console.log(tag);
        let tab = document.getElementById(tag + '_tab');
        if (tab == null)
            return;
        console.log(tabs_properties[tag]);
        if (tabs_properties[tag] == undefined) {
            save(tag);
        }
        if (tag != 'battle') {
            tab.style.top = tabs_properties[tag].top;
            tab.style.left = tabs_properties[tag].left;
            tab.style.width = tabs_properties[tag].width;
            tab.style.height = tabs_properties[tag].height;
            tab.style.zIndex = tabs_properties[tag].zIndex;
        }
        if (tabs_properties[tag].active) {
            toogle(tag);
        }
    }
    tab_1.load = load;
    function load_all(socket) {
        tabs_properties = JSON.parse(localStorage.getItem('tabs_properties'));
        if (tabs_properties == null) {
            tabs_properties = {};
        }
        for (let tag of game_tabs) {
            console.log(tabs_properties);
            load(tag);
        }
        window.addEventListener('keydown', function (event) {
            if (event.defaultPrevented) {
                return;
            }
            // console.log(event.code)
            if (event.code == "Escape") {
                // console.log('!!!')
                let length = tabs_queue.length;
                // console.log(length)
                if (length > 0) {
                    toogle(tabs_queue[length - 1]);
                }
            }
        });
        init_corners_bottom();
        init_corners_top();
        init_resize();
        init_buttons(socket);
        let tab = document.getElementById('battle_tab');
        tab.classList.add('hidden');
    }
    tab_1.load_all = load_all;
    function init_buttons(socket) {
        for (let tag of game_tabs) {
            if (tag == 'battle') {
                continue;
            }
            let button = document.getElementById(tag + '_button');
            button.onclick = () => {
                let res = toogle(tag);
                console.log(tag, res);
                if ((tag == 'market') && (res == 'on')) {
                    socket.emit('send-market-data', true);
                }
                else {
                    socket.emit('send-market-data', false);
                }
            };
            {
                let tab = document.getElementById(tag + '_tab');
                let div = document.createElement('div');
                div.classList.add('close_tab');
                div.onclick = tag_to_turn_off_f(tag);
                tab.appendChild(div);
            }
        }
    }
    function init_corners_bottom() {
        const bottom_corners = document.querySelectorAll('.movable > .bottom');
        for (let corner of bottom_corners) {
            (corner => {
                corner.onmousedown = (event) => {
                    if (!RESIZE_PRESSED_BOTTOM) {
                        RESIZE_PRESSED_BOTTOM = true;
                        RESIZE_ELEMENT = corner.parentElement;
                        let tag = corner.parentElement.id.split('_')[0];
                        tab.pop(tag);
                        tab.push(tag);
                    }
                    else {
                        RESIZE_PRESSED_BOTTOM = false;
                        let tag = corner.parentElement.id.split('_')[0];
                        tab.save(tag);
                    }
                };
            })(corner);
        }
    }
    function init_corners_top() {
        let top_corners = document.querySelectorAll('.movable > .top');
        for (let corner of top_corners) {
            (corner => {
                corner.onmousedown = (event) => {
                    if (!RESIZE_PRESSED_TOP) {
                        RESIZE_PRESSED_TOP = true;
                        RESIZE_ELEMENT = corner.parentElement;
                        let tag = corner.parentElement.id.split('_')[0];
                        tab.pop(tag);
                        tab.push(tag);
                    }
                    else {
                        RESIZE_PRESSED_TOP = false;
                        let tag = corner.parentElement.id.split('_')[0];
                        tab.save(tag);
                    }
                };
            })(corner);
        }
    }
    function init_resize() {
        let game_scene = document.getElementById('actual_game_scene');
        game_scene.onmousemove = event => {
            if (RESIZE_ELEMENT == null)
                return;
            if (RESIZE_PRESSED_BOTTOM) {
                let x = event.pageX;
                let y = event.pageY;
                let rect_1 = RESIZE_ELEMENT.getBoundingClientRect();
                let rect_2 = game_scene.getBoundingClientRect();
                let new_width = x - rect_1.left + 2;
                let new_height = y - rect_1.top + 2;
                RESIZE_ELEMENT.style.width = new_width + 'px';
                RESIZE_ELEMENT.style.height = new_height + 'px';
            }
            if (RESIZE_PRESSED_TOP) {
                let x = event.pageX;
                let y = event.pageY;
                let rect_1 = RESIZE_ELEMENT.getBoundingClientRect();
                let rect_2 = game_scene.getBoundingClientRect();
                let width = rect_1.right - rect_1.left;
                let height = rect_1.bottom - rect_1.top;
                let new_left = Math.min(rect_1.right - 1, Math.min(rect_2.right - rect_2.left - width, Math.max(1, x - rect_2.left - 1)));
                let new_top = Math.min(rect_1.bottom - 1, Math.min(rect_2.bottom - rect_2.top - height, Math.max(1, y - rect_2.top - 1)));
                // let new_width = rect_1.right - rect_1.left - (new_left - old_left);
                // let new_height = rect_1.bottom - rect_1.top - (new_top - old_top);
                RESIZE_ELEMENT.style.top = new_top + 'px';
                RESIZE_ELEMENT.style.left = new_left + 'px';
                // RESIZE_ELEMENT.style.width = new_width + 'px'
                // RESIZE_ELEMENT.style.height = new_height + 'px'
            }
        };
    }
    function push(tag) {
        let tab = document.getElementById(tag + '_tab');
        tabs_queue.push(tag);
        tabs_position[tag] = tabs_queue.length - 1;
        tab.style.zIndex = (tabs_queue.length + 1).toString();
        save(tag);
    }
    tab_1.push = push;
    function pop(tag) {
        tabs_queue.splice(tabs_position[tag], 1);
        update_z_levels();
        save(tag);
    }
    tab_1.pop = pop;
    function toogle(tag) {
        let tab = document.getElementById(tag + '_tab');
        let button = document.getElementById(tag + '_button');
        button.classList.toggle('active');
        if (tab.classList.contains('hidden')) {
            tab.classList.remove('hidden');
            push(tag);
            return 'on';
        }
        else {
            tab.classList.add('hidden');
            pop(tag);
            return 'off';
        }
    }
    tab_1.toogle = toogle;
    function turn_on(tag) {
        let tab = document.getElementById(tag + '_tab');
        tab.classList.remove('hidden');
        if (tag != 'battle') {
            let button = document.getElementById(tag + '_button');
            button.classList.toggle('active');
        }
        push(tag);
    }
    tab_1.turn_on = turn_on;
    function turn_off(tag) {
        let tab = document.getElementById(tag + '_tab');
        tab.classList.add('hidden');
        if (tag != 'battle') {
            let button = document.getElementById(tag + '_button');
            button.classList.toggle('active');
        }
        pop(tag);
    }
    tab_1.turn_off = turn_off;
    function tag_to_turn_off_f(tag) {
        return () => turn_off(tag);
    }
    tab_1.tag_to_turn_off_f = tag_to_turn_off_f;
    function update_z_levels() {
        for (let i = 0; i < tabs_queue.length; i++) {
            let tab_tag = tabs_queue[i];
            tabs_position[tab_tag] = i;
            let tab = document.getElementById(tab_tag + '_tab');
            tab.style.zIndex = tabs_position[tab_tag].toString();
            save(tab_tag);
        }
    }
})(tab || (tab = {}));
