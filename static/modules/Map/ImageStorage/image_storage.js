var _a;
export class ImageStorage {
    static load_image(url) {
        const image = new Image();
        image.src = url;
        const i = (this.vacant_image_index / this.max_images_per_side) | 0;
        const j = this.vacant_image_index - i * this.max_images_per_side;
        const x = i * this.per_image_dim;
        const y = j * this.per_image_dim;
        this.vacant_image_index += 1;
        ((context, x, y) => (image.onload = () => {
            this.context.drawImage(image, x, y);
        }))(this.context, x, y);
        return {
            dim_h: this.per_image_dim,
            dim_w: this.per_image_dim,
            x: x,
            y: y
        };
    }
    static draw_image(target_context, image, x, y) {
        // target_context.drawImage(this.texture_atlas, 0, 0)
        target_context.drawImage(this.texture_atlas, image.x, image.y, image.dim_w, image.dim_h, x, y, this.per_image_dim, this.per_image_dim);
    }
}
_a = ImageStorage;
ImageStorage.max_dim = 2048;
ImageStorage.per_image_dim = 64;
ImageStorage.max_images_per_side = _a.max_dim / _a.per_image_dim;
ImageStorage.vacant_image_index = 0;
ImageStorage.texture_atlas = new OffscreenCanvas(_a.max_dim, _a.max_dim);
ImageStorage.context = _a.texture_atlas.getContext("2d");
(() => {
    _a.context.clearRect(0, 0, _a.max_dim, _a.max_dim);
})();
