import { setShaderAttributes, loadTexture } from "./helpers.js";


class ChessSet {


    constructor(gl) {
        this.buffers = {};
        this.startTime = Date.now(); // Start time of the animations
        this.duration = 2000; // Duration of each animation in milliseconds
        this.delaySecondAnimation = 2000; // Delay for the start of the second animation
    }

  async init(gl) {
    this.blackTexture = loadTexture(
      gl,
      "pieces/PiezasAjedrezDiffuseMarmolBlackBrighter.png",
      [80, 80, 80, 255]
    );
    this.whiteTexture = loadTexture(
      gl,
      "pieces/PiezasAjedrezDiffuseMarmol.png",
      [220, 220, 220, 255]
    );
    this.boardTexture = loadTexture(
      gl,
      "pieces/TableroDiffuse01.png",
      [255, 171, 0, 255]
    );
    await this.readObj(gl, "pieces/PiezasAjedrezAdjusted.obj");
  }

  draw(gl, shaderProgram, currentTime) {
    
    //Animation Schedule
    let elapsed = Date.now() - this.startTime;
    let progress1 = Math.min(elapsed / this.duration, 1); // Progress of the first animation
    let progress2 = Math.max(0, (elapsed - this.delaySecondAnimation) / this.duration);
    progress2 = Math.min(progress2, 1); // Progress of the second animation
    let progress3 = Math.max(0, (elapsed - this.delaySecondAnimation - this.duration) / this.duration);
    progress3 = Math.min(progress3, 1); // Ensures the progress does not exceed 1
    let progress4 = Math.max(0, (elapsed - this.delaySecondAnimation - 2 * this.duration) / this.duration);
    progress4 = Math.min(progress4, 1); // Ensures the progress does not exceed 1
    let progress5 = Math.max(0, (elapsed - this.delaySecondAnimation - 3 * this.duration) / this.duration);
    progress5 = Math.min(progress5, 1); // Ensures the progress does not exceed 1
    let progress6 = Math.max(0, (elapsed - this.delaySecondAnimation - 4 * this.duration) / this.duration);
    progress6 = Math.min(progress6, 1); // Ensures the progress does not exceed 1
    let progress7 = Math.max(0, (elapsed - this.delaySecondAnimation - 5 * this.duration) / this.duration);
    progress7 = Math.min(progress7, 1); // Ensures the progress does not exceed 1






    // Draw board
    this.drawPiece(gl, shaderProgram, "cube", this.boardTexture);

    //Bishops
    //animation 5/7
    let bishopMatrix = mat4.create();
    let bishopStart = [-1.5, 0, 3.5];
    let bishopEnd = [3.5, 0, -1.5]; // Position where the bishop moves to before being captured
    let bishopRiseEnd = [3.5, 0, 8]; // High Z-coordinate for 'going to heaven'
    
    let currentPosBishop = [
        bishopStart[0] + (bishopEnd[0] - bishopStart[0]) * progress5, // Interpolating X coordinate
        bishopStart[1], // Y coordinate remains unchanged
        bishopStart[2] + (bishopEnd[2] - bishopStart[2]) * progress5  // Interpolating Z coordinate for initial movement
    ];
    
    mat4.translate(bishopMatrix, bishopMatrix, currentPosBishop);
    mat4.rotate(bishopMatrix, bishopMatrix, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "bishop", this.whiteTexture, bishopMatrix);
    
    // Initiate ascension after reaching the target and being captured
    if (progress5 >= 1 && progress6 >= 1) { // Ensure both the bishop's movement and the pawn's capture are complete
        let currentPosBishopRising = [
            bishopEnd[0], // X coordinate stays the same
            bishopEnd[1] + (5 - bishopEnd[1]) * progress7, // Ascending Y coordinate
            bishopEnd[2]  // Z coordinate stays the same
        ];
        mat4.identity(bishopMatrix); // Reset the matrix for new transformation
        mat4.translate(bishopMatrix, bishopMatrix, currentPosBishopRising);
        this.drawPiece(gl, shaderProgram, "bishop", this.whiteTexture, bishopMatrix);
    }
    
    // Ensure the bishop is visible at its starting position before the animation starts
    if (elapsed < this.delaySecondAnimation + 3 * this.duration) {
        let bishopMatrixInitial = mat4.create();  // Create a new matrix for the static position
        mat4.translate(bishopMatrixInitial, bishopMatrixInitial, bishopStart);
        mat4.rotate(bishopMatrixInitial, bishopMatrixInitial, Math.PI, [0, 1, 0]);
        this.drawPiece(gl, shaderProgram, "bishop", this.whiteTexture, bishopMatrixInitial);
    }
    


    let bishopMatrix2 = mat4.create();
    mat4.translate(bishopMatrix2, bishopMatrix2, [1.5, 0, 3.5]);
    mat4.rotate(bishopMatrix2, bishopMatrix2, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "bishop", this.whiteTexture, bishopMatrix2);
    let bishopMatrix3 = mat4.create();
    mat4.translate(bishopMatrix3, bishopMatrix3, [-1.5, 0, -3.5]);
    this.drawPiece(gl, shaderProgram, "bishop", this.blackTexture, bishopMatrix3);
    let bishopMatrix4 = mat4.create();
    mat4.translate(bishopMatrix4, bishopMatrix4, [1.5, 0, -3.5]);
    this.drawPiece(gl, shaderProgram, "bishop", this.blackTexture, bishopMatrix4);
    //Knights
    let knightMatrix = mat4.create();
    mat4.translate(knightMatrix, knightMatrix, [-2.5, 0, 3.5]);
    mat4.rotate(knightMatrix, knightMatrix, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "knight", this.whiteTexture, knightMatrix);

//animation 3
    let knightMatrix2 = mat4.create();
    let knight2start = [2.5, 0, 3.5];
    let knight2end = [1.5, 0, 1.5]; // New target position for the knight
    let currentPosKnight2 = [
        knight2start[0] + (knight2end[0] - knight2start[0]) * progress3, // Interpolating X coordinate
        knight2start[1] + (knight2end[1] - knight2start[1]) * progress3, // Y coordinate doesn't change
        knight2start[2] + (knight2end[2] - knight2start[2]) * progress3  // Interpolating Z coordinate
    ];
    
    // Draw the knight at its current animated position
    mat4.translate(knightMatrix2, knightMatrix2, currentPosKnight2);
    mat4.rotate(knightMatrix2, knightMatrix2, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "knight", this.whiteTexture, knightMatrix2);
    
    // Draw the knight at its starting position before the animation starts
    if (elapsed < this.delaySecondAnimation + this.duration) {
        let knightMatrixInitial = mat4.create();  // Create a new matrix for the static position
        mat4.translate(knightMatrixInitial, knightMatrixInitial, knight2start);
        mat4.rotate(knightMatrixInitial, knightMatrixInitial, Math.PI, [0, 1, 0]);
        this.drawPiece(gl, shaderProgram, "knight", this.whiteTexture, knightMatrixInitial);
    }
//animation4
let knightMatrix3 = mat4.create();
let knight3start = [-2.5, 0, -3.5];
let knight3end = [-1.5, 0, -1.5]; // New target position for the knight
let currentPosKnight3 = [
    knight3start[0] + (knight3end[0] - knight3start[0]) * progress4, // Interpolating X coordinate
    knight3start[1] + (knight3end[1] - knight3start[1]) * progress4, // Y coordinate doesn't change
    knight3start[2] + (knight3end[2] - knight3start[2]) * progress4  // Interpolating Z coordinate
];

// Draw the knight at its current animated position
mat4.translate(knightMatrix3, knightMatrix3, currentPosKnight3);
this.drawPiece(gl, shaderProgram, "knight", this.blackTexture, knightMatrix3);

// Draw the knight at its starting position before the animation starts
if (elapsed < this.delaySecondAnimation + 2 * this.duration) {
    let knightMatrixInitial = mat4.create();  // Create a new matrix for the static position
    mat4.translate(knightMatrixInitial, knightMatrixInitial, knight3start);
    this.drawPiece(gl, shaderProgram, "knight", this.blackTexture, knightMatrixInitial);
}


    let knightMatrix4 = mat4.create();
    mat4.translate(knightMatrix4, knightMatrix4, [2.5, 0, -3.5]);
    this.drawPiece(gl, shaderProgram, "knight", this.blackTexture, knightMatrix4);
    //Rooks
    let rookMatrix = mat4.create();
    mat4.translate(rookMatrix, rookMatrix, [-3.5, 0, 3.5]);
    mat4.rotate(rookMatrix, rookMatrix, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "rook", this.whiteTexture, rookMatrix);
    let rookMatrix2 = mat4.create();
    mat4.translate(rookMatrix2, rookMatrix2, [3.5, 0, 3.5]);
    mat4.rotate(rookMatrix2, rookMatrix2, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "rook", this.whiteTexture, rookMatrix2);
    let rookMatrix3 = mat4.create();
    mat4.translate(rookMatrix3, rookMatrix3, [-3.5, 0, -3.5]);
    this.drawPiece(gl, shaderProgram, "rook", this.blackTexture, rookMatrix3);
    let rookMatrix4 = mat4.create();
    mat4.translate(rookMatrix4, rookMatrix4, [3.5, 0, -3.5]);
    this.drawPiece(gl, shaderProgram, "rook", this.blackTexture, rookMatrix4);
    //Queens
    let queenMatrix = mat4.create();
    mat4.translate(queenMatrix, queenMatrix, [-0.5, 0, 3.5]);
    mat4.rotate(queenMatrix, queenMatrix, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "queen", this.whiteTexture, queenMatrix);
    let queenMatrix2 = mat4.create();
    mat4.translate(queenMatrix2, queenMatrix2, [-0.5, 0, -3.5]);
    this.drawPiece(gl, shaderProgram, "queen", this.blackTexture, queenMatrix2);
    //Kings
    let kingMatrix = mat4.create();
    mat4.translate(kingMatrix, kingMatrix, [0.5, 0, 3.5]);
    mat4.rotate(kingMatrix, kingMatrix, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "king", this.whiteTexture, kingMatrix);
    let kingMatrix2 = mat4.create();
    mat4.translate(kingMatrix2, kingMatrix2, [0.5, 0, -3.5]);
    this.drawPiece(gl, shaderProgram, "king", this.blackTexture, kingMatrix2);
    //white pawns
    let pawnMatrix = mat4.create();
    mat4.translate(pawnMatrix, pawnMatrix, [-3.5, 0, 2.5]);
    mat4.rotate(pawnMatrix, pawnMatrix, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "pawn", this.whiteTexture, pawnMatrix);
    let pawnMatrix2 = mat4.create();
    mat4.translate(pawnMatrix2, pawnMatrix2, [-2.5, 0, 2.5]);
    mat4.rotate(pawnMatrix2, pawnMatrix2, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "pawn", this.whiteTexture, pawnMatrix2);
    let pawnMatrix3 = mat4.create();
    mat4.translate(pawnMatrix3, pawnMatrix3, [-1.5, 0, 2.5]);
    mat4.rotate(pawnMatrix3, pawnMatrix3, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "pawn", this.whiteTexture, pawnMatrix3);
    let pawnMatrix4 = mat4.create();
    let pawn4start = [-0.5, 0, 2.5];
    let pawn4end = [-0.5, 0, 0.5]; // Target position for the first pawn
    let currentPosPawn4 = [
        pawn4start[0], // X coordinate doesn't change
        pawn4start[1], // Y coordinate doesn't change
        pawn4start[2] + (pawn4end[2] - pawn4start[2]) * progress1 // Interpolating Z coordinate
    ];
    
    mat4.translate(pawnMatrix4, pawnMatrix4, currentPosPawn4);
    mat4.rotate(pawnMatrix4, pawnMatrix4, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "pawn", this.whiteTexture, pawnMatrix4);
    let pawnMatrix5 = mat4.create();
    mat4.translate(pawnMatrix5, pawnMatrix5, [0.5, 0, 2.5]);
    mat4.rotate(pawnMatrix5, pawnMatrix5, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "pawn", this.whiteTexture, pawnMatrix5);
    let pawnMatrix6 = mat4.create();
    mat4.translate(pawnMatrix6, pawnMatrix6, [1.5, 0, 2.5]);
    mat4.rotate(pawnMatrix6, pawnMatrix6, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "pawn", this.whiteTexture, pawnMatrix6);
    let pawnMatrix7 = mat4.create();
    mat4.translate(pawnMatrix7, pawnMatrix7, [2.5, 0, 2.5]);
    mat4.rotate(pawnMatrix7, pawnMatrix7, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "pawn", this.whiteTexture, pawnMatrix7);
    let pawnMatrix8 = mat4.create();
    mat4.translate(pawnMatrix8, pawnMatrix8, [3.5, 0, 2.5]);
    mat4.rotate(pawnMatrix8, pawnMatrix8, Math.PI, [0, 1, 0]);
    this.drawPiece(gl, shaderProgram, "pawn", this.whiteTexture, pawnMatrix8);

    //black pawns
    let pawnMatrix9 = mat4.create();
    mat4.translate(pawnMatrix9, pawnMatrix9, [-3.5, 0, -2.5]);
    this.drawPiece(gl, shaderProgram, "pawn", this.blackTexture, pawnMatrix9);
    let pawnMatrix10 = mat4.create();
    mat4.translate(pawnMatrix10, pawnMatrix10, [-2.5, 0, -2.5]);
    this.drawPiece(gl, shaderProgram, "pawn", this.blackTexture, pawnMatrix10);
    let pawnMatrix11 = mat4.create();
    mat4.translate(pawnMatrix11, pawnMatrix11, [-1.5, 0, -2.5]);
    this.drawPiece(gl, shaderProgram, "pawn", this.blackTexture, pawnMatrix11);

    // Draw second pawn at start position until its animation starts
    let pawnMatrix12 = mat4.create();
    let pawn12start = [-0.5, 0, -2.5];
    let pawn12end = [-0.5, 0, -0.5]; // Target position for the second pawn
    let currentPosPawn12 = [
        pawn12start[0], // X coordinate doesn't change
        pawn12start[1], // Y coordinate doesn't change
        pawn12start[2] // Initial Z coordinate
    ];
    
    // Update position once animation begins
    if (elapsed > this.delaySecondAnimation) {
        currentPosPawn12[2] = pawn12start[2] + (pawn12end[2] - pawn12start[2]) * progress2; // Interpolating Z coordinate during animation
    }

    mat4.translate(pawnMatrix12, pawnMatrix12, currentPosPawn12);
    this.drawPiece(gl, shaderProgram, "pawn", this.blackTexture, pawnMatrix12);


    let pawnMatrix13 = mat4.create();
    mat4.translate(pawnMatrix13, pawnMatrix13, [0.5, 0, -2.5]);
    this.drawPiece(gl, shaderProgram, "pawn", this.blackTexture, pawnMatrix13);
    let pawnMatrix14 = mat4.create();
    mat4.translate(pawnMatrix14, pawnMatrix14, [1.5, 0, -2.5]);
    this.drawPiece(gl, shaderProgram, "pawn", this.blackTexture, pawnMatrix14);


    //Final Animation
    let pawnMatrix15 = mat4.create();
    let pawn15Start = [2.5, 0, -2.5];
    let pawn15End = [3.5, 0, -1.5]; // Position where the bishop was moved to
    let scale = 1 + 2 * progress6; // Start with normal size and scale up to three times
    
    let currentPosPawn15 = [
        pawn15Start[0] + (pawn15End[0] - pawn15Start[0]) * progress6, // Interpolating X coordinate
        pawn15Start[1] + (pawn15End[1] - pawn15Start[1]) * progress6, // Y coordinate doesn't change
        pawn15Start[2] + (pawn15End[2] - pawn15Start[2]) * progress6  // Interpolating Z coordinate
    ];
    
    mat4.translate(pawnMatrix15, pawnMatrix15, currentPosPawn15);
    mat4.scale(pawnMatrix15, pawnMatrix15, [scale, scale, scale]); // Scaling the pawn as it moves
    this.drawPiece(gl, shaderProgram, "pawn", this.blackTexture, pawnMatrix15);
    
    // Ensure the pawn is visible at its starting position before the animation starts
    if (elapsed < this.delaySecondAnimation + 4 * this.duration) {
        let pawnMatrixInitial = mat4.create();  // Create a new matrix for the static position
        mat4.translate(pawnMatrixInitial, pawnMatrixInitial, pawn15Start);
        this.drawPiece(gl, shaderProgram, "pawn", this.blackTexture, pawnMatrixInitial);
    }

    let pawnMatrix16 = mat4.create();
    mat4.translate(pawnMatrix16, pawnMatrix16, [3.5, 0, -2.5]);
    this.drawPiece(gl, shaderProgram, "pawn", this.blackTexture, pawnMatrix16);

    if (!this.animationComplete) {
        requestAnimationFrame(() => this.draw(gl, shaderProgram, currentTime));
    }
  }

