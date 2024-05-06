import { initShaderProgram } from "./shader.js";
import {
  drawCircle,
  drawRectangle,
  drawTriangle,
  drawLineStrip,
} from "./shapes2d.js";
import { randomDouble } from "./random.js";

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
  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //
  // Create shaders
  //
  const vertexShaderText = await (await fetch("simple.vs")).text();
  const fragmentShaderText = await (await fetch("simple.fs")).text();
  const shaderProgram = initShaderProgram(
    gl,
    vertexShaderText,
    fragmentShaderText
  );

  //
  // load a projection matrix onto the shader
  //
  const projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix"
  );
  const projectionMatrix = mat4.create();
  let ylow = -1.5;
  let yhigh = 1.5;
  let xlow = -2.5;
  let xhigh = 0.5;
  mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

  //
  // Create content to display
  //

  //
  // Register Listeners
  //
  canvas.addEventListener("mousewheel", mouseWheel);
  const zoomDelta = 0.1
  function mouseWheel(event) {
      const zoomDirection = event.deltaY > 0 ? 1 : -1;
      const zoomFactor = 1 + zoomDirection * zoomDelta; 
      const xWorld = xlow + event.clientX / gl.canvas.clientWidth * (xhigh - xlow); 
      const yWorld = ylow + (gl.canvas.clientHeight - event.clientY) / gl.canvas.clientHeight * (yhigh - ylow); 
      const newXRange = (xhigh - xlow) * zoomFactor; 
      const newYRange = (yhigh - ylow) * zoomFactor; 
      xlow = xWorld - (xWorld - xlow) * zoomFactor; 
      xhigh = xlow + newXRange;
      ylow = yWorld - (yWorld - ylow) * zoomFactor;
      yhigh = ylow + newYRange;
      console.log("xlow: ", xlow, "xhigh: ", xhigh, "ylow: ", ylow, "yhigh: ", yhigh);
      mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
      gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
      requestAnimationFrame(redraw);
  }
  //
  // Main render loop
  //
  let previousTime = 0;
  function redraw(currentTime) {
    currentTime *= 0.001; // milliseconds to seconds
    let DT = currentTime - previousTime;
    if (DT > 0.1) DT = 0.1;
    previousTime = currentTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawRectangle(gl, shaderProgram, xlow, ylow, xhigh, yhigh, [1, 0, 0, 1]); // override the default color with red.

  }
  requestAnimationFrame(redraw);
}
