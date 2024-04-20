import { equip } from "@custom_types/inventory.js";
import { EQUIPMENT_TAGS, display_layers } from "../equip_strings.js";

export class ImageComposer {
    private static canvas : OffscreenCanvas = new OffscreenCanvas(2048, 2048);
    private static context : OffscreenCanvasRenderingContext2D = this.canvas.getContext("2d")!
    private static loaded : number = 0
    private static to_load : number = 0

    private static w = 0
    private static h = 0

    private static loaded_images : Record<string, HTMLImageElement> = {}
    private static loaded_images_body : HTMLImageElement[] = []

    static load(race_model: string, data : equip, onload : () => void) {
        this.loaded_images = {}
        this.loaded_images_body = []
        this.w = 0
        this.h = 0
        this.loaded = 0
        this.to_load = 0

        const preloading_status = {
            value: false
        }

        const body_array = []

        if (race_model != 'human') {
            body_array.push(`../static/img/character_image/${race_model}/pose.png`)
        } else {
            body_array.push(`../static/img/character_image/${race_model}/empty.png`)
            body_array.push('../static/img/character_image/human/left_arm.PNG')
            body_array.push('../static/img/character_image/human/body.PNG')
            body_array.push('../static/img/character_image/human/right_arm.PNG')
        }

        this.loaded = 0
        this.to_load = 0

        for (let item of body_array) {
            const image = new Image()
            image.src = item;
            this.loaded_images_body.push(image);
            this.to_load++;

            ((composer, callback) => image.onload = () => {
                composer.w = Math.max(composer.w, image.width)
                composer.h = Math.max(composer.h, image.height)

                composer.loaded++
                if ((composer.loaded == composer.to_load) && preloading_status.value) {
                    callback()
                }
            })(this, onload)
        }

        for (const layer of display_layers){
            if ((layer != 'on_top') && (race_model != 'human')) {continue}

            for (const tag of EQUIPMENT_TAGS) {
                let item_tag = data[tag]?.prototype_id||'empty';
                if (tag == 'secondary') {
                    continue
                }

                this.to_load++;
                const image = new Image()
                if (item_tag == 'empty') {
                    image.src = `../static/img/character_image/${race_model}/${item_tag}.png`
                } else if (race_model == 'human') {
                    image.src = `../static/img/character_image/${race_model}/${tag}/${item_tag}_${layer}.PNG`
                } else {
                    image.src = `../static/img/character_image/${race_model}/${item_tag}.png`
                }

                ((composer, callback) => image.onload = () => {
                    composer.w = Math.max(composer.w, image.width)
                    composer.h = Math.max(composer.h, image.height)

                    composer.loaded++
                    composer.loaded_images[layer + "_" + tag] = image
                    if ((composer.loaded == composer.to_load) && preloading_status.value) {
                        callback()
                    }
                })(this, onload)
            }
        }

        preloading_status.value = true
        if (this.loaded == this.to_load) {
            onload()
        }
    }

    static compose() {
        this.context.clearRect(0, 0, 2048, 2048)

        if (this.loaded_images_body[0] && this.loaded_images_body[0].complete)
            this.context.drawImage(this.loaded_images_body[0], 0, 0)
        for (let tag of EQUIPMENT_TAGS.slice().reverse()) {
            if (this.loaded_images["behind_all_" + tag] && this.loaded_images["behind_all_" + tag].complete)
                this.context.drawImage(this.loaded_images["behind_all_" + tag], 0, 0)
        }
        if (this.loaded_images_body[1] && this.loaded_images_body[1].complete)
            this.context.drawImage(this.loaded_images_body[1], 0, 0)
        for (let tag of EQUIPMENT_TAGS) {
            if (this.loaded_images["behind_body_" + tag] && this.loaded_images["behind_body_" + tag].complete)
                this.context.drawImage(this.loaded_images["behind_body_" + tag], 0, 0)
        }
        if (this.loaded_images_body[2] && this.loaded_images_body[2].complete)
            this.context.drawImage(this.loaded_images_body[2], 0, 0)
        for (let tag of EQUIPMENT_TAGS) {
            if (this.loaded_images["behind_right_arm_" + tag] && this.loaded_images["behind_right_arm_" + tag].complete)
                this.context.drawImage(this.loaded_images["behind_right_arm_" + tag], 0, 0)
        }
        if (this.loaded_images_body[3] && this.loaded_images_body[3].complete)
            this.context.drawImage(this.loaded_images_body[3], 0, 0)

        for (let tag of EQUIPMENT_TAGS) {
            if (this.loaded_images["on_top_" + tag] && this.loaded_images["on_top_" + tag].complete)
                this.context.drawImage(this.loaded_images["on_top_" + tag], 0, 0)
        }
    }

    static draw_to(target: CanvasRenderingContext2D, x : number, y : number) {
        console.log("!!!!!!!", this.w, this.h)
        target.drawImage(this.canvas, 0, 0, this.w, this.h, x, y - this.h, this.w, this.h)
    }

    static update_equip_image(
        target : CanvasRenderingContext2D,
        race_model: string,
        data : equip,
        x : number,
        y : number,
        on_draw : () => void
    ) {
        this.load(race_model, data, () => {
            setTimeout(() => {
                ImageComposer.compose()
                ImageComposer.draw_to(target, x, y)
                on_draw()
            }, 25
        )})
    }
}