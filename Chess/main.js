import { initShaderProgram } from "./shader.js";
import { ChessSet } from "./chessSet.js";

main();
async function main() {
	console.log('This is working');

	//
	// start gl
	// 
	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');
	if (!gl) {
		alert('Your browser does not support WebGL');
	}
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.enable(gl.DEPTH_TEST); // Enable depth testing
	gl.depthFunc(gl.LEQUAL); // Near things obscure far things
	gl.enable(gl.CULL_FACE);

	//
	// Setup keyboard events:
	//

	window.addEventListener("keydown", keyDown);
	function keyDown(event) {
	}
	window.addEventListener("keyup", keyUp);
	function keyUp(event) {
	}

	//
	// Create shader
	// 
	const shaderProgram = initShaderProgram(gl, await (await fetch("textureNormalTriangles.vs")).text(), await (await fetch("textureNormalTriangles.fs")).text());

	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "uTexture"), 0);

	//
	// load a modelview matrix and normatMatrixonto the shader
	// 
	const modelViewMatrix = mat4.create();
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uModelViewMatrix"), false, modelViewMatrix);

	const normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, modelViewMatrix);
	gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, "uNormalMatrix"), false, normalMatrix);

	//
	// Other shader variables:
	// 
	function setLightDirection(x, y, z) {
		gl.uniform3fv(
			gl.getUniformLocation(shaderProgram, "uLightDirection"),
			[x, y, z]
		);
	}
	setLightDirection(0, -1,0);

	const eye = [0, 6, 9];
	const at = [0, 1.5, 2.3]
	const up = [0, 1, 0];
	// const eye = [9, 3, 0];  // Positioned to the side of the board, elevated to see over the pieces
	// const at = [0, 1.5, 0];  // Looking towards the center of the board horizontally
	// const up = [0, 1, 0];  // Y-axis remains as the up direction
	setObservationView(gl, shaderProgram, eye, at, up, canvas.clientWidth / canvas.clientHeight)


	//
	// Create content to display
	//

	const c = new ChessSet(gl);
	await c.init(gl);

	window.addEventListener("resize", reportWindowSize);
	function reportWindowSize() {
		const clarity = 1.0; // use 4.0 for better looking textures
		gl.canvas.width = gl.canvas.clientWidth * clarity;
		gl.canvas.height = gl.canvas.clientHeight * clarity;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}
	reportWindowSize();

	//
	// Main render loop
	//
	let previousTime = 0;
	let frameCounter = 0;
	function redraw(currentTime) {
		currentTime *= .001; // milliseconds to seconds
		let DT = currentTime - previousTime;
		if (DT > .5)
			DT = .5;
		frameCounter += 1;
		if (Math.floor(currentTime) != Math.floor(previousTime)) {
			console.log(frameCounter);
			frameCounter = 0;
		}
		previousTime = currentTime;

		//
		// Draw
		//
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		setObservationView(gl, shaderProgram, eye, at, up, canvas.clientWidth / canvas.clientHeight)

		c.draw(gl, shaderProgram, currentTime);

		requestAnimationFrame(redraw);
	}
	requestAnimationFrame(redraw);
};

function setObservationView(gl, shaderProgram, eye, at, up, canvasAspect) {
	const projectionMatrix = mat4.create();
	const fov = 60 * Math.PI / 180;
	const near = 1;
	const far = 100;
	mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

	const lookAtMatrix = mat4.create();
	mat4.lookAt(lookAtMatrix, eye, at, up);
	mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

	gl.uniform3fv(
		gl.getUniformLocation(shaderProgram, "uEyePosition"),
		eye
	);
}

