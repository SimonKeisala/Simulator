var program = null;
var programInfo = null;

var lineProgram = null;
var lineProgramInfo = null;
function loadShader(shaderType, shaderSource) {
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

function initShaderProgram() {
    fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderSource);

    if (fragmentShader === null || vertexShader === null) {
        return false;
    }

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    }
    programInfo = {
        program: program,
        attribLocations: {
            objectVertices: gl.getAttribLocation(program, 'objectVertice'),
            positions:      gl.getAttribLocation(program, 'particlePosition'),
            scales:         gl.getAttribLocation(program, 'particleScale'),
            rotations:      gl.getAttribLocation(program, 'particleRotation'),
            colors:         gl.getAttribLocation(program, 'particleColor'),
        },
        uniformLocations: {
            cameraPosition:  gl.getUniformLocation(program, 'cameraPosition'),
            projectionMatrix: gl.getUniformLocation(program, 'projectionMatrix')
        }
    };


    fragmentShader = loadShader(gl.FRAGMENT_SHADER, lineFragmentShaderSource);
    vertexShader = loadShader(gl.VERTEX_SHADER, lineVertexShaderSource);

    if (fragmentShader === null || vertexShader === null) {
        return false;
    }

    lineProgram = gl.createProgram();
    gl.attachShader(lineProgram, vertexShader);
    gl.attachShader(lineProgram, fragmentShader);
    gl.linkProgram(lineProgram);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    }
    lineProgramInfo = {
        program: lineProgram,
        attribLocations: {
            linePoints: gl.getAttribLocation(lineProgram, 'linePoint'),
        },
        uniformLocations: {
            color: gl.getUniformLocation(lineProgram, 'color'),
            modelViewMatrix: gl.getUniformLocation(lineProgram, 'modelViewMatrix'),
            projectionMatrix: gl.getUniformLocation(lineProgram, 'projectionMatrix')
        }
    };
}
