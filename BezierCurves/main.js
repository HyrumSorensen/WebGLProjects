import { initShaderProgram } from "./shader.js";
import {
  drawCircle,
  drawRectangle,
  drawTriangle,
  drawLineStrip,
  Point2,
  Bezier,
} from "./shapes2d.js";
import { randomDouble } from "./random.js";

main();
async function main() {
  let bezierCurves = []; // Array to store multiple Bezier curves
  let selectedPointIndex = -1;
  let selectedCurveIndex = -1; // Add this to track which curve is selected

  function mouseDown(event) {
    const xWorld = xlow + (event.clientX / canvas.clientWidth) * (xhigh - xlow);
    const yWorld = yhigh - (event.clientY / canvas.clientHeight) * (yhigh - ylow);
    selectedCurveIndex = -1; // Reset selected curve index
    for (let i = 0; i < bezierCurves.length; i++) {
      const pickedPointIndex = bezierCurves[i].isPicked(xWorld, yWorld);
      if (pickedPointIndex !== -1) {
        selectedCurveIndex = i;
        selectedPointIndex = pickedPointIndex;
        break; // Stop the loop if we found the picked point
      }
    }
  }

  function mouseUp(event) {
    selectedPointIndex = -1;
    selectedCurveIndex = -1; // Also reset the selected curve index
  }
  function mouseMove(event) {
    if (selectedPointIndex !== -1 && selectedCurveIndex !== -1) {
      const xWorld = xlow + (event.clientX / canvas.clientWidth) * (xhigh - xlow);
      const yWorld = yhigh - (event.clientY / canvas.clientHeight) * (yhigh - ylow);
      bezierCurves[selectedCurveIndex].setPoint(selectedPointIndex, xWorld, yWorld);
    }
  }

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
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projectionMatrix = mat4.create();
  let yhigh = 10;
  let ylow = -yhigh;
  let xlow = ylow;
  let xhigh = yhigh;
  if (aspect >= 1) {
    xlow *= aspect;
    xhigh *= aspect;
  } else {
    ylow /= aspect;
    yhigh /= aspect;
  }
  mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

  //
  // load a modelview matrix onto the shader
  //
  const modelViewMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uModelViewMatrix"
  );
  const modelViewMatrix = mat4.create();
  gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

  //
  // Create content to display
  //

  //
  // Register Listeners
  //

  canvas.addEventListener("mousedown", mouseDown);
  window.addEventListener("mouseup", mouseUp);
  canvas.addEventListener("mousemove", mouseMove);

  //
  // Main render loop
  //
  let previousTime = 0;

  function addBezierCurve() {
    const numCurves = bezierCurves.length;
    // Define the starting point for the first curve
    const startX = -17; // Adjusted for a bit of margin
    const startY = -8;

    // Calculate the offset for each new curve to prevent overlap
    // Assuming each curve needs approx 100px of width (adjust as necessary)
    const xOffsetIncrement = 6; // This translates to 100px in your coordinate system
    const yOffsetIncrement = 6; // Adjust based on canvas height and number of curves

    // Calculate new base position with some margin
    const baseX = startX + (xOffsetIncrement * (numCurves % 6)); // Wrap every 20 curves to start a new row
    const baseY = startY + (yOffsetIncrement * Math.floor(numCurves / 6));

    // Add randomness within a small range to position control points around the base point
    const p0 = new Point2(baseX + randomDouble(-1, 1), baseY + randomDouble(-1, 1));
    const p1 = new Point2(baseX + 3 + randomDouble(-1, 1), baseY + randomDouble(-1, 1));
    const p2 = new Point2(baseX + randomDouble(-1, 1), baseY + 3 + randomDouble(-1, 1));
    const p3 = new Point2(baseX + 3 + randomDouble(-1, 1), baseY + 3 + randomDouble(-1, 1));

    const newCurve = new Bezier(p0, p1, p2, p3);
    bezierCurves.push(newCurve);
}



  addBezierCurve()
  document.querySelector("#add-bezier").addEventListener("click", addBezierCurve)
  function redraw(currentTime) {
    currentTime *= 0.001; // milliseconds to seconds
    let DT = currentTime - previousTime;
    if (DT > 0.1) DT = 0.1;
    previousTime = currentTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // drawCircle(gl, shaderProgram, 5, 5, 1);
    // drawRectangle(gl, shaderProgram, 0, 0, 2, 1, [1, 0, 0, 1]); // override the default color with red.
    // drawTriangle(gl, shaderProgram, -1, 0, -1, 2, -2, 3);
    // drawLineStrip(gl, shaderProgram, [0, 0, -1, -1, -2, -1]);

    bezierCurves.forEach(curve => {
      curve.drawCurve(gl, shaderProgram);
      curve.drawControlPoints(gl, shaderProgram);
  });

    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);
}
