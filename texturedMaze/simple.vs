precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec3 fragColor;

void main()
{
    fragColor = vertColor;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vertPosition, 1.0);
}
