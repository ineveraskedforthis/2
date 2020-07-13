check_loading = false

// https://stackoverflow.com/a/53294054/10281950

images_list = [[], []];

function add_image_to_load(name, filename) {
    images_list[0].push(name)
    images_list[1].push(filename)
}


add_image_to_load('map', 'map')

add_image_to_load('background', 'background')
add_image_to_load('forest_background', 'forest_background')
add_image_to_load('tost_move_0000', 'tost_0000')
add_image_to_load('tost_idle_0000', 'tost_0000')
add_image_to_load('tost_attack_0000', 'tost_0000')
for (let i = 0; i < 12; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('test_move_' + num, 'test_move_' + num);
}
for (let i = 0; i < 8; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('test_attack_' + num, 'test_attack_' + num);
}
add_image_to_load('test_idle_0000', 'test_idle_0000')
for (let i = 0; i < 4; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('rat_idle_' + num, 'rat_idle_' + num);
}
for (let i = 0; i < 4; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('rat_move_' + num, 'rat_idle_' + num);
}
for (let i = 0; i < 4; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('rat_attack_' + num, 'rat_idle_' + num);
}

for (let i = 0; i < 1; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('graci_idle_' + num, 'graci_idle_' + num);
}
for (let i = 0; i < 10; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('graci_move_' + num, 'graci_move_' + num);
}
for (let i = 0; i < 1; i++) {
    let num = ("0000" + i).slice(-4);
    add_image_to_load('graci_attack_' + num, 'graci_attack_' + num);
}

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



