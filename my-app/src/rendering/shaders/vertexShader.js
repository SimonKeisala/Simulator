var vertexShaderSource = `
attribute vec3 modelVertex;
attribute vec2 particlePosition;
attribute float particleScale;
attribute float particleRotation;
attribute vec3 particleColor;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec3 color;
void main()
{
    mat3 viewMatrix = mat3(1.0);
    float cosrot = cos(particleRotation);
    float sinrot = sin(particleRotation);
    viewMatrix[0][0] = cosrot;
    viewMatrix[0][1] = -sinrot;
    viewMatrix[1][0] = sinrot;
    viewMatrix[1][1] = cosrot;

    vec3 worldCoords = viewMatrix * modelVertex * particleScale + vec3(particlePosition, 0.0);
    vec3 cameraCoords = worldCoords + modelViewMatrix[3].xyz;

    vec3 viewCoords = mat3(modelViewMatrix) * cameraCoords;

    gl_Position = projectionMatrix * vec4(viewCoords, 1.0);
    color = particleColor;
}
`

var lineVertexShaderSource =
    `
attribute vec3 linePoint;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main()
{
    vec3 cameraCoords = linePoint + modelViewMatrix[3].xyz;

    vec3 viewCoords = mat3(modelViewMatrix) * cameraCoords;
    gl_Position = projectionMatrix * vec4(viewCoords, 1.0);
}
`

export default { vertexShaderSource, lineVertexShaderSource };