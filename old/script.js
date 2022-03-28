var nrOfFood = 200;
var range = 200;
var speedup = 1;
var nrOfOrganisms = 30;

var FramesPerSecond = 50.0;
var UpdatesPerSecond = 160.0;
var canvas = null;
var gl     = null;
var ext    = null;

function onresize(a, b) {
    "use strict";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0,0,canvas.width, canvas.height);
}
var worker = null;

function glInit() {
    "use strict";

    // fetch openGl context and canvas element
    canvas = document.getElementById("myCanvas");
    if (canvas === null) {
        alert("Unable to fetch canvas!");
        return;
    }
    gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Webgl not supported by this browser!");
        return;
    }

    ext = (
        gl.getExtension('ANGLE_instanced_arrays') ||
        gl.getExtension('MOZ_ANGLE_instanced_arrays') ||
        gl.getExtension('WEBKIT_ANGLE_instanced_arrays')
    );
    // Load the shaders
    initShaderProgram();

    // Setup canvas to fill whole screen, also setup auto-resize of canvas to whole screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0,0,canvas.width, canvas.height);
    window.addEventListener("resize", onresize);

    // Load all the objects to graphics card
    LoadObjects();
    // Initialize simulation logic
    setTimeout(InitGraphics, 100);
    setTimeout(InitLogic, 100);
}

window.onload = glInit;

