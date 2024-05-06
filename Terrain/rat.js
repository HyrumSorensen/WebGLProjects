class Rat {
  constructor(x, y, degrees, color = [1, 0, 0, 1], WIDTH, HEIGHT) {
    this.x = x;
    this.y = y;
    this.degrees = degrees;
    this.color = color;

    this.width = WIDTH;
    this.height = HEIGHT;

    this.SPIN_SPEED = 90; // deegrees per second
    this.MOVE_SPEED = 3.0; // How many cells per second

    this.RADIUS = 0.3; // For bounding circle
  }

  draw(gl, shaderProgram) {
    const modelViewMatrixUniformLocation = gl.getUniformLocation(
      shaderProgram,
      "uModelViewMatrix"
    );
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [this.x, this.y, 0]);
    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      (this.degrees * Math.PI) / 180,
      [0, 0, 1]
    );
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
  }

  getAtPos() {
    const rads = (this.degrees * Math.PI) / 180;
    return [this.x + Math.cos(rads), this.y + Math.sin(rads)];
  }

  spinLeft(DT) {
    this.degrees += DT * this.SPIN_SPEED;
    if (this.degrees >= 360) {
      this.degrees -= 360;
    }
    if (this.degrees < 0) {
      this.degrees += 360;
    }
  }
  spinRight(DT) {
    this.spinLeft(-DT);
  }
  scurryForward(DT) {
    const dx = DT * this.MOVE_SPEED * Math.cos((this.degrees * Math.PI) / 180);
    const dy = DT * this.MOVE_SPEED * Math.sin((this.degrees * Math.PI) / 180);
    let newx = this.x + dx;
    let newy = this.y + dy;
    if (newx < this.width && newx > 0) {
      this.x = newx;
    }
    if (newy < this.height && newy > 0) {
      this.y = newy;
    }
  }
  scurryBackwards(DT) {
    this.scurryForward(-DT);
  }
  strafeLeft(DT) {
    const dx = DT * this.MOVE_SPEED * Math.cos((this.degrees * Math.PI) / 180);
    const dy = DT * this.MOVE_SPEED * Math.sin((this.degrees * Math.PI) / 180);
    let newx = this.x - dy;
    let newy = this.y + dx;
    if (newx < this.width && newx > 0) {
      this.x = newx;
    }
    if (newy < this.height && newy > 0) {
      this.y = newy;
    }
  }
  strafeRight(DT) {
    this.strafeLeft(-DT);
  }
}

export { Rat };
