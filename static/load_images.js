check_loading = false

// https://stackoverflow.com/a/53294054/10281950

images_list = [[], []];

function add_image_to_load(name, filename) {
    images_list[0].push(name)
    images_list[1].push(filename)
}

add_image_to_load('apu_eyes_0', 'apu_base_eyes')
add_image_to_load('apu_blood_eyes_0', 'apu_eyes_blood')
add_image_to_load('apu_pupils_0', 'apu_pupils_0')
add_image_to_load('apu_pupils_1', 'apu_pupils_1')
add_image_to_load('apu_head_base_0', 'apu_head_base')
add_image_to_load('apu_mouth_0', 'apu_mouth_0')
add_image_to_load('apu_mouth_1', 'apu_mouth_1')
add_image_to_load('apu_wrinkles_0', 'apu_wrinkles')
for (let i = 0; i < 5; i++) {
    add_image_to_load('apu_blood_' + i, 'apu_blood_' + i)
}
add_image_to_load('base_background', 'background')
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

function loadImages(names, files, onAllLoaded) {
    var i, numLoading = names.length;
    const onload = () => --numLoading === 0 && onAllLoaded();
    const images = {};
    for (i = 0; i < names.length; i++) {
        console.log(i, names[i], files[i])
        const img = images[names[i]] = new Image;        
        img.src = 'static/img/' + files[i] + ".png";
        img.onload = onload;
    }   
    return images;
}



