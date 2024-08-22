var _a;
import { EQUIPMENT_TAGS, display_layers } from "../equip_strings.js";
export class ImageComposer {
    static load(race_model, data, dead, onload) {
        this.loaded_images = {};
        this.loaded_images_body = [];
        this.w = 0;
        this.h = 0;
        this.loaded = 0;
        this.to_load = 0;
        const preloading_status = {
            value: false
        };
        if (dead) {
            // loading corpses
            let link = `../static/img/character_image/${race_model}/corpse.png`;
            const image = new Image();
            image.src = link;
            this.loaded_images_dead = image;
            this.to_load++;
            ((composer, callback) => image.onload = () => {
                composer.w_dead = Math.max(composer.w_dead, image.width);
                composer.h_dead = Math.max(composer.h_dead, image.height);
                composer.loaded++;
                if ((composer.loaded == composer.to_load) && preloading_status.value) {
                    callback();
                }
            })(this, onload);
        }
        else {
            const body_array = [];
            if (race_model != 'human') {
                body_array.push(`../static/img/character_image/${race_model}/pose.png`);
            }
            else {
                body_array.push(`../static/img/character_image/${race_model}/empty.png`);
                body_array.push('../static/img/character_image/human/left_arm.PNG');
                body_array.push('../static/img/character_image/human/body.PNG');
                body_array.push('../static/img/character_image/human/right_arm.PNG');
            }
            for (let item of body_array) {
                const image = new Image();
                image.src = item;
                this.loaded_images_body.push(image);
                this.to_load++;
                ((composer, callback) => image.onload = () => {
                    composer.w = Math.max(composer.w, image.width);
                    composer.h = Math.max(composer.h, image.height);
                    composer.loaded++;
                    if ((composer.loaded == composer.to_load) && preloading_status.value) {
                        callback();
                    }
                })(this, onload);
            }
            for (const layer of display_layers) {
                if ((layer != 'on_top') && (race_model != 'human')) {
                    continue;
                }
                for (const tag of EQUIPMENT_TAGS) {
                    let item_tag = data[tag]?.prototype_id || 'empty';
                    if (tag == 'secondary') {
                        continue;
                    }
                    this.to_load++;
                    const image = new Image();
                    if (item_tag == 'empty') {
                        image.src = `../static/img/character_image/${race_model}/${item_tag}.png`;
                    }
                    else if (race_model == 'human') {
                        image.src = `../static/img/character_image/${race_model}/${tag}/${item_tag}_${layer}.PNG`;
                    }
                    else {
                        image.src = `../static/img/character_image/${race_model}/${item_tag}.png`;
                    }
                    ((composer, callback) => image.onload = () => {
                        composer.w = Math.max(composer.w, image.width);
                        composer.h = Math.max(composer.h, image.height);
                        composer.loaded++;
                        composer.loaded_images[layer + "_" + tag] = image;
                        if ((composer.loaded == composer.to_load) && preloading_status.value) {
                            callback();
                        }
                    })(this, onload);
                }
            }
        }
        preloading_status.value = true;
        if (this.loaded == this.to_load) {
            onload();
        }
    }
    static compose(dead) {
        this.context.clearRect(0, 0, 2048, 2048);
        if (dead) {
            if (this.loaded_images_dead && this.loaded_images_dead.complete)
                this.context.drawImage(this.loaded_images_dead, 0, 0);
            return;
        }
        if (this.loaded_images_body[0] && this.loaded_images_body[0].complete)
            this.context.drawImage(this.loaded_images_body[0], 0, 0);
        for (let tag of EQUIPMENT_TAGS.slice().reverse()) {
            if (this.loaded_images["behind_all_" + tag] && this.loaded_images["behind_all_" + tag].complete)
                this.context.drawImage(this.loaded_images["behind_all_" + tag], 0, 0);
        }
        if (this.loaded_images_body[1] && this.loaded_images_body[1].complete)
            this.context.drawImage(this.loaded_images_body[1], 0, 0);
        for (let tag of EQUIPMENT_TAGS) {
            if (this.loaded_images["behind_body_" + tag] && this.loaded_images["behind_body_" + tag].complete)
                this.context.drawImage(this.loaded_images["behind_body_" + tag], 0, 0);
        }
        if (this.loaded_images_body[2] && this.loaded_images_body[2].complete)
            this.context.drawImage(this.loaded_images_body[2], 0, 0);
        for (let tag of EQUIPMENT_TAGS) {
            if (this.loaded_images["behind_right_arm_" + tag] && this.loaded_images["behind_right_arm_" + tag].complete)
                this.context.drawImage(this.loaded_images["behind_right_arm_" + tag], 0, 0);
        }
        if (this.loaded_images_body[3] && this.loaded_images_body[3].complete)
            this.context.drawImage(this.loaded_images_body[3], 0, 0);
        for (let tag of EQUIPMENT_TAGS) {
            if (this.loaded_images["on_top_" + tag] && this.loaded_images["on_top_" + tag].complete)
                this.context.drawImage(this.loaded_images["on_top_" + tag], 0, 0);
        }
    }
    static draw_to(target, x, y, dead) {
        console.log("!!!!!!!", this.w, this.h);
        if (dead) {
            target.drawImage(this.canvas, 0, 0, this.w_dead, this.h_dead, x, y - this.h_dead, this.w_dead, this.h_dead);
        }
        else {
            target.drawImage(this.canvas, 0, 0, this.w, this.h, x, y - this.h, this.w, this.h);
        }
    }
    static update_equip_image(target, race_model, data, dead, x, y, on_draw) {
        this.load(race_model, data, dead, () => {
            setTimeout(() => {
                _a.compose(dead);
                _a.draw_to(target, x, y, dead);
                on_draw();
            }, 25);
        });
    }
}
_a = ImageComposer;
ImageComposer.canvas = new OffscreenCanvas(2048, 2048);
ImageComposer.context = _a.canvas.getContext("2d");
ImageComposer.loaded = 0;
ImageComposer.to_load = 0;
ImageComposer.w = 0;
ImageComposer.h = 0;
ImageComposer.w_dead = 0;
ImageComposer.h_dead = 0;
ImageComposer.loaded_images = {};
ImageComposer.loaded_images_body = [];
