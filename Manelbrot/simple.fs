precision highp float;
varying vec2 fragPosition;

const int MAX_ITER = 1000;

int MandelbrotTest(float cr, float ci)
{
    int count = 0;
    float zr = 0.0;
    float zi = 0.0;
    float zrsqr = 0.0;
    float zisqr = 0.0;

    for (int i = 0; i < MAX_ITER; i++) {
        zi = 2.0 * zr * zi + ci;
        zr = zrsqr - zisqr + cr;
        zrsqr = zr * zr;
        zisqr = zi * zi;

        if (zrsqr + zisqr > 4.0)
            break;
        count++;
    }

    return count;
}

void main()
{
    int count = MandelbrotTest(fragPosition[0], fragPosition[1]);
    if (count == MAX_ITER) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        float r = 0.5 * sin(0.1 * float(count) + 1.0) + 0.5;
        float g = 0.5 * sin(0.1 * float(count) + 2.0) + 0.5;
        float b = 0.5 * sin(0.1 * float(count) + 4.0) + 0.5;
        gl_FragColor = vec4(r, g, b, 1.0);
    }
}
