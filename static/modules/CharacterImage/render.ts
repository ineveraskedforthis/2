import { equip } from "@custom_types/inventory.js";
import { EQUIPMENT_TAGS, display_layers } from "./equip_strings.js";
import { WeaponConfiguration, ArmourConfiguration } from "@content/content.js";
import { models_description } from "./models.js";

// Vertex shader which is stupid simple as we use it for rendering textured rectangles
const vs_source =
`
attribute vec4 vertex_position;
uniform float x;
uniform float depth;
uniform vec2 size;
uniform mat4 projection;
uniform mat4 view;

varying highp vec2 vTextureCoord;

void main() {
    vec4 result = projection * view * (vec4(vec2(x, depth / 25.0) + vertex_position.xy * size, depth, 1));
    gl_Position = result;
    vTextureCoord = vertex_position.xy;
}
`

const fs_source = `
varying highp vec2 vTextureCoord;
uniform sampler2D target_texture;

void main() {
    gl_FragColor = texture2D(target_texture, vec2(vTextureCoord.x, 1.0 - vTextureCoord.y));
    gl_FragColor.rgb *= gl_FragColor.a;
}
`;

const models = [
    'human'
    ,'rat'
    ,'graci'
    ,'elo'
    ,'test'
    ,'bigrat'
    ,'magerat'
    ,'berserkrat'
    ,'human_strong'
    ,'ball'
]

function loadTexture(gl: WebGLRenderingContext, url: string): WebGLTexture {
    const texture = gl.createTexture();

    if (texture == null) {
        alert("not able to create textures")
        throw new Error("not able to create textures");
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
        );

        // WebGL1 has different requirements for power of 2 images
        // vs. non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value: number) {
    return (value & (value - 1)) === 0;
}


function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string) {
    const shader = gl.createShader(type);

    if (shader == null) {
        alert(`Unable to create shader`);
        return null
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
    gl.deleteShader(shader);
    return null;
    }

    return shader;
}

