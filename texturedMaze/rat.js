import {drawLines, drawLineStrip, drawLineLoop, drawQuad} from "./shapes2d.js";

class Rat{
    constructor(x, y, degrees, m) {
        this.x = x;
        this.y = y;
        this.z = 0; // Start at floor level
        this.degrees = degrees;
        this.maze = m;

        this.SPIN_SPEED = 90; // degrees per second
        this.MOVE_SPEED = 1.0; // cells per second
        this.RISE_SPEED = 0.1; // speed at which the rat rises or lowers
        this.RADIUS = 0.3;
        this.maxHeight = 0.6; // Maximum elevation above the maze floor, adjust as needed
        this.targetZ = 0; // Target vertical position
    }

    initiateRise() {
        this.targetZ = this.maxHeight;
    }

    initiateLower() {
        this.targetZ = 0;
    }

    updateZ(DT) {
        if (this.z < this.targetZ) {
            this.z = Math.min(this.z + this.RISE_SPEED * DT, this.targetZ);
        } else if (this.z > this.targetZ) {
            this.z = Math.max(this.z - this.RISE_SPEED * DT, this.targetZ);
        }
    }
    draw(gl, shaderProgram, DT, currentTime){
        // const returnVals = this.maze.getPathPosition(currentTime);
        // this.x = returnVals[0];
        // this.y = returnVals[1];
        // const returnVals2 = this.maze.getPathPosition(currentTime+.1);
        // const radians = Math.atan2(returnVals2[1]-returnVals[1], returnVals2[0]-returnVals[0]);
        // this.degrees = radians/Math.PI*180;

        const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
        const modelViewMatrix = mat4.create();
        
        mat4.translate(modelViewMatrix, modelViewMatrix, [this.x, this.y, 0]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, (this.degrees* Math.PI / 180), [0, 0, 1]);

        gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

        const vertices = [.3,0, -.2,.1, -.2,-.1];
        drawLineLoop(gl, shaderProgram, vertices);
    
    }
    spinLeft(DT){
        this.degrees += this.SPIN_SPEED*DT;
    }
    spinRight(DT){
        this.spinLeft(-DT);
    }
    scurryForward(DT){
        const dx = Math.cos(this.degrees* Math.PI / 180);
        const dy = Math.sin(this.degrees* Math.PI / 180);
        const newX = this.x + dx*this.MOVE_SPEED*DT;
        const newY = this.y + dy*this.MOVE_SPEED*DT;
        if (this.maze.isSafe(newX, newY, this.RADIUS)){
            this.x = newX;
            this.y = newY;
        }
        else if (this.maze.isSafe(this.x, newY, this.RADIUS)){
            this.y = newY;
        }
        else if (this.maze.isSafe(newX, this.y, this.RADIUS)){
            this.x = newX;
        }
    }
    scurryBackward(DT){
        this.scurryForward(-DT);
    }
    strafeLeft(DT){
        const dx = Math.cos(this.degrees* Math.PI / 180);
        const dy = Math.sin(this.degrees* Math.PI / 180);
        const newX = this.x - dy*this.MOVE_SPEED*DT;
        const newY = this.y + dx*this.MOVE_SPEED*DT;
        if (this.maze.isSafe(newX, newY, this.RADIUS)){
            this.x = newX;
            this.y = newY;
        }
        else if (this.maze.isSafe(this.x, newY, this.RADIUS)){
            this.y = newY;
        }
        else if (this.maze.isSafe(newX, this.y, this.RADIUS)){
            this.x = newX;
        }
    }
    strafeRight(DT){
        this.strafeLeft(-DT);
    }
}
export {Rat};