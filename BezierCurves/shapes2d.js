// Point2 class to represent a 2D point
class Point2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

}

function hexToRgba(hex) {
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return [r / 255, g / 255, b / 255, a]; // Normalize to 0..1
}



// Bezier class to represent and draw a Bezier curve
class Bezier {
    constructor(p0, p1, p2, p3, color) {
        this.controlPoints = [p0, p1, p2, p3];
        this.color = this.getRandomColor();
    }
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    evaluate(t) {
        const p0 = this.controlPoints[0];
        const p1 = this.controlPoints[1];
        const p2 = this.controlPoints[2];
        const p3 = this.controlPoints[3];
        
        const x = Math.pow(1 - t, 3) * p0.x +
                  3 * Math.pow(1 - t, 2) * t * p1.x +
                  3 * (1 - t) * Math.pow(t, 2) * p2.x +
                  Math.pow(t, 3) * p3.x;
                  
        const y = Math.pow(1 - t, 3) * p0.y +
                  3 * Math.pow(1 - t, 2) * t * p1.y +
                  3 * (1 - t) * Math.pow(t, 2) * p2.y +
                  Math.pow(t, 3) * p3.y;
                  
        return new Point2(x, y);
    }

    drawCurve(gl, shaderProgram) {
        const steps = 20;
        const vertices = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = this.evaluate(t);
            vertices.push(point.x, point.y);
        }
        drawLineStrip(gl, shaderProgram, vertices);
    }

    drawControlPoints(gl, shaderProgram) {
        this.controlPoints.forEach(point => {
            drawCircle(gl, shaderProgram, point.x, point.y, 0.5, hexToRgba(this.color));
        });
    }

	isPicked(x, y) {
		const radius = 1; // You may need to adjust this based on your viewport and how large the control points appear.
		for (let i = 0; i < this.controlPoints.length; i++) {
			const dx = x - this.controlPoints[i].x;
			// Use y directly without inverting it
			const dy = y - this.controlPoints[i].y;
			if (dx * dx + dy * dy < radius * radius) {
				return i;
			}
		}
		return -1;
	}
	

	setPoint(index, x, y) {
		console.log("in the set point function")
		if (index >= 0 && index < this.controlPoints.length) {
			console.log("but did I reach this part?")
		  this.controlPoints[index] = new Point2(x, y);
		}
	  }
}




function drawCircle(gl, shaderProgram, x, y, radius, color=[0,0,1,1]){
    const sides = 64;
    const vertices = CreateCircleVertices(x,y,radius,sides);
	drawVertices(gl, shaderProgram, vertices, color, gl.TRIANGLE_FAN);
}

function CreateCircleVertices(x,y,radius,sides){
	const vertices = [];
	vertices.push(x);
	vertices.push(y);
	for(let i=0; i<sides+1; i++){
		const radians = i/sides *2*Math.PI;
        vertices.push(x+radius*Math.cos(radians));
        vertices.push(y+radius*Math.sin(radians));
	}
	return vertices;
}

function drawRectangle(gl, shaderProgram, x1, y1, x2, y2, color=[0,1,0,1]){
    const vertices = [x1,y1, x2,y1, x1,y2, x2,y2]; // triangle strip order
	drawVertices(gl, shaderProgram, vertices, color, gl.TRIANGLE_STRIP);
}

function drawTriangle(gl, shaderProgram, x1, y1, x2, y2, x3, y3, color=[1,1,0,1]){
    const vertices = [x1, y1, x2, y2, x3, y3]; 
	drawVertices(gl, shaderProgram, vertices, color, gl.TRIANGLES);
}

function drawLineStrip(gl, shaderProgram, vertices, color=[0,0,0,1]){
	drawVertices(gl, shaderProgram, vertices, color, gl.LINE_STRIP);
}

function drawVertices(gl, shaderProgram, vertices, color, style){
    const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
	gl.uniform4fv(colorUniformLocation, color);

    gl.drawArrays(style, 0, vertices.length/2);
}

export {drawCircle, drawRectangle, drawTriangle, drawLineStrip, Point2, Bezier};