  drawPiece(gl, shaderProgram, objectName, texture, transformationMatrix = mat4.create()) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[objectName]);
    setShaderAttributes(gl, shaderProgram);

    // Set transformation matrix for the piece
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uModelViewMatrix"), false, transformationMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, this.buffers[objectName].vertexCount);
}



  async readObj(gl, filename) {
    const response = await fetch(filename);
    const text = await response.text();
    const lines = text.split("\n");
    let objectName = "";
    const vertexList = [];
    const normalList = [];
    const uvList = [];
    let currentFaceList = [];

    for (const line of lines) {
      const values = line.split(" ");
      if (values[0] == "o") {
        if (currentFaceList.length > 0) {
          this.addVertexBufferObject(
            gl,
            objectName,
            vertexList,
            uvList,
            normalList,
            currentFaceList
          );
          currentFaceList = [];
        }
        objectName = values[1].trim();
      } else if (values[0] == "v") {
        vertexList.push(
          parseFloat(values[1]),
          parseFloat(values[2]),
          parseFloat(values[3])
        );
      } else if (values[0] == "vn") {
        normalList.push(
          parseFloat(values[1]),
          parseFloat(values[2]),
          parseFloat(values[3])
        );
      } else if (values[0] == "vt") {
        uvList.push(parseFloat(values[1]), 1 - parseFloat(values[2]));
      } else if (values[0] == "f") {
        for (let i = 1; i < values.length - 2; i++) {
          const idx = [0, i, i + 1].map((j) =>
            values[j + 1].split("/").map((k) => parseInt(k) - 1)
          );
          currentFaceList.push(...idx.flat());
        }
      }
    }
    if (currentFaceList.length > 0) {
      this.addVertexBufferObject(
        gl,
        objectName,
        vertexList,
        uvList,
        normalList,
        currentFaceList
      );
    }
  }

  addVertexBufferObject(
    gl,
    objectName,
    vertexList,
    uvList,
    normalList,
    faceList
  ) {
    const vertices = [];
    for (let i = 0; i < faceList.length; i += 9) {
      for (let j = 0; j < 3; j++) {
        const vertexIndex = faceList[i + 3 * j] * 3;
        const uvIndex = faceList[i + 3 * j + 1] * 2;
        const normalIndex = faceList[i + 3 * j + 2] * 3;
        vertices.push(
          vertexList[vertexIndex],
          vertexList[vertexIndex + 1],
          vertexList[vertexIndex + 2], // x, y, z
          uvList[uvIndex],
          uvList[uvIndex + 1], // u, v
          normalList[normalIndex],
          normalList[normalIndex + 1],
          normalList[normalIndex + 2] // nx, ny, nz
        );
      }
    }

    const vertexBufferObject = gl.createBuffer();
    vertexBufferObject.vertexCount = vertices.length / 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.buffers[objectName] = vertexBufferObject;
  }

}

export { ChessSet };
