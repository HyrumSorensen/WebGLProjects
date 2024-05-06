precision mediump float;
varying vec2 fragUV;
varying float fragIndex;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform vec4 uColor;
void main() {
    if(fragIndex < .5)
    {
        gl_FragColor = texture2D(uTexture0, fragUV);   
        //gl_FragColor = vec4(0, 1, 0, 1);
    }
    else if(fragIndex < 1.5)
    {
        gl_FragColor = texture2D(uTexture1, fragUV);   
        //gl_FragColor = vec4(1, 0, 0, 1);
    }
    else if(fragIndex < 2.5){
        gl_FragColor = uColor;
    }
}
