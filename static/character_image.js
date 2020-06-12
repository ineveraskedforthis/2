const vsSource = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying highp vec2 vTextureCoord;
void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
}
`;

// Fragment shader program

const fsSource = `
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;


const texture_coord = [
    1.0,  1.0,
    0.0,  1.0,
    0.0,  0.0,
    1.0,  0.0,
]

const base_pos = [
    -1.5, -1.0, +1.0,
    +1.5, -1.0, +1.0,
    +1.5, +1.0, +1.0,
    -1.5, +1.0, +1.0,
]

const eyes_pos = [
    -1.5, -1.0, +1.2,
    +1.5, -1.0, +1.2,
    +1.5, +1.0, +1.2,
    -1.5, +1.0, +1.2,
]

const pupil_left_pos = [
    -1.2, -0.1, +1.1,
    -0.8, -0.1, +1.1,
    -0.8, +0.2, +1.1,
    -1.2, +0.2, +1.1,
]

const pupil_right_pos = [
    -0.2, -0.0, +1.1,
    +0.2, -0.0, +1.1,
    +0.2, +0.3, +1.1,
    -0.2, +0.3, +1.1,
]


const initBuffer = {
    face: (gl) => {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = base_pos
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        const textureCoordinates = texture_coord;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        const indices = [
            0, 1, 2,      0, 2, 3,
        ]
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);
        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        };
    },
    eyes: (gl) => {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = eyes_pos
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        const textureCoordinates = texture_coord;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        const indices = [
            0, 1, 2,      0, 2, 3,
        ]
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        };
    },
    pupil_left: (gl) => {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = pupil_left_pos;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        const textureCoordinates = texture_coord;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        const indices = [
            0, 1, 2,      0, 2, 3,
        ]
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        };
    },

    pupil_right: (gl) => {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = pupil_right_pos;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        const textureCoordinates = texture_coord;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        const indices = [
            0, 1, 2,      0, 2, 3,
        ]
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        };
    },

    upper_lip: (gl) => {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = base_pos
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        const textureCoordinates = texture_coord;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        const indices = [
            0, 1, 2,      0, 2, 3,
        ]
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);
        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        };
    },

    bottom_lip: (gl) => {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = base_pos
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        const textureCoordinates = texture_coord;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        const indices = [
            0, 1, 2,      0, 2, 3,
        ]
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);
        return {
            position: positionBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        };
    },

}



function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Because images have to be download over the internet
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
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;
    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}
  

function bind_position(gl, position, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
}

function bind_texture_coord(gl, textureCoord, programInfo) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
}

class CharacterImage {
    constructor(canvas) {
        this.canvas = canvas;

        this.stats = {rage: 0, blood: 0, power: 0};
        this.w = 200;
        this.h = 136;
        this.pupils_phi = -Math.PI / 2
        this.pupils_rad = 2

        this.gl = this.canvas.getContext("webgl");
        this.prev = 0

        
      
        // Only continue if WebGL is available and working
        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        this.textures = {
            face: loadTexture(this.gl, '/static/img/apu_head_base.png'), 
            eyes: loadTexture(this.gl, '/static/img/apu_base_eyes.png'), 
            pupil_left: loadTexture(this.gl, '/static/img/apu_pupil_left.png'),
            pupil_right: loadTexture(this.gl, '/static/img/apu_pupil_right.png'),
            upper_lip: loadTexture(this.gl, '/static/img/apu_upper_lip.png'),
            bottom_lip_closed: loadTexture(this.gl, '/static/img/apu_bottom_lip_0.png'),
            bottom_lip_opened: loadTexture(this.gl, '/static/img/apu_bottom_lip_1.png'),
        }

        this.shaderProgram = initShaderProgram(this.gl, vsSource, fsSource);
        this.programInfo = {
            program: this.shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                textureCoord: this.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
                uSampler: this.gl.getUniformLocation(this.shaderProgram, 'uSampler'),
            },
        };

        this.objects = []
        this.objects[0] = {
            tag: 'eyes',
            animate: false,
            buffer: initBuffer.eyes(this.gl),
            texture: this.textures.eyes
        }
        this.objects[1] = {
            tag: 'pupil_left',
            animate: false,
            buffer: initBuffer.pupil_left(this.gl),
            texture: this.textures.eyes
        }
        this.objects[2] = {
            tag: 'pupil_right',
            animate: false,
            buffer: initBuffer.pupil_right(this.gl),
            texture: this.textures.pupil_left
        }
        this.objects[3] = {
            tag: 'pupil_left',
            animate: true,
            buffer: initBuffer.pupil_left(this.gl),
            texture: this.textures.pupil_right
        }
        this.objects[4] = {
            tag: 'face',
            animate: false,
            buffer: initBuffer.face(this.gl),
            texture: this.textures.face
        }
        this.objects[5] = {
            tag: 'upper_lip',
            animate: false,
            buffer: initBuffer.upper_lip(this.gl),
            texture: this.textures.upper_lip
        }
        this.objects[6] = {
            tag: 'bottom_lip',
            animate: false,
            buffer: initBuffer.bottom_lip(this.gl),
            texture: this.textures.bottom_lip_closed
        }


        this.cubeRotation = 0.0;
    }

    update(rage, blood, power) {
        this.stats.rage = rage;
        this.stats.blood = blood;
        this.stats.power = power;
        if (rage > 60) {
            this.objects[6].texture = this.textures.bottom_lip_opened
        }
    }

    draw(time) {
        time *= 0.001;  // convert to seconds
        const deltaTime = time - this.prev;
        this.prev = time;
        this.draw_scene(this.gl, this.programInfo, this.objects, deltaTime);
    }

    draw_scene(gl, programInfo, objects, deltaTime) {
        gl.clearColor(this.stats.rage / 200 + 0.1, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
      
      
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();
      
        mat4.perspective(projectionMatrix,
                         fieldOfView,
                         aspect,
                         zNear,
                         zFar);
      
        

        // mat4.rotate(modelViewMatrix, 
        //             modelViewMatrix,
        //             this.cubeRotation * .7,
        //             [0, 1, 0]);

        for (let i = 0; i < objects.length; i++)
        {
            const modelViewMatrix = mat4.create();
      
            mat4.translate(modelViewMatrix, 
                        modelViewMatrix, 
                        [-0.0, 0.0, -6.0]);
            mat4.rotate(modelViewMatrix, 
                        modelViewMatrix, 
                        // this.cubeRotation, 
                        3.14159,
                        [0, 1, 0]); 
            
            if (objects[i].tag == 'pupil_left' || objects[i].tag == 'pupil_right') {
                let r = this.stats.rage * this.pupils_rad / 1000;
                let phi = this.stats.rage / 10 * this.cubeRotation % (2 * Math.PI)
                mat4.translate(modelViewMatrix, 
                    modelViewMatrix, 
                    [r * Math.cos(phi), r * Math.sin(phi), 0]);
            }
        
            bind_position(gl, objects[i].buffer.position, programInfo)
            bind_texture_coord(gl, objects[i].buffer.textureCoord, programInfo)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, objects[i].buffer.indices);

            gl.useProgram(programInfo.program);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.modelViewMatrix,
                false,
                modelViewMatrix);
            gl.activeTexture(gl.TEXTURE0);

            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, objects[i].texture);
        
            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

            {
                const vertexCount = 6;
                const type = gl.UNSIGNED_SHORT;
                const offset = 0;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
        }
      
        // Update the rotation for the next draw
      
        this.cubeRotation += deltaTime;
      }
}


function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Create the shader program
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
  
    return shaderProgram;
  }
  
  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
  function loadShader(gl, type, source) {
      const shader = gl.createShader(type);
    
      // Send the source to the shader object
    
      gl.shaderSource(shader, source);
    
      // Compile the shader program
    
      gl.compileShader(shader);
    
      // See if it compiled successfully
    
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
      }
    
      return shader;
  }