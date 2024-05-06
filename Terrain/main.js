import { initShaderProgram } from "./shader.js";
import {
  storeQuad,
  drawColorNormalVertices,
  crossProduct,
} from "./shapes2d.js";

import { Terrain } from "./terrain.js";
import { Rat } from "./rat.js";

import { OBSERVATION_VIEW, RATS_VIEW } from "./constants.js";

main();
async function main() {
  console.log("This is working");

  const canvas = document.getElementById("glcanvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Your browser does not support WebGL");
  }
  gl.clearColor(0.6, 0.55, 0.8, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);


  const shaderProgram = initShaderProgram(
    gl,
    await (await fetch("colorNormalTriangles.vs")).text(),
    await (await fetch("colorNormalTriangles.fs")).text()
  );


  const WIDTH = 100;
  const HEIGHT = 100;
  const DEPTH = 0.1;
  const t = new Terrain(WIDTH, HEIGHT, DEPTH);

  const RAT_OFFSET = 3;

  const rat = new Rat(5, 5, 90, [0.77, 0.64, 0.52, 1], WIDTH, HEIGHT);

  let currentView = OBSERVATION_VIEW;

  const modelViewMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uModelViewMatrix"
  );
  const identityMatrix = mat4.create();
  gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, identityMatrix);

  let spinLeft = false;
  let spinRight = false;
  let scurryForward = false;
  let scurryBackwards = false;
  let strafeLeft = false;
  let strafeRight = false;
  addEventListener("keydown", keyDown);
  function keyDown(event) {
    if (event.code == "KeyQ") {
      spinLeft = true;
    }
    if (event.code == "KeyE") {
      spinRight = true;
    }
    if (event.code == "KeyW") {
      scurryForward = true;
    }
    if (event.code == "KeyS") {
      scurryBackwards = true;
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
    if (event.code == "KeyR") {
      currentView = RATS_VIEW;
    }
    
  }

  document.addEventListener('keydown', (event) => {
    const key = event.key;
    switch (key) {
      case 'a': // Increase ruggedness
        t.ruggedness *= 1.1;
        break;
      case 'b': // Decrease ruggedness
        t.ruggedness /= 1.1;
        break;
      case 'c': // Raise water level
        t.waterLevel += 5;
        break;
      case 'd': // Lower water level
        t.waterLevel -= 5;
        break;
    }
  });

  addEventListener("keyup", keyUp);
  function keyUp(event) {
    if (event.code == "KeyQ") {
      spinLeft = false;
    }
    if (event.code == "KeyE") {
      spinRight = false;
    }
    if (event.code == "KeyW") {
      scurryForward = false;
    }
    if (event.code == "KeyS") {
      scurryBackwards = false;
    }
    if (event.code == "KeyA") {
      strafeLeft = false;
    }
    if (event.code == "KeyD") {
      strafeRight = false;
    }
  }

  function setLightDirection(x, y, z) {
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "uLightDirection"), [
      x,
      y,
      z,
    ]);
  }
  setLightDirection(0, 0, -1);

  function setEye(x, y, z) {
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "uEyePosition"), [
      x,
      y,
      z,
    ]);
  }
  const OBS_EYE = [WIDTH / 2, -HEIGHT / 4, HEIGHT / 2];
  let eye = [OBS_EYE[0], OBS_EYE[1], OBS_EYE[2]];
  setEye(eye[0], eye[1], eye[2]);

  const normalMatrix = mat3.create();
  mat3.normalFromMat4(normalMatrix, identityMatrix);
  gl.uniformMatrix3fv(
    gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
    false,
    normalMatrix
  );

  let previousTime = 0;
  let frameCounter = 0;
  function redraw(currentTime) {
    currentTime *= 0.001;
    let DT = currentTime - previousTime;
    if (DT > 0.5) DT = 0.5;
    frameCounter += 1;
    if (Math.floor(currentTime) != Math.floor(previousTime)) {
      console.log(frameCounter);
      frameCounter = 0;
    }
    previousTime = currentTime;

    if (spinLeft) {
      rat.spinLeft(DT);
    }
    if (spinRight) {
      rat.spinRight(DT);
    }
    if (scurryForward) {
      rat.scurryForward(DT);
    }
    if (scurryBackwards) {
      rat.scurryBackwards(DT);
    }
    if (strafeLeft) {
      rat.strafeLeft(DT);
    }
    if (strafeRight) {
      rat.strafeRight(DT);
    }

    if (currentView == OBSERVATION_VIEW) {
      setEye(OBS_EYE[0], OBS_EYE[1], OBS_EYE[2]);
      setObservationView(
        gl,
        shaderProgram,
        canvas.clientWidth / canvas.clientHeight,
        OBS_EYE,
        HEIGHT,
        WIDTH
      );
    } else {
      eye = [rat.x, rat.y, t.getTerrainAtPoint(rat.x, rat.y) + RAT_OFFSET];
      setEye(eye[0], eye[1], eye[2]);
      let at = rat.getAtPos();
      at.push(t.getTerrainAtPoint(at[0], at[1]) + RAT_OFFSET);
      setRatView(
        gl,
        shaderProgram,
        canvas.clientWidth / canvas.clientHeight,
        eye,
        at
      );
    }


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



    t.draw(gl, shaderProgram);

    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);
}


function polarToCartesian(polar, alpha) {

  const x = Math.sin(polar) * Math.cos(alpha);
  const y = Math.sin(polar) * Math.sin(alpha);
  const z = Math.cos(polar);
  return [x, y, z];
}

function drawSphere(gl, shaderProgram) {
  const vertices = [];
  const strips = 100;
  for (let i = 0; i < strips; i++) {
    const polar1 = (i / strips) * Math.PI;
    const polar2 = ((i + 1) / strips) * Math.PI;
    for (let j = 0; j < strips; j++) {
      const alpha1 = (j / strips) * Math.PI * 2;
      const alpha2 = ((j + 1) / strips) * Math.PI * 2;
      const [x1, y1, z1] = polarToCartesian(polar1, alpha1);
      const [x2, y2, z2] = polarToCartesian(polar2, alpha1);
      const [x3, y3, z3] = polarToCartesian(polar2, alpha2);
      const [x4, y4, z4] = polarToCartesian(polar1, alpha2);
      let r = Math.sin(i * 3712 + j * 34857 + 1) * 0.5 + 0.5;
      let g = Math.sin(i * 9321 + j * 27543 + 2) * 0.5 + 0.5;
      let b = Math.sin(i * 1268 + j * 12771 + 7) * 0.5 + 0.5;
      r = 0.8;
      g = 0.1;
      b = 0.9;

      let [nx, ny, nz] = crossProduct(x1, y1, z1, x2, y2, z2, x3, y3, z3);
      if (j == strips - 1) {
        [nx, ny, nz] = crossProduct(x1, y1, z1, x2, y2, z2, x4, y4, z4);
      }
      storeQuad(
        vertices,
        x1,
        y1,
        z1,
        nx,
        ny,
        nz,
        x2,
        y2,
        z2,
        nx,
        ny,
        nz,
        x3,
        y3,
        z3,
        nx,
        ny,
        nz,
        x4,
        y4,
        z4,
        nx,
        ny,
        nz,
        r,
        g,
        b
      );

    }
  }
  drawColorNormalVertices(gl, shaderProgram, vertices, gl.TRIANGLES);
}

function setObservationViewOld(gl, shaderProgram, canvasAspect, eye) {
  const projectionMatrix = mat4.create();
  const fov = (90 * Math.PI) / 180;
  const near = 0.1;
  const far = 100;
  mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

  const lookAtMatrix = mat4.create();
  const at = [0, 0, 0];
  mat4.lookAt(lookAtMatrix, eye, at, [0, 0, 1]);
  mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

  const projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix"
  );
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}

function setObservationView(
  gl,
  shaderProgram,
  canvasAspect,
  eye,
  WIDTH,
  HEIGHT
) {
  const projectionMatrix = mat4.create();
  const fov = (90 * Math.PI) / 180;
  const near = 0.1;
  const far = 1000;
  mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

  const lookAtMatrix = mat4.create();
  const at = [WIDTH / 2, 45, 0];
  const up = [0, 0, 1];
  mat4.lookAt(lookAtMatrix, eye, at, up);

  mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

  const projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix"
  );
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}

function setRatView(gl, shaderProgram, canvasAspect, eye, at) {
  const projectionMatrix = mat4.create();
  const fov = (90 * Math.PI) / 180;
  const near = 0.1;
  const far = 1000;
  mat4.perspective(projectionMatrix, fov, canvasAspect, near, far);

  const lookAtMatrix = mat4.create();
  const up = [0, 0, 1];
  mat4.lookAt(lookAtMatrix, eye, at, up);

  mat4.multiply(projectionMatrix, projectionMatrix, lookAtMatrix);

  const projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix"
  );
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
}

