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

//function drawTriangle(gl, shaderProgram, x1, y1, x2, y2, x3, y3, color=[1,1,0,1]){
//    const vertices = [x1, y1, x2, y2, x3, y3]; 
//	drawVertices(gl, shaderProgram, vertices, color, gl.TRIANGLES);
//}

function drawLineStrip(gl, shaderProgram, vertices, color=[0,0,0,1]){
	drawVertices(gl, shaderProgram, vertices, color, gl.LINE_STRIP);
}

function drawLineLoop(gl, shaderProgram, vertices, color=[0,0,0,1]){
	drawVertices(gl, shaderProgram, vertices, color, gl.LINE_LOOP);
}

function drawLines(gl, shaderProgram, vertices, color=[0,0,0,1]){
	drawVertices(gl, shaderProgram, vertices, color, gl.LINES);
}

function drawLine(gl, shaderProgram, vertices, color=[0,0,0,1]){
	drawVertices(gl, shaderProgram, vertices, color, gl.LINES);
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

//
// And now for the 3d shapes:
//

function drawTriangle(gl, shaderProgram, x1, y1, z1, x2, y2, z2, x3, y3, z3, r, g, b){
	let vertices = [x1, y1, z1, r,g,b, x2, y2, z2, r,g,b, x3,y3,z3, r,g,b];
	drawVertices3d(gl, shaderProgram, vertices, gl.TRIANGLES);
}

function drawQuad(gl, shaderProgram, x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, r, g, b){
	drawTriangle(gl, shaderProgram, x1, y1, z1, x2, y2, z2, x3, y3, z3, r, g, b);
	drawTriangle(gl, shaderProgram, x1, y1, z1, x3, y3, z3, x4, y4, z4, r, g, b);
}
function drawVertices3d(gl, shaderProgram, vertices, style){
    const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 * Float32Array.BYTES_PER_ELEMENT// Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	const colorAttribLocation = gl.getAttribLocation(shaderProgram, 'vertColor');
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT// Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(colorAttribLocation);

    gl.drawArrays(style, 0, vertices.length/6);
}
function storeQuad(vertices, x1, y1, z1, u1,v1, i1, x2, y2, z2, u2,v2,i2, x3, y3, z3, u3,v3,i3, x4, y4, z4, u4,v4, i4) {
	vertices.push(x1, y1, z1, u1,v1,i1, x2, y2, z2, u2,v2,i2, x3, y3, z3, u3,v3,i3);
	vertices.push(x1, y1, z1, u1,v1,i1, x3, y3, z3, u3,v3,i3, x4, y4, z4, u4,v4,i4);
}


function drawUVVertices(gl, shaderProgram, vertices, style) {

	const vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	const uvAttribLocation = gl.getAttribLocation(shaderProgram, 'vertUV');
	gl.vertexAttribPointer(
		uvAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(uvAttribLocation);

	const indexAttribLocation = gl.getAttribLocation(shaderProgram, 'vertIndex');
	gl.vertexAttribPointer(
		indexAttribLocation, // Attribute location
		1, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		5 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(indexAttribLocation);

	gl.drawArrays(style, 0, vertices.length / (3 + 2 + 1));
}

export {storeQuad, drawUVVertices, drawCircle, drawRectangle, drawTriangle, drawLineStrip, drawLineLoop, drawLine, drawLines, drawQuad, drawVertices3d};