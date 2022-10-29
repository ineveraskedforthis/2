/* exported images_list */

// eslint-disable-next-line no-undef
check_loading = false

// https://stackoverflow.com/a/53294054/10281950

let images_list = [[], []];

function add_image_to_load(name, filename) {
    images_list[0].push(name)
    images_list[1].push(filename)
}


add_image_to_load('map', 'map')
add_image_to_load('fog_colony', 'fog_colony')
add_image_to_load('fog_rat_plains', 'fog_rat_plains')
add_image_to_load('fog_rest_of_the_world', 'fog_rest_of_the_world')
add_image_to_load('background', 'background')
add_image_to_load('forest_background', 'forest_background')
add_image_to_load('battle_bg_colony', 'battle_bg_colony');
add_image_to_load('battle_bg_red_steppe', 'battle_bg_colony');
add_image_to_load('tost_move_0000', 'tost_0000')
add_image_to_load('tost_idle_0000', 'tost_0000')
add_image_to_load('tost_attack_0000', 'tost_0000')


function load(tag, idle, move, attack) {
    for (let i = 0; i < idle; i++) {
        let num = ("0000" + i).slice(-4);
        add_image_to_load(tag + '_idle_' + num, tag + '_idle_' + num);
    }
    for (let i = 0; i < move; i++) {
        let num = ("0000" + i).slice(-4);
        add_image_to_load(tag + '_move_' + num, tag + '_move_' + num);
    }
    for (let i = 0; i < attack; i++) {
        let num = ("0000" + i).slice(-4);
        add_image_to_load(tag + '_attack_' + num, tag + '_attack_' + num);
    }
}


for (let i = 0; i < 12; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('human_move_' + num, 'human_move_' + num);
}
for (let i = 0; i < 4; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('human_attack_' + num, 'human_attack_' + num);
}
add_image_to_load('human_idle_0000', 'human_idle_0000')

add_image_to_load('attack_0', './battle/attack_0')
add_image_to_load('attack_1', './battle/attack_1')

load('rat', 4, 4, 4);
load('graci', 1, 10, 1);
load('elodino', 1, 5, 2);

// eslint-disable-next-line no-unused-vars
function loadImages(names, files, onAllLoaded) {
    var i, numLoading = names.length;
    const onload = () => --numLoading === 0 && onAllLoaded();
    const images = {};
    for (i = 0; i < names.length; i++) {
        // console.log(i, names[i], files[i])
        const img = images[names[i]] = new Image;        
        img.src = 'static/img/' + files[i] + ".png";
        img.onload = onload;
    }   
    return images;
}



