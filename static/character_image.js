class CharacterImage {
    constructor(canvas, tmp_canvas) {
        this.canvas = canvas;
        this.tmp_canvas = tmp_canvas;
        this.draw_order = ['eyes', 'blood_eyes', 'pupils', 'head', 'mouth', 'wrinkles'];
        this.images = {
            head: 'apu_head_base_0', 
            eyes: 'apu_eyes_0', 
            blood_eyes: 'apu_blood_eyes_0', 
            pupils: 'apu_pupils_0',
            magic_pupils: 'apu_pupils_1',
            mouth_1: 'apu_mouth_1',
            mouth_0: 'apu_mouth_0',
            wrinkles: 'apu_wrinkles_0',
            blood_0: 'apu_blood_0',
            blood_1: 'apu_blood_1',
            blood_2: 'apu_blood_2',
            blood_3: 'apu_blood_3',
            blood_4: 'apu_blood_4'
        };
        this.stats = {rage: 0, blood: 0, power: 0};
        this.w = 200;
        this.h = 136;
        this.pupils_phi = -Math.PI / 2
        this.pupils_rad = 3
    }

    update(rage, blood, power) {
        this.stats.rage = rage;
        this.stats.blood = blood;
        this.stats.power = power;
    }

    draw() {
        var ctx = this.canvas.getContext('2d');
        var tmp = this.tmp_canvas.getContext('2d');
        ctx.clearRect(0, 0, 400, 400);
        draw_image(ctx, images[this.images['eyes']], 0, 0, this.w, this.h);
        tmp.clearRect(0, 0, 400, 400);
        draw_image(tmp, images[this.images['blood_eyes']], 0, 0, this.w, this.h);
        var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
        var rage = this.stats.rage;
        for (var i = 3; i < image_data.data.length; i+=4) {
            image_data.data[i] = Math.floor(image_data.data[i] * rage / 100)
        }
        tmp.putImageData(image_data, 0, 0);
        ctx.drawImage(this.tmp_canvas, 0, 0);

        var pow = this.stats.power;
        tmp.clearRect(0, 0, 400, 400);
        draw_image(tmp, images[this.images['magic_pupils']], 0, 0, this.w, this.h);
        var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
        for (var i = 3; i < image_data.data.length; i+=4) {
            image_data.data[i] = Math.floor(image_data.data[i] * pow / 100)
        }
        tmp.putImageData(image_data, 0, 0);

        if (rage > 50) {
            let x = Math.cos(this.pupils_phi) * this.pupils_rad * 1.5 - 10;
            let y = Math.sin(this.pupils_phi) * this.pupils_rad * 0.5 - 10;
            draw_image(ctx, images[this.images['pupils']], x, y, this.w, this.h);
            ctx.drawImage(this.tmp_canvas, x, y);
            this.pupils_phi += Math.PI / 16;
        }
        else {
            draw_image(ctx, images[this.images['pupils']], 0, 0, this.w, this.h);
            ctx.drawImage(this.tmp_canvas, 0, 0);
        }

        draw_image(ctx, images[this.images['head']], 0, 0, this.w, this.h);
        
        let tmp_blood = this.stats.blood;
        let c = 0;
        while (tmp_blood > 0 && c <= 4) {
            tmp.clearRect(0, 0, 400, 400);
            draw_image(tmp, images[this.images['blood_' + c]], 0, 0, this.w, this.h)
            if (tmp_blood < 20) {
                var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
                for (var i = 3; i < image_data.data.length; i+=4) {
                    image_data.data[i] = Math.floor(image_data.data[i] * tmp_blood / 20)
                }
                tmp.putImageData(image_data, 0, 0);
            }
            ctx.drawImage(this.tmp_canvas, 0, 0);
            tmp_blood -= 20;
            c += 1;
        }

        tmp.clearRect(0, 0, 400, 400);
        draw_image(tmp, images[this.images['wrinkles']], 0, 0, this.w, this.h);
        var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
        var rage = this.stats.rage;
        for (var i = 3; i < image_data.data.length; i+=4) {
            image_data.data[i] = Math.floor(image_data.data[i] * rage / 100)
        }
        tmp.putImageData(image_data, 0, 0);
        ctx.drawImage(this.tmp_canvas, 0, 0);

        if (rage > 80) {
            draw_image(ctx, images[this.images['mouth_1']], 0, 0, this.w, this.h);
        }
        else {
            draw_image(ctx, images[this.images['mouth_0']], 0, 0, this.w, this.h);
        }
    }
}