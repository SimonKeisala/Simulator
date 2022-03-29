var vertexShaderSource =
    `
attribute vec4 vertices;

attribute vec2 positions;
attribute float scales;
attribute float rotations;
attribute vec3 colors;

uniform mat4 projectionMatrix;
uniform vec2 cameraPosition;
varying vec3 color;
void main()
{
    mat4 viewMatrix = mat4(1.0);
    viewMatrix[0][0] = scales*cos(rotations);
    viewMatrix[0][1] = scales*(-sin(rotations));
    viewMatrix[1][0] = scales*sin(rotations);
    viewMatrix[1][1] = scales*cos(rotations);


    color = colors;
    gl_Position = projectionMatrix
        * (
            viewMatrix * vertices
            + vec4(positions-cameraPosition, 0.0, 0.0)
        );
}
`

var lineVertexShaderSource =
    `
attribute vec4 linePoints;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * linePoints;
}
`

export default { vertexShaderSource, lineVertexShaderSource };