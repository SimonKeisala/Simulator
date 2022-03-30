import OBJFile from "obj-file-parser";
var gl = null;
var graphics = {};

function createBufferWithVertices(vertices) {
    // Create a new gl-buffer
    var buffer = gl.createBuffer();
    let float_data = new Float32Array(vertices);
    // Bind to it and fill with vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        float_data,
        gl.STATIC_DRAW);

    return buffer;
}

class GraphicalObject {
    constructor(vertices, normals, texture_coords, numComponents = 3) {
        this.vertices = createBufferWithVertices(vertices);
        if (normals != null)
            this.normals = createBufferWithVertices(normals);
        else
            this.normals = createBufferWithVertices(vertices);
        this.texture_coords = null
        if (texture_coords != null)
            this.texture_coords = createBufferWithVertices(texture_coords);

        this.numComponents = numComponents;
        this.type = gl.FLOAT;
        this.vertexCount = Math.floor(vertices.length / this.numComponents);
    }
}

function InitGraphicalLoader(_gl) {
    gl = _gl;
}
function add_vertice(vertices, vertice, scale = 1) {
    vertices.push(vertice.x * scale)
    vertices.push(vertice.y * scale)
    vertices.push(vertice.z * scale)
}

function loadObjFile(obj, scale = 1) {
    let parser = new OBJFile(obj);
    let value = parser.parse();
    let vertices = []
    let normals = []
    for (let face of value.models[0].faces) {
        for (let i = 2; i < face.vertices.length; ++i) {
            add_vertice(vertices, value.models[0].vertices[face.vertices[0].vertexIndex - 1], scale)
            add_vertice(vertices, value.models[0].vertices[face.vertices[i].vertexIndex - 1], scale)
            add_vertice(vertices, value.models[0].vertices[face.vertices[i - 1].vertexIndex - 1], scale)
            add_vertice(normals, value.models[0].vertexNormals[face.vertices[0].vertexNormalIndex - 1], scale)
            add_vertice(normals, value.models[0].vertexNormals[face.vertices[i].vertexNormalIndex - 1], scale)
            add_vertice(normals, value.models[0].vertexNormals[face.vertices[i - 1].vertexNormalIndex - 1], scale)
        }
    }
    let go = new GraphicalObject(vertices, normals, null, 3)
    return go
}


function LoadObjFile(obj, texture, name, scale = 1) {
    fetch(obj)
        .then(e => e.text())
        .then(t => graphics[name] = loadObjFile(t, scale))
}


function LoadGraphics() {
    var resolution = 5;
    var raw = [];
    for (let i = 1; i < resolution - 1; ++i) {
        raw.push(0.0);
        raw.push(1.0);
        raw.push(1.0);
        raw.push(Math.sin(i / resolution * 2 * Math.PI));
        raw.push(Math.cos(i / resolution * 2 * Math.PI));
        raw.push(0.0);
        raw.push(Math.sin((i + 1) / resolution * 2 * Math.PI));
        raw.push(Math.cos((i + 1) / resolution * 2 * Math.PI));
        raw.push(0.0);
    }

    graphics["food"] = new GraphicalObject(raw);
    graphics["square"] = new GraphicalObject(
        [-1, -1, 0, -1, 1, 0, 1, -1, 0,
        -1, 1, 0, 1, 1, 0, 1, -1, 0]);


    raw = []
    resolution = 10;
    for (let i = 0; i < resolution; ++i) {
        var scale = 1.0;
        raw.push(0.0);
        raw.push(1.5);
        raw.push(1.0);
        raw.push(Math.sin(i / resolution * 2 * Math.PI) * scale);
        raw.push(Math.cos(i / resolution * 2 * Math.PI) * scale);
        raw.push(0.0);
        raw.push(Math.sin((i + 1) / resolution * 2 * Math.PI) * scale);
        raw.push(Math.cos((i + 1) / resolution * 2 * Math.PI) * scale);
        raw.push(0.0);
    }
    graphics["organism"] = new GraphicalObject(raw);
    return graphics;
}

export { InitGraphicalLoader, LoadGraphics, LoadObjFile };