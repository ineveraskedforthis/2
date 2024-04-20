export interface ImageStorageEntry {
    dim_h: number,
    dim_w: number,
    x: number,
    y: number,
}

export class ImageStorage {
    private static readonly max_dim = 2048
    private static readonly per_image_dim = 64
    private static readonly max_images_per_side = this.max_dim / this.per_image_dim

    private static vacant_image_index = 0
    private static readonly texture_atlas : OffscreenCanvas = new OffscreenCanvas(this.max_dim, this.max_dim)
    private static readonly context : OffscreenCanvasRenderingContext2D = this.texture_atlas.getContext("2d")!

    static {
        this.context.clearRect(0, 0, this.max_dim, this.max_dim)
    }

    public static load_image(url: string) : ImageStorageEntry {
        const image = new Image();
        image.src = url;

        const i = (this.vacant_image_index / this.max_images_per_side) | 0
        const j = this.vacant_image_index - i * this.max_images_per_side

        const x = i * this.per_image_dim
        const y = j * this.per_image_dim

        this.vacant_image_index += 1;

        ((context, x, y) => (image.onload = () => {
            this.context.drawImage(image, x, y)
        }))(this.context, x, y)

        return {
            dim_h: this.per_image_dim,
            dim_w: this.per_image_dim,
            x: x,
            y: y
        }
    }

    public static draw_image(target_context: CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D, image: ImageStorageEntry, x: number, y: number) {
        // target_context.drawImage(this.texture_atlas, 0, 0)

        target_context.drawImage(
            this.texture_atlas, image.x, image.y, image.dim_w, image.dim_h,
            x, y, this.per_image_dim, this.per_image_dim
        )
    }
}