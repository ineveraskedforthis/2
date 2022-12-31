/* exported images_list */
// https://stackoverflow.com/a/53294054/10281950
var numLoading = 0;
// let images_list: [string[], string[]] = [[], []];
let names = [];
let files = [];
function add_image_to_load(name, filename) {
    names.push(name);
    files.push(filename);
}
add_image_to_load('map', 'map');
add_image_to_load('background', 'background');
add_image_to_load('forest_background', 'forest_background');
add_image_to_load('battle_bg_colony', 'battle_bg_colony');
add_image_to_load('battle_bg_red_steppe', 'battle_bg_colony');
export var ANIMATIONS = {};
export var IMAGES = {};
function load_animation(tag_thing, tag_animation, count, on_image_load) {
    numLoading += 1;
    ANIMATIONS[tag_thing + '_' + tag_animation] = {
        length: count,
        data: new Image()
    };
    ANIMATIONS[tag_thing + '_' + tag_animation].data.src = ['static', 'img', 'animation', tag_thing, tag_animation + '.png'].join('/');
    ANIMATIONS[tag_thing + '_' + tag_animation].data.onload = on_image_load;
}
function load_animation_set(tag, attack, idle, move, prepare, on_image_load) {
    load_animation(tag, 'idle', idle, on_image_load);
    load_animation(tag, 'move', move, on_image_load);
    load_animation(tag, 'prepare', prepare, on_image_load);
    load_animation(tag, 'attack', attack, on_image_load);
}
add_image_to_load('attack_0', 'battle/attack_0');
add_image_to_load('attack_1', 'battle/attack_1');
export function loadImages(onAllLoaded) {
    numLoading = names.length;
    const onload = () => {
        numLoading -= 1;
        if (numLoading === 0) {
            onAllLoaded();
        }
    };
    load_animation_set('rat', 1, 2, 1, 1, onload);
    load_animation_set('bigrat', 1, 1, 1, 1, onload);
    load_animation_set('magerat', 1, 1, 1, 1, onload);
    load_animation_set('elo', 1, 1, 5, 1, onload);
    load_animation_set('human', 1, 1, 6, 1, onload);
    load_animation_set('graci', 1, 1, 5, 1, onload);
    // const images: ImagesDict = {};
    for (let i = 0; i < names.length; i++) {
        // console.log(i, names[i], files[i])
        const img = IMAGES[names[i]] = new Image;
        img.src = 'static/img/' + files[i] + ".png";
        img.onload = onload;
    }
}
