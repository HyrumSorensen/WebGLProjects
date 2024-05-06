import { Circle } from "./circle.js";
import { initShaderProgram } from "./shader.js";
import { collideParticles } from "./collisions.js";

const GRAVITY = 9.8;
const AIR_FRICTION_CONSTANT = 0.2;


let gravity = [0, 1];

window.addEventListener("keydown", function(event) {
  switch (event.code) {
      case "KeyW": // Up
          gravity = [0, -1]; // Assuming up is negative y-direction
          break;
      case "KeyA": // Left
          gravity = [-1, 0];
          break;
      case "KeyS": // Down
          gravity = [0, 1];
          break;
      case "KeyD": // Right
          gravity = [1, 0];
          break;
  }
  console.log("Gravity is now:", gravity); // Optional: for debugging
});

// Check if DeviceOrientationEvent is available and requires permission (iOS 13+)
if (
  DeviceOrientationEvent &&
  typeof DeviceOrientationEvent.requestPermission === "function"
) {
  // Create a button or use an existing one to trigger the permission request
  const button = document.createElement("button");
  button.innerText = "Enable Device Orientation";
  document.body.appendChild(button);

  button.addEventListener("click", function () {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
          // Optionally, hide or remove the button after granting permission
          button.style.display = "none";
        } else {
          alert("Device orientation permission not granted");
        }
      })
      .catch(console.error);
  });
} else {
  // For non-iOS 13+ devices, just directly add the event listener
  window.addEventListener("deviceorientation", handleOrientation, true);
}

function handleOrientation(event) {
  let x = event.beta; // In degree in the range [-180,180)
  let y = event.gamma; // In degree in the range [-90,90)

  if (x == null || y == null) {
    gravity[0] = 0;
    gravity[1] = -1; // Default gravity pointing downwards if no orientation is detected
  } else {
    // Constrain the x value to the range [-90,90]
    if (x > 90) {
      x = 90;
    }
    if (x < -90) {
      x = -90;
    }

    // Adjust gravity based on device orientation
    gravity[0] = y / 90; // -1 to +1
    gravity[1] = x / 90; // -1 to +1, flip y upside down
  }
}

main();
async function main() {
  console.log("This is working");

  const canvas = document.getElementById("glcanvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    alert("Your browser does not support WebGL");
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const vertexShaderText = await (await fetch("simple.vs")).text();
  const fragmentShaderText = await (await fetch("simple.fs")).text();
  let shaderProgram = initShaderProgram(
    gl,
    vertexShaderText,
    fragmentShaderText
  );
  gl.useProgram(shaderProgram);

  const projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix"
  );
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projectionMatrix = mat4.create();
  const yhigh = 10;
  const ylow = -yhigh;
  const xlow = ylow * aspect;
  const xhigh = yhigh * aspect;
  mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

  const NUM_CIRCLES = 8;
  const collisionFriction = 0.85; // Adjust this value as needed
  const circleList = [];
  for (let i = 0; i < NUM_CIRCLES; i++) {
    let overlaps;
    let newCircle;
    do {
      overlaps = false;
      newCircle = new Circle(xlow, xhigh, ylow, yhigh);
      for (let j = 0; j < circleList.length; j++) {
        const dx = newCircle.x - circleList[j].x;
        const dy = newCircle.y - circleList[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < newCircle.size + circleList[j].size) {
          overlaps = true;
          break;
        }
      }
    } while (overlaps);
    circleList.push(newCircle);
  }

  let previousTime = 0;
  function redraw(currentTime) {
    currentTime *= 0.001;
    let DT = currentTime - previousTime;
    previousTime = currentTime;
    if (DT > 0.1) {
      DT = 0.1;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Collision detection and resolution
    for (let i = 0; i < NUM_CIRCLES - 1; i++) {
      for (let j = i + 1; j < NUM_CIRCLES; j++) {
        let circle1 = circleList[i];
        let circle2 = circleList[j];

        const dx = circle2.x - circle1.x;
        const dy = circle2.y - circle1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = circle1.size + circle2.size;

        if (distance < minDistance) {
          // Circles are colliding
          collideParticles(circle1, circle2, DT, collisionFriction);

          // Post-collision separation
          const overlap = minDistance - distance;
          const separationX = (overlap / 2) * (dx / distance);
          const separationY = (overlap / 2) * (dy / distance);
          circle1.x -= separationX;
          circle1.y -= separationY;
          circle2.x += separationX;
          circle2.y += separationY;
        }
      }
    }

    // Update circle positions
    for (let i = 0; i < NUM_CIRCLES; i++) {
      circleList[i].update(
        DT,
        gravity[0] * GRAVITY,
        gravity[1] * GRAVITY,
        AIR_FRICTION_CONSTANT
      );
    }

    // Draw circles
    for (let i = 0; i < NUM_CIRCLES; i++) {
      circleList[i].draw(gl, shaderProgram);
    }

    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);
}
