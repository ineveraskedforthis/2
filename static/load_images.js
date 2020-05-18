var images = {}

function load_image(s, callback) {
    var tmp = new Image();
    tmp.src = s;
    tmp.onload = callback
    return tmp
}

var loaded = Array.apply(null, Array(15)).map(() => 0)

function check_loading() {
    let f = 1;
    for (let i = 0; i < loaded.length; i++){
        f *= loaded[i];
    }
    return f
}

images['apu_eyes_0'] = load_image('static/img/apu_base_eyes.png', () => loaded[0] = 1);
images['apu_blood_eyes_0'] = load_image('static/img/apu_eyes_blood.png', () => loaded[1] = 1);
images['apu_pupils_0'] = load_image('static/img/apu_pupils_0.png', () => loaded[2] = 1);
images['apu_head_base_0'] = load_image('static/img/apu_head_base.png', () => loaded[3] = 1);
images['apu_mouth_0'] = load_image('static/img/apu_mouth_0.png', () => loaded[4] = 1);
images['apu_mouth_1'] = load_image('static/img/apu_mouth_1.png', () => loaded[5] = 1);
images['apu_wrinkles_0'] = load_image('static/img/apu_wrinkles.png', () => loaded[6] = 1);
images['apu_blood_0'] = load_image('static/img/apu_blood_0.png', () => loaded[7] = 1);
images['apu_blood_1'] = load_image('static/img/apu_blood_1.png', () => loaded[8] = 1);
images['apu_blood_2'] = load_image('static/img/apu_blood_2.png', () => loaded[9] = 1);
images['apu_blood_3'] = load_image('static/img/apu_blood_3.png', () => loaded[10] = 1);
images['apu_blood_4'] = load_image('static/img/apu_blood_4.png', () => loaded[11] = 1);
images['apu_pupils_1'] = load_image('static/img/apu_pupils_1.png', () => loaded[12] = 1)
images['base_background'] = load_image('static/img/background.png', () => loaded[13] = 1)
images['test_0'] = load_image('static/img/test_0.png', () => loaded[14] = 1)
images['tost_0'] = load_image('static/img/tost_0.png', () => loaded[15] = 1)
