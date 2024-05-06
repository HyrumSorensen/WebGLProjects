import { initShaderProgram } from "./shader.js";
import {
  drawCircle,
  drawRectangle,
  drawTriangle,
  drawLineStrip,
} from "./shapes2d.js";
import { randomDouble } from "./random.js";
import { Maze } from "./maze.js";
import { Rat } from "./rat.js";
import { TOP_VIEW, OBSERVATION_VIEW, RATS_VIEW } from "./constants.js";

main();
async function main() {
  console.log("This is working");

  //
  // start gl
  //
  const canvas = document.getElementById("glcanvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Your browser does not support WebGL");
  }
  gl.clearColor(0.3, 0.4, 0.7, 0.9);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  //
  // Create shaders
  //
	const shaderProgram = initShaderProgram(gl, await (await fetch("uvTriangles.vs")).text(), await (await fetch("uvTriangles.fs")).text());


  //load a texture and move it to the gpu
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, loadTexture(gl, 'gptgrass.jpg'));
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "uTexture0"), 0);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, loadTexture(gl, 'wall-4-granite-TEX.jpg'));
	gl.uniform1i(gl.getUniformLocation(shaderProgram, "uTexture1"), 1);

	gl.activeTexture(gl.TEXTURE3);// Do we need this?


  let rising = false;
  let lowering = false;
  //
  // Create content to display
  //
  const WIDTH = 6;
  const HEIGHT = 5;
  const m = new Maze(WIDTH, HEIGHT);

  const r = new Rat(0.5, 0.5, 90, m);

  let currentView = OBSERVATION_VIEW;

  //
  // load a projection matrix onto the shader
  //
  //squareWorld();
  //window.addEventListener('resize', squareWorld)

  function squareWorld() {}

  //
  // Setup keyboard events:
  //
  let spinLeft = false;
  let spinRight = false;
  let scurryForward = false;
  let scurryBackward = false;
  let strafeLeft = false;
  let strafeRight = false;

  window.addEventListener("keydown", keyDown);
  function keyDown(event) {
    if (event.code == "KeyW") {
      scurryForward = true;
    }
    if (event.code == "KeyS") {
      scurryBackward = true;
    }
    if (event.code == "KeyQ") {
      spinLeft = true;
    }
    if (event.code == "KeyE") {
      spinRight = true;
    }
    if (event.code == "KeyA") {
      strafeLeft = true;
    }
    if (event.code == "KeyD") {
      strafeRight = true;
    }
    if (event.code == "KeyO") {
      currentView = OBSERVATION_VIEW;
    }
    if (event.code == "KeyT") {
      currentView = TOP_VIEW;
    }
    if (event.code == "KeyR") {
      currentView = RATS_VIEW;
    }
    if (event.code == "KeyG") {
      r.initiateRise();
  }
  if (event.code == "KeyB") {
      r.initiateLower()
  }
  }
  window.addEventListener("keyup", keyUp);
  function keyUp(event) {
    if (event.code == "KeyW") {
      scurryForward = false;
    }
    if (event.code == "KeyS") {
      scurryBackward = false;
    }
    if (event.code == "KeyQ") {
      spinLeft = false;
    }
    if (event.code == "KeyE") {
      spinRight = false;
    }
    if (event.code == "KeyA") {
      strafeLeft = false;
    }
    if (event.code == "KeyD") {
      strafeRight = false;
    }

  }

  //
  // load a modelview matrix onto the shader
  //
  const modelViewMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uModelViewMatrix"
  );
  const identityMatrix = mat4.create();
  gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, identityMatrix);

  //
  // Register Listeners
  //

  //
  // Main render loop
  //
  let previousTime = 0;
  function redraw(currentTime) {
    currentTime *= 0.001; // milliseconds to seconds
    let DT = currentTime - previousTime;
    if (DT > 0.5) DT = 0.5;
    //console.log(DT);
    previousTime = currentTime;
    r.updateZ(DT);

    // Update the rat's parameters:
    if (spinLeft) {
      r.spinLeft(DT);
    }
    if (spinRight) {
      r.spinRight(DT);
    }
    if (scurryForward) {
      r.scurryForward(DT);
    }
    if (scurryBackward) {
      r.scurryBackward(DT);
    }
    if (strafeLeft) {
      r.strafeLeft(DT);
    }
    if (strafeRight) {
      r.strafeRight(DT);
    }

    // Choose the correct projection matrix
    if (currentView == OBSERVATION_VIEW) {
      setObservationView(gl, shaderProgram, WIDTH, HEIGHT, canvas);
    } else if (currentView == RATS_VIEW) {
      setRatsView(gl, shaderProgram, WIDTH, HEIGHT, canvas, r);
    } else if (currentView == TOP_VIEW) {
      setTopView(gl, shaderProgram, WIDTH, HEIGHT, canvas);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, identityMatrix);
    //m.draw(gl, shaderProgram);

	if (currentView == TOP_VIEW) {
		m.draw(gl, shaderProgram);
	} else {
		m.drawOptimized(gl, shaderProgram)
	}


    //m.drawPath(gl, shaderProgram)
    // m.drawPathCurved(gl, shaderProgram);
    r.draw(gl, shaderProgram, DT, currentTime);

    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);
}


function setObservationView(gl, shaderProgram, WIDTH, HEIGHT, canvas) {
  const projectionMatrix = mat4.create();
  const fov = (90 * Math.PI) / 180;
  const canvasAspect = canvas.clientWidth / canvas.clientHeight;
  const near = 0.2;
  const far = WIDTH + HEIGHT;
  mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

  const lookAtMatrix = mat4.create();
  const eye = [WIDTH / 2 + 0.1, -HEIGHT / 10, WIDTH / 2];
  const at = [WIDTH / 2, HEIGHT / 2, 0];
  const up = [0, 0, 1];
  mat4.lookAt(lookAtMatrix, eye, at, up);
  mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);
  const projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix"
  );
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}


function setRatsView(gl, shaderProgram, WIDTH, HEIGHT, canvas, rat) {
  const projectionMatrix = mat4.create();
  const fov = (90 * Math.PI) / 180;
  const canvasAspect = canvas.clientWidth / canvas.clientHeight;
  const near = 0.1;
  const far = WIDTH + HEIGHT;
  mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

  const lookAtMatrix = mat4.create();
  // Adjust 'eye' to account for rat's z position
  const eye = [rat.x, rat.y, rat.z + 0.5]; // Here we add 0.5 to lift the camera slightly above the rat's current z position
  const degrees = rat.degrees;
  const rad = (degrees * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  // The 'at' position remains at the rat's head direction but adjusted for z, slightly above the rat
  const at = [rat.x + dx, rat.y + dy, rat.z + 0.55];
  const up = [0, 0, 1];
  mat4.lookAt(lookAtMatrix, eye, at, up);

  mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

  const projectionMatrixUniformLocation = gl.getUniformLocation(
      shaderProgram,
      "uProjectionMatrix"
  );
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}


function setTopView(gl, shaderProgram, WIDTH, HEIGHT, canvas) {
const margin = 0.5;
let xlow = -margin;
let xhigh = WIDTH + margin;
let ylow = -margin;
let yhigh = HEIGHT + margin;

const projectionMatrixUniformLocation = gl.getUniformLocation(
	shaderProgram,
	"uProjectionMatrix"
);
const projectionMatrix = mat4.create();

const aspect = canvas.clientWidth / canvas.clientHeight;
const width = xhigh - xlow;
const height = yhigh - ylow;
if (aspect >= width / height) {
	const newWidth = aspect * height;
	const xmid = (xlow + xhigh) / 2;
	const xlowNew = xmid - newWidth / 2;
	const xhighNew = xmid + newWidth / 2;
	mat4.ortho(projectionMatrix, xlowNew, xhighNew, ylow, yhigh, -1, 1);
} else {
	const newHeight = width / aspect;
	const ymid = (ylow + yhigh) / 2;
	const ylowNew = ymid - newHeight / 2;
	const yhighNew = ymid + newHeight / 2;
	mat4.ortho(projectionMatrix, xlow, xhigh, ylowNew, yhighNew, -1, 1);
}
gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}

function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Fill the texture with a 1x1 blue pixel while waiting for the image to load
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

	const image = new Image();
	image.onload = function () {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
	};
	image.src = url;

	return texture;
}