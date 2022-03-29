import * as glMatrix from "gl-matrix"
import fragment_shader from "./shaders/fragmentShader"
import vertex_shader from "./shaders/vertexShader"
import LoadGraphics from "./GraphicalObject"
import InitWebGL from "./InitializeWebGL"
import LoadShader from "./LoadShader"

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

function Init() {
    [gl, ext] = InitWebGL();

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
    graphics = LoadGraphics(gl)
    projectionMatrix = glMatrix.mat4.create();
}

function loadAttribBuffer(buffer, location, components, data = null, type = gl.FLOAT, normalize = gl.FALSE, stride = 0, offset = 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    if (data != null)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    gl.vertexAttribPointer(
        location,
        components,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(location);

}

function Render(object_data, lines, zoom = 1, camera_position = [0, 0]) {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var left = -gl.canvas.clientWidth / 2 / zoom;
    var right = -left;
    var top = gl.canvas.clientHeight / 2 / zoom;
    var bottom = -top;

    glMatrix.mat4.ortho(projectionMatrix, left, right, bottom, top, 0, 100)

    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniform2fv(
        programInfo.uniformLocations.cameraPosition,
        camera_position);

    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.vertices, 0);
    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.positions, 1);
    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.scales, 1);
    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.colors, 1);
    ext.vertexAttribDivisorANGLE(programInfo.attributeLocations.rotations, 1);

    if (object_data != null) {
        for (var key in object_data) {
            if (!(key in graphics)) continue;
            var object = graphics[key];
            var data = object_data[key];
            loadAttribBuffer(object.buffer, programInfo.attributeLocations.objectVertices, object.numComponents, null, object.type, object.normalize, object.stride, object.offset);

            loadAttribBuffer(positionBuffer, programInfo.attributeLocations.positions, 2, data.positions);
            loadAttribBuffer(scaleBuffer, programInfo.attributeLocations.scales, 1, data.scales);
            loadAttribBuffer(colorBuffer, programInfo.attributeLocations.colors, 3, data.colors);
            loadAttribBuffer(rotationBuffer, programInfo.attributeLocations.rotations, 1, data.rotations);

            ext.drawArraysInstancedANGLE(gl.TRIANGLES,
                object.offset,
                object.vertexCount,
                data.scales.length);
        }
    }

    gl.disable(gl.DEPTH_TEST);

    if (lines != null && lines.length > 0) {
        gl.useProgram(lineProgramInfo.program);
        loadAttribBuffer(lineBuff, lineProgramInfo.attributeLocations.linePoints, 2, lines);
        gl.uniformMatrix4fv(
            lineProgramInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );
        gl.uniformMatrix4fv(
            lineProgramInfo.uniformLocations.modelViewMatrix,
            false,
            [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                -camera_position[0], -camera_position[1], -100, 1]
        );
        gl.uniform3fv(
            lineProgramInfo.uniformLocations.color,
            [1, 0, 1]);

        gl.drawArrays(gl.LINES, 0, lines.length / 2);
    }
}

export default { Init, Render };