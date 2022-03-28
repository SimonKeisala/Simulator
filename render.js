var cameraPos = [0, 0];
var zoom = 1;
var lines = [];
var selectedObject = null;
var brainView   = null;
var fpsView     = null;
var upsView     = null;
var rendering = true;

var objectList = new Object();
var projectionMatrix = null;
var RenderData = null;
var LeaderboardData = null;

function InitGraphics() {
    'use strict';
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.clearDepth(1.0);
    gl.depthFunc(gl.LEQUAL);
    brainView     = document.getElementById("brain");
    fpsView       = document.getElementById("fps");
    upsView       = document.getElementById("ups");
    setInterval(render, 1000 / FramesPerSecond);

    document.getElementById("speedMult").innerHTML = "speed: " + speedup.toString();
    document.getElementById("nrOfOrganisms").innerHTML = "min organisms: " + nrOfOrganisms.toString();

    projectionMatrix = mat4.create();
}

var fpsTime = new Date().getTime();
var avgFps = 0;
var avgUps = 0;

function loadAttribBuffer(buffer, location, components, data = null, type = gl.FLOAT, normalize = gl.FALSE, stride=0, offset=0) {
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

function render() {
    'use strict';
    var time = new Date().getTime();
    avgFps = 0.95 * avgFps + 0.05 * (1000 / ((Math.max(1, time - fpsTime))));
    fpsTime = time;
    fpsView.innerHTML = "Fps: " + Math.round(avgFps).toString();
    upsView.innerHTML = "Ups: " + Math.round(avgUps).toString();
    if (!rendering) return;

    if (worker != null) worker.postMessage(["newFrame"]);
    if (RenderData == null) return;

    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var left = -gl.canvas.clientWidth/2/zoom;
    var right = -left;
    var top = gl.canvas.clientHeight/2/zoom;
    var bottom = -top;
    mat4.ortho(projectionMatrix, left, right, bottom, top, 0, 100)

    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniform2fv(
        programInfo.uniformLocations.cameraPosition,
        cameraPos);

    ext.vertexAttribDivisorANGLE(programInfo.attribLocations.objectVertices, 0);
    ext.vertexAttribDivisorANGLE(programInfo.attribLocations.positions, 1);
    ext.vertexAttribDivisorANGLE(programInfo.attribLocations.scales, 1);
    ext.vertexAttribDivisorANGLE(programInfo.attribLocations.colors, 1);
    ext.vertexAttribDivisorANGLE(programInfo.attribLocations.rotations, 1);

    for (var key in RenderData) {
        if (!(key in graphics)) continue;
        var object = graphics[key];
        var data = RenderData[key];
        loadAttribBuffer(object.buffer, programInfo.attribLocations.objectVertices, object.numComponents, null, object.type, object.normalize, object.stride, object.offset);

        loadAttribBuffer(positionBuffer, programInfo.attribLocations.positions, 2, data.positions);
        loadAttribBuffer(scaleBuffer,    programInfo.attribLocations.scales,    1, data.scales);
        loadAttribBuffer(colorBuffer,    programInfo.attribLocations.colors,    3, data.colors);
        loadAttribBuffer(rotationBuffer, programInfo.attribLocations.rotations, 1, data.rotations);


        ext.drawArraysInstancedANGLE(gl.TRIANGLES,
                                     object.offset,
                                     object.vertexCount,
                                     data.positions.length/2);
    }

    gl.disable(gl.DEPTH_TEST);

    if (lines.length > 0) {
        gl.useProgram(lineProgramInfo.program);
        loadAttribBuffer(lineBuff, lineProgramInfo.attribLocations.linePoints, 2, lines);
        gl.uniformMatrix4fv(
            lineProgramInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );
        gl.uniformMatrix4fv(
            lineProgramInfo.uniformLocations.modelViewMatrix,
            false,
            [1,0,0,0,
             0,1,0,0,
             0,0,1,0,
             -cameraPos[0],-cameraPos[1],-100,1]
        );

        gl.uniform3fv(
            lineProgramInfo.uniformLocations.color,
            [1,0,1]);

        gl.drawArrays(gl.LINES, 0, lines.length/2);
    }

    if (selectedObject != null && selectedObject instanceof Organism) {
        document.getElementById("brain").classList = "visible";
        renderSelection();
    }
    else {
        document.getElementById("brain").classList = "hidden";
    }
}

function updateBoard(instances) {
    LeaderboardData = instances;
    var innerHtml = ""
    for (var i = 0; i < instances.length; ++i) {
        var data = instances[i];
        innerHtml += "<p onclick=\"moveToOrganism("+i.toString()+");\">"
            +"<span>#"+(i+1).toString()+"<span>"
            +"<field>members:" +data.familyMembers[0].toString()+"</field>"
            +"<field>time:"    +Math.round(data.duration).toString()+"s</field>"
            +"<field>energy:"  +Math.round(data.__energy).toString()+"["
            +                   Math.round(data.energyGained).toString()+"]</field>"
            +"</p>"
    }
    document.getElementById("board").innerHTML = innerHtml;
}

function moveToOrganism(index) {
    selectedObject = LeaderboardData[index];
    var x = selectedObject.__position[0];
    var y = selectedObject.__position[1];
    worker.postMessage(["selectOrganism", selectedObject.__id]);
    cameraPos = [x,y];
}


function renderSelection() {
    var content = ""
    for (var i = 0; i < selectedObject.brain.inputs.length; ++i) {
        content += selectedObject.brain.inputs[i][0].toFixed(2).toString();
        content += " "
    }

    var intermediates = selectedObject.brain.calculateIntermediates();
    for (var i = 0; i < intermediates.length; ++i) {
        content += "<br>"
        for (var j = 0; j < intermediates[i].length; ++j) {
            if (intermediates[i][j][0] >= 0)
                content += "+"
                content += intermediates[i][j][0].toFixed(2).toString();
        }
    }
    brainView.innerHTML = content;
}
