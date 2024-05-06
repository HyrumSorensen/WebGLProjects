import {
  drawColorNormalVertices,
  crossProduct,
  storeQuad,
} from "./shapes2d.js";

class Terrain {
  constructor(WIDTH, HEIGHT, DEPTH) {
    this.width = WIDTH;
    this.height = HEIGHT;
    this.depth = DEPTH;
    this.ruggedness = 1; // Default ruggedness
    this.waterLevel = 0; // Default water level adjustment
  }

  F(x, y) {
    let z = 0;
    // Adjust ruggedness by multiplying coefficients
    z += (5 * this.ruggedness) * Math.sin(x / 8) + (3 * this.ruggedness) * Math.cos(x / 5);
    z += (5 * this.ruggedness) * Math.sin(y / 8) + (3 * this.ruggedness) * Math.cos(y / 5);
    z += (5 * this.ruggedness) * Math.sin(x / 8) * Math.cos(y / 8);
    return z;
  }


  draw(gl, shaderProgram) {
    let epsilon = 0.01;
    let vertices = [];
    let strips = this.width;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const x1 = i;
        const y1 = j;
        const z1 = this.F(x1, y1);
        let [nx1, ny1, nz1] = crossProduct(
          x1 - epsilon,
          y1,
          this.F(x1 - epsilon, y1),
          x1,
          y1,
          this.F(x1, y1),
          x1,
          y1 + epsilon,
          this.F(x1, y1 + epsilon)
        );
        const x2 = i + 1;
        const y2 = j;
        const z2 = this.F(x2, y2);
        let [nx2, ny2, nz2] = crossProduct(
          x2 - epsilon,
          y2,
          this.F(x2 - epsilon, y2),
          x2,
          y2,
          this.F(x2, y2),
          x2,
          y2 + epsilon,
          this.F(x2, y2 + epsilon)
        );
        const x3 = i + 1;
        const y3 = j + 1;
        const z3 = this.F(x3, y3);
        let [nx3, ny3, nz3] = crossProduct(
          x3 - epsilon,
          y3,
          this.F(x3 - epsilon, y3),
          x3,
          y3,
          this.F(x3, y3),
          x3,
          y3 + epsilon,
          this.F(x3, y3 + epsilon)
        );
        const x4 = i;
        const y4 = j + 1;
        const z4 = this.F(x4, y4);
        let [nx4, ny4, nz4] = crossProduct(
          x4 - epsilon,
          y4,
          this.F(x4 - epsilon, y4),
          x4,
          y4,
          this.F(x4, y4),
          x4,
          y4 + epsilon,
          this.F(x4, y4 + epsilon)
        );

        const averageZ = (z1 + z2 + z3 + z4) / 4;
        let r = 0;
        let g = 0.9;
        let b = 0;
        if (averageZ < this.depth * 20 + this.waterLevel) { // Adjust water level condition
          r = 0;
          g = 0;
          b = 0.9; // Water color
        } else if (averageZ < this.depth * 100) {
          r = 0;
          g = 0.7;
          b = 0;
        } else {
          r = 0.8;
          g = 0.7;
          b = 0.5;
        }

        storeQuad(
          vertices,
          x1,
          y1,
          z1,
          nx1,
          ny1,
          nz1,
          x2,
          y2,
          z2,
          nx2,
          ny2,
          nz2,
          x3,
          y3,
          z3,
          nx3,
          ny3,
          nz3,
          x4,
          y4,
          z4,
          nx4,
          ny4,
          nz4,
          r,
          g,
          b
        );
      }
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {

        const x1 = i;
        const y1 = j;
        const z1 = this.depth;
        const x2 = i + 1;
        const y2 = j;
        const z2 = this.depth;
        const x3 = i + 1;
        const y3 = j + 1;
        const z3 = this.depth;
        const x4 = i;
        const y4 = j + 1;
        const z4 = this.depth;
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
          0,
          0,
          0.9
        );
      }
    }
    drawColorNormalVertices(gl, shaderProgram, vertices, gl.TRIANGLES);
  }

  getTerrainAtPoint(x, y) {
    return Math.max(this.F(x, y), this.depth);
  }
}

export { Terrain };
