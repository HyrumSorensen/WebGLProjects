precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;
attribute vec3 vertNormal;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
// Passed on to fragment shader
varying vec3 fragColor;
varying vec3 fragNormal;
varying vec4 fragPosition;

void main() {
    fragColor = vertColor;
    fragNormal = normalize(uNormalMatrix * vertNormal);
    fragPosition = uModelViewMatrix * vec4(vertPosition, 1.0);

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(vertPosition, 1.0);
}
