import * as glMatrix from "gl-matrix"
import { pi } from "mathjs"
import fragment_shader from "./shaders/fragmentShader"
import vertex_shader from "./shaders/vertexShader"
import { InitGraphicalLoader, LoadGraphics, LoadObjFile } from "./GraphicalObject"
import InitWebGL from "./InitializeWebGL"
import LoadShader from "./LoadShader"
import model from "../models/wolf/Wolf_obj.obj";
import Camera from "../utilities/camera"
//import texture from "./models/wolf/Wolf_obj.mtl";

var projectionMatrix = null;

var lineBuff = null;
var positionBuffer = null;
var scaleBuffer = null;
var rotationBuffer = null;
var colorBuffer = null;

var programInfo = null;
var lineProgramInfo = null;

var gl = null;
var ext = null;
var graphics = null
var initialized = false;

function Init(canvas) {
    if (initialized) return;
    initialized = true;
    [gl, ext] = InitWebGL(canvas);
    // Load the shaders
    programInfo = LoadShader(gl, fragment_shader.fragmentShaderSource, vertex_shader.vertexShaderSource);
    lineProgramInfo = LoadShader(gl, fragment_shader.lineFragmentShaderSource, vertex_shader.lineVertexShaderSource);

    lineBuff = gl.createBuffer();
    positionBuffer = gl.createBuffer();
    scaleBuffer = gl.createBuffer();
    rotationBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.clearDepth(1.0);
    gl.depthFunc(gl.LEQUAL);

    InitGraphicalLoader(gl);
    graphics = LoadGraphics(gl)
    LoadObjFile(model, null, "wolf", 10)
    projectionMatrix = glMatrix.mat4.create();
}

function loadAttribBuffer(buffer, location, components, data = null, type = gl.FLOAT) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    if (data != null)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    gl.vertexAttribPointer(
        location,
        components,
        type,
        gl.FALSE,
        0,
        0
    );
    gl.enableVertexAttribArray(location);
}
let mainCamera = new Camera([0, 1, -400], [0, 0, 0])

function Render(object_data, lines) {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    glMatrix.mat4.perspective(projectionMatrix, 90 * pi / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.001, 1000)
    let modelViewMatrix = mainCamera.mat4();

    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.modelVertex, 0);
    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.particlePosition, 1);
    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.particleScale, 1);
    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.particleColor, 1);
    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.particleRotation, 1);

    if (object_data != null) {
        for (var key in object_data) {
            if (!(key in graphics)) continue;
            var object = graphics[key];
            if (key == "organism" && graphics.wolf) {
                object = graphics.wolf
            }
            var data = object_data[key];
            loadAttribBuffer(object.vertices, programInfo.attributeLocations.modelVertex, object.numComponents);

            loadAttribBuffer(positionBuffer, programInfo.attributeLocations.particlePosition, 2, data.positions);
            loadAttribBuffer(scaleBuffer, programInfo.attributeLocations.particleScale, 1, data.scales);
            loadAttribBuffer(colorBuffer, programInfo.attributeLocations.particleColor, 3, data.colors);
            loadAttribBuffer(rotationBuffer, programInfo.attributeLocations.particleRotation, 1, data.rotations);

            ext.drawArraysInstancedANGLE(gl.TRIANGLES,
                0,
                object.vertexCount,
                data.scales.length);
        }
    }

    gl.disable(gl.DEPTH_TEST);

    if (lines != null && lines.length > 0) {
        gl.useProgram(lineProgramInfo.program);
        loadAttribBuffer(lineBuff, lineProgramInfo.attributeLocations.linePoint, 2, lines);
        gl.uniformMatrix4fv(
            lineProgramInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );
        gl.uniformMatrix4fv(
            lineProgramInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );
        gl.uniform3fv(
            lineProgramInfo.uniformLocations.color,
            [1, 0, 1]);
        gl.drawArrays(gl.LINES, 0, lines.length / 2);
    }
}

export { Init, Render, mainCamera };