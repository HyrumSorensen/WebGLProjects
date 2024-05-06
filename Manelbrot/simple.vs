precision highp float;

attribute vec2 vertPosition;
uniform mat4 uProjectionMatrix;

varying vec2 fragPosition;

void main()
{
    gl_Position = uProjectionMatrix * vec4(vertPosition, 0.0, 1.0);
    fragPosition = vertPosition;
}
