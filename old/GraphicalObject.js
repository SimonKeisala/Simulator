function createBufferWithVertices(vertices) {
    'use strict';
    // Create a new gl-buffer
    var buffer = gl.createBuffer();

    // Bind to it and fill with vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                 new Float32Array(vertices),
                 gl.STATIC_DRAW);

    return buffer;
}

class GraphicalObject {
    constructor(raw, numComponents = 2) {
        this.buffer = createBufferWithVertices(raw);
        this.numComponents = numComponents;
        this.type = gl.FLOAT;
        this.normalize = false;
        this.stride = 0;
        this.offset = 0;
        this.vertexCount = Math.floor(raw.length/this.numComponents);

    }
}


var graphics = {};

var positionBuffer = null;
var scaleBuffer    = null;
var rotationBuffer = null;
var colorBuffer    = null;

function LoadObjects() {
    lineBuff = gl.createBuffer();
    positionBuffer = gl.createBuffer();
    scaleBuffer    = gl.createBuffer();
    rotationBuffer = gl.createBuffer();
    colorBuffer    = gl.createBuffer();
    var resolution = 5;
    var raw = [];
    for (var i = 1; i < resolution-1; ++i) {
        raw.push(0);
        raw.push(1);
        raw.push(Math.sin(i/resolution*2*Math.PI));
        raw.push(Math.cos(i/resolution*2*Math.PI));
        raw.push(Math.sin((i+1)/resolution*2*Math.PI));
        raw.push(Math.cos((i+1)/resolution*2*Math.PI));
    }

    graphics["circle"] = new GraphicalObject(raw);
    graphics["square"] = new GraphicalObject(
        [-1,-1, -1, 1,  1,-1,
         -1, 1,  1, 1,  1,-1]);


    raw = []
    resolution = 10;
    for (var i = 1; i < resolution-1; ++i) {
        var scale = 1.0;
        raw.push(0);
        raw.push(1.5);
        raw.push(Math.sin(i/resolution*2*Math.PI)*scale);
        raw.push(Math.cos(i/resolution*2*Math.PI)*scale);
        raw.push(Math.sin((i+1)/resolution*2*Math.PI)*scale);
        raw.push(Math.cos((i+1)/resolution*2*Math.PI)*scale);
    }
    graphics["organism"] = new GraphicalObject(raw);
}