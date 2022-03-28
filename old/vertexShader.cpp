var vertexShaderSource =
    `
attribute vec4 objectVertice;

attribute vec2 particlePosition;
attribute float particleScale;
attribute float particleRotation;
attribute vec3 particleColor;

uniform mat4 projectionMatrix;
uniform vec2 cameraPosition;
varying vec3 color;
void main()
{
    mat4 viewMatrix = mat4(1.0);
    viewMatrix[0][0] = particleScale*cos(particleRotation);
    viewMatrix[0][1] = particleScale*(-sin(particleRotation));
    viewMatrix[1][0] = particleScale*sin(particleRotation);
    viewMatrix[1][1] = particleScale*cos(particleRotation);


    color = particleColor;
    gl_Position = projectionMatrix
        * (
            viewMatrix * objectVertice
            + vec4(particlePosition-cameraPosition, 0.0, 0.0)
        );
}
`

var lineVertexShaderSource =
    `
attribute vec4 linePoint;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * linePoint;
}
`