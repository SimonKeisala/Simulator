var canvas = null;
var gl = null;
function onresize(a, b) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function InitWebGL(_canvas) {
    canvas = _canvas
    if (canvas === null) {
        alert("No canvas provided!");
        throw "Failed to fetch canvas!";
    }
    gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Webgl not supported by this browser!");
        throw "Failed to initialize WebGL";
    }

    let ext = (
        gl.getExtension('ANGLE_instanced_arrays') ||
        gl.getExtension('MOZ_ANGLE_instanced_arrays') ||
        gl.getExtension('WEBKIT_ANGLE_instanced_arrays')
    );

    window.addEventListener("resize", onresize);
    onresize();

    return [gl, ext];
}

export default InitWebGL;