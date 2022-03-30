function loadShader(gl, shaderType, shaderSource) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function LoadShader(gl, frag, vert) {
    let fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, frag);
    let vertexShader = loadShader(gl, gl.VERTEX_SHADER, vert);

    if (fragmentShader === null) {
        throw "Failed to create fragment shader.";
    }
    if (vertexShader === null) {
        throw "Failed to create vertex shader.";
    }

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
        throw "Failed to link shaders";
    }

    let attributeLocations = {}
    for (let line of vert.split('\n').concat(frag.split('\n'))) {
        let match = line.match("attribute.*?([^ ]*);")
        if (match != null) {
            attributeLocations[match[1]] = gl.getAttribLocation(program, match[1])
        }
    }
    let uniformLocations = {}
    for (let line of vert.split('\n').concat(frag.split('\n'))) {
        let match = line.match("uniform.*?([^ ]*);")
        if (match != null) {
            uniformLocations[match[1]] = gl.getUniformLocation(program, match[1])
        }
    }
    return {
        program: program,
        attributeLocations: attributeLocations,
        uniformLocations: uniformLocations
    }
}

export default LoadShader;