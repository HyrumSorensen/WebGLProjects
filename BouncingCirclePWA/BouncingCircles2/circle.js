const REST_THRESHOLD = 0.01

class Circle {
    constructor(xlow, xhigh, ylow, yhigh) {
        this.xlow = xlow;
        this.xhigh = xhigh;
        this.ylow = ylow;
        this.yhigh = yhigh;
        this.color = [Math.random(), Math.random(), Math.random(), 1];
        this.size = 1.0 + Math.random();
        const minx = xlow + this.size;
        const maxx = xhigh - this.size;
        this.x = minx + Math.random() * (maxx - minx);
        const miny = ylow + this.size;
        const maxy = yhigh - this.size;
        this.y = miny + Math.random() * (maxy - miny);
        this.dx = Math.random() * 2 + 2;
        if (Math.random() > .5)
            this.dx = -this.dx;
        this.dy = Math.random() * 2 + 2;
        if (Math.random() > .5)
            this.dy = -this.dy;
    }

    update(DT, gravityX, gravityY, airFrictionConstant) {
        if (Math.abs(this.dx) < REST_THRESHOLD) this.dx = 0;
        if (Math.abs(this.dy) < REST_THRESHOLD) this.dy = 0;
    
        // Apply gravity
        this.dx += gravityX * DT; // Gravity affects the x velocity
        this.dy -= gravityY * DT; // Gravity affects the y velocity, subtracting because traditionally y-axis is positive downwards in canvas
    
        // Apply air friction
        this.dx -= airFrictionConstant * this.dx * DT;
        this.dy -= airFrictionConstant * this.dy * DT;
    
        // Collision with walls
        if (this.x + this.dx * DT + this.size > this.xhigh) {
            this.dx = -Math.abs(this.dx);
        }
        if (this.x + this.dx * DT - this.size < this.xlow) {
            this.dx = Math.abs(this.dx);
        }
        if (this.y + this.dy * DT + this.size > this.yhigh) {
            this.dy = -Math.abs(this.dy);
        }
        if (this.y + this.dy * DT - this.size < this.ylow) {
            this.dy = Math.abs(this.dy);
        }
    
        // Update position
        this.x += this.dx * DT;
        this.y += this.dy * DT;
    }
    
    

    draw(gl, shaderProgram) {
        drawCircle(gl, shaderProgram, this.color, this.x, this.y, this.size);
    }
}

function drawCircle(gl, shaderProgram, color, x, y, size) {
    const circleVertices = [];
    const vertexCount = 100;
    circleVertices.push(x, y);

    for (let i = 0; i <= vertexCount; i++) {
        let angle = i * 2 * Math.PI / vertexCount;
        circleVertices.push(
            x + size * Math.cos(angle),
            y + size * Math.sin(angle)
        );
    }

    const vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
    gl.uniform4fv(colorUniformLocation, color);

    const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    const modelViewMatrix = mat4.create();
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount + 2);
}

export { Circle, drawCircle };
