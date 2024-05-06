
precision mediump float;
varying vec3 fragColor;
varying vec3 fragNormal;
varying vec4 fragPosition;

uniform vec3 uEyePosition;
uniform vec3 uLightDirection;

void main() {
  vec3 materialColor = fragColor;
  vec3 finalColor = vec3(0, 0, 0);

  float ambient = 0.1;
  finalColor += materialColor * ambient;

  vec3 normalizedNormalVector = normalize(fragNormal);
  vec3 lightDirection = normalize(uLightDirection);
  vec3 toLight = lightDirection * -1.0;
  float d = dot(normalizedNormalVector, toLight) * (1.0 - ambient);
  if(d > 0.0) {
    finalColor += materialColor * d;

    vec3 toEye = uEyePosition - fragPosition.xyz;
    toEye = normalize(toEye);

    vec3 lightDirectionReflected = reflect(lightDirection, normalizedNormalVector);
    float d2 = dot(toEye, lightDirectionReflected);
    if(d2 > 0.0) {
      float shininess = 50.0;
      d2 = pow(d2, shininess);
      vec3 specularColor = vec3(.5, .5, .5);
      finalColor += specularColor * d2;
    }
  }

  if(finalColor[0] > 1.0)
    finalColor[0] = 1.0;
  if(finalColor[1] > 1.0)
    finalColor[1] = 1.0;
  if(finalColor[2] > 1.0)
    finalColor[2] = 1.0;

  gl_FragColor = vec4(finalColor, 1.0);
}