function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();

    if (shaderProgram == null) {
        alert(`Unable to create shader program`);
        return null
    }

    if (vertexShader == null) {
        alert(`Unable to create vertex shader`);
        return null
    }

    if (fragmentShader == null) {
        alert(`Unable to create vertex shader`);
        return null
    }

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
            shaderProgram,
            )}`,
        );
        return null;
    }

    return shaderProgram;
}

export interface RenderingData {
    context: WebGLRenderingContext
    program: WebGLProgram

    texture_location: WebGLUniformLocation
    depth_location: WebGLUniformLocation
    x_location: WebGLUniformLocation
    size_location: WebGLUniformLocation
    projection_location: WebGLUniformLocation
    view_location: WebGLUniformLocation

    data_location: GLint

    texture_storage: Record<string, WebGLTexture>

    vertex_buffer: WebGLBuffer
}

export interface TexturedRect {
    x: number,
    w: number,
    h: number,
    d: number,
    texture_name: string
}

export function load(gl: WebGLRenderingContext): RenderingData|null {
    let shader_program: WebGLProgram|null = null
    shader_program = initShaderProgram(gl, vs_source, fs_source)
    if (shader_program == null) {
        return null
    }

    let texture_location = gl.getUniformLocation(shader_program, "target_texture")
    let x_location = gl.getUniformLocation(shader_program, "x")
    let size_location = gl.getUniformLocation(shader_program, "size")
    let projection_location = gl.getUniformLocation(shader_program, "projection")
    let view_location = gl.getUniformLocation(shader_program, "view")
    let depth_location = gl.getUniformLocation(shader_program, "depth")

    let attribute_location = gl.getAttribLocation(shader_program, "vertex_position")

    let texture_storage: Record<string, WebGLTexture> = {}

    for (let model of models) {

        for (let dead_body_image of models_description[model].corpse_images) {
            texture_storage[model + "_dead_" + dead_body_image] = loadTexture(gl, `../static/img/character_image/${model}/${dead_body_image}`)
        }

        if (model != 'human') {
            texture_storage[model + "_body_0"] = (loadTexture(gl, `../static/img/character_image/${model}/pose.PNG`))
        } else {
            texture_storage[model + "_body_0"] = (loadTexture(gl, `../static/img/character_image/${model}/left_arm.PNG`))
            texture_storage[model + "_body_1"] = (loadTexture(gl, `../static/img/character_image/${model}/body.PNG`))
            texture_storage[model + "_body_2"] = (loadTexture(gl, `../static/img/character_image/${model}/right_arm.PNG`))
        }


        for (const layer of display_layers){
            // texture_storage_equip[`${model}_${layer}_empty`] = loadTexture()

            if ((layer != 'on_top') && (model != 'human')) {continue}

            for (const weapon of Object.values(WeaponConfiguration.WEAPON_WEAPON)) {

                let weapon_name = WeaponConfiguration.WEAPON_WEAPON_STRING[weapon]
                let src = ""
                if (model == 'human') {
                    src = `../static/img/character_image/${model}/weapon/${weapon_name}_${layer}.PNG`
                } else {
                    src = `../static/img/character_image/${model}/${weapon_name}.PNG`
                }

                texture_storage[`${model}_${layer}_${weapon_name}`] = loadTexture(gl, src)
            }

            for (const armour of Object.values(ArmourConfiguration.ARMOUR_ARMOUR)) {

                let name = ArmourConfiguration.ARMOUR_ARMOUR_STRING[armour]
                let slot = ArmourConfiguration.ARMOUR_SLOT_STRING[armour]
                let src = ""
                if (model == 'human') {
                    src = `../static/img/character_image/${model}/${slot}/${name}_${layer}.PNG`
                } else {
                    src = `../static/img/character_image/${model}/${name}.PNG`
                }

                console.log("load")
                console.log("src")
                console.log(`${model}_${layer}_${name}`)
                texture_storage[`${model}_${layer}_${name}`] = loadTexture(gl, src)
            }
        }
    }

    let buffer = gl.createBuffer()

    if (buffer == null) {
        return null
    }

    const numComponents = 2; // x, y
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0; // use num of components and type
    const offset = 0; // use num of components and type
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(
        attribute_location,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(attribute_location);

    return {
        context: gl,
        program: shader_program,

        texture_location: texture_location!,
        depth_location: depth_location!,
        x_location: x_location!,
        projection_location: projection_location!,
        view_location: view_location!,
        size_location: size_location!,

        data_location: attribute_location,

        texture_storage: texture_storage,

        vertex_buffer: buffer!
    }
}

const positions = [
    0.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
];

export function update_rects(r: RenderingData) {
    r.context.bindBuffer(r.context.ARRAY_BUFFER, r.vertex_buffer)
    r.context.bufferData(r.context.ARRAY_BUFFER, new Float32Array(positions), r.context.STATIC_DRAW);
}

export function render(r: RenderingData, objects: TexturedRect[], perspective: number[], view: number[]) {
    r.context.clearColor(0.0, 0.0, 0.0, 0.0);
    r.context.clearDepth(1.0);
    r.context.disable(r.context.DEPTH_TEST);
    r.context.depthFunc(r.context.LEQUAL);
    r.context.clear(r.context.COLOR_BUFFER_BIT | r.context.DEPTH_BUFFER_BIT);

    r.context.enable(r.context.BLEND);
    r.context.blendFunc(r.context.ONE, r.context.ONE_MINUS_SRC_ALPHA);

    r.context.useProgram(r.program);

    // r.context.activeTexture(r.context.TEXTURE0);
    // r.context.uniform1i(r.texture_location, 0)

    for (let object of objects) {
        console.log(object.texture_name)

        if (r.texture_storage[object.texture_name] == undefined) {
            console.log("not-found")
            continue
        }

        console.log(r.texture_storage[object.texture_name])

        r.context.activeTexture(r.context.TEXTURE0);
        r.context.uniform1i(r.texture_location, 0)
        r.context.bindTexture(r.context.TEXTURE_2D, r.texture_storage[object.texture_name])

        r.context.uniform1f(r.x_location, object.x)
        r.context.uniform2f(r.size_location, object.w, object.h)
        r.context.uniformMatrix4fv(r.projection_location, false, perspective)
        r.context.uniformMatrix4fv(r.view_location, false, view)
        r.context.uniform1f(r.depth_location, object.d)

        r.context.drawArrays(r.context.TRIANGLE_STRIP, 0, 4);
    }
}