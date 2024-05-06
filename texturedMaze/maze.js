import {drawLines, drawLineStrip, drawQuad, drawVertices3d, drawLine, storeQuad, drawUVVertices} from "./shapes2d.js";
import {Bezier, Point2} from "./bezier.js";
import {myRandom} from "./random.js";

class Cell{
    constructor(){
        this.left = true;
        this.bottom = true;
        this.right = true;
        this.top = true;
        this.visited = false;
    }
    
    draw(gl, shaderProgram, x,y){
        const vertices = [];
        if (this.left){
            vertices.push(x,y, x, y+1);
        }
        if (this.bottom){
            vertices.push(x,y, x+1,y);
        }
        if(this.top){
            vertices.push(x, y+1, x+1, y+1);
        }        
        if(this.right){
            vertices.push(x+1, y, x+1, y+1);
        }
        drawLine(gl, shaderProgram, vertices);
    }
    drawOptimized(gl, shaderProgram, x, y, vertices) {
        const textureRepeat = 4; // Number of times the texture should repeat across each quad
        let i = 0; // Assuming i is the texture index, adjust as necessary for your textures
        let j =1;
    
        // For each wall, we calculate texture coordinates that make the texture repeat
        // `textureRepeat` times across the wall. The coordinates (u1, v1, u2, v2, u3, v3, u4, v4)
        // are set to achieve this effect, taking care to orient the texture correctly on each wall.
    
        // Draw left wall with texture
        if(this.left) {
            storeQuad(vertices,
                x, y, 0, 0, 0, i,
                x, y+1, 0, 0, textureRepeat, i,
                x, y+1, 1, textureRepeat, textureRepeat, i,
                x, y, 1, textureRepeat, 0, i);
        }
    
        // Draw bottom wall with texture
        if(this.bottom) {
            storeQuad(vertices,
                x, y, 0, 0, 0, i,
                x+1, y, 0, textureRepeat, 0, i,
                x+1, y, 1, textureRepeat, textureRepeat, i,
                x, y, 1, 0, textureRepeat, i);
        }
    
        // Draw right wall with texture
        if(this.right) {
            storeQuad(vertices,
                x+1, y, 0, 0, 0, i,
                x+1, y+1, 0, 0, textureRepeat, i,
                x+1, y+1, 1, textureRepeat, textureRepeat, i,
                x+1, y, 1, textureRepeat, 0, i);
        }
    
        // Draw top wall with texture
        if(this.top) {
            storeQuad(vertices,
                x, y+1, 0, 0, 0, i,
                x+1, y+1, 0, textureRepeat, 0, i,
                x+1, y+1, 1, textureRepeat, textureRepeat, i,
                x, y+1, 1, 0, textureRepeat, i);
        }
        //drawing floors
        storeQuad(vertices,
            x, y, 0, 0, 0, j, // Bottom-left corner
            x+1, y, 0, textureRepeat, 0, j, // Bottom-right corner
            x+1, y+1, 0, textureRepeat, textureRepeat, j, // Top-right corner
            x, y+1, 0, 0, textureRepeat, j); // Top-left corner
    }
    
}

class Maze{
    constructor(WIDTH, HEIGHT){
        this.WIDTH = WIDTH;
        this.HEIGHT = HEIGHT;
        this.cells = [];
        this.path = [];
        for(let r=0; r<HEIGHT; r++){
            this.cells.push([]);
            for(let c=0; c<WIDTH; c++){
                this.cells[r].push(new Cell());
            }
        }
        this.removeWalls(0,0);

        for(let r=0; r<this.HEIGHT; r++){
            for(let c=0; c<this.WIDTH; c++){
                this.cells[r][c].visited = false;
            }
        }
        this.path.push(.5, .5);
        this.path.push(.5, .5);
        // this.findPath(0,0);
        this.path.push(WIDTH-.5, HEIGHT-.5);
        this.path.push(WIDTH-.5, HEIGHT-.5);
    }

    removeWalls(c,r){
        this.cells[r][c].visited = true;
        const LEFT = 0;
        const BOTTOM = 1;
        const RIGHT = 2;
        const TOP = 3;
        while(true){
            // which directions are possible from the current cell?
            const available = []; 
            if(c>0 && this.cells[r][c-1].visited==false){
                available.push(LEFT);
            }
            if(c<this.WIDTH-1 && this.cells[r][c+1].visited == false){
                available.push(RIGHT);
            }
            if(r>0 && this.cells[r-1][c].visited==false){
                available.push(BOTTOM);
            }
            if(r<this.HEIGHT-1 && this.cells[r+1][c].visited == false){
                available.push(TOP);
            }

            // if we can't go forwards, go backwards.
            if (available.length == 0){
                return;
            }

            // randomly choose between the available directions, and go there.
            const random = Math.floor(myRandom()*available.length);
            const direction = available[random];

            if(direction==LEFT){
                this.cells[r][c].left = false; // remove my left wall
                this.cells[r][c-1].right = false; // remove the cell to the left's right wall
                this.removeWalls(c-1,r); // recurse left
            }            
            if(direction==RIGHT){
                this.cells[r][c].right = false;
                this.cells[r][c+1].left = false;
                this.removeWalls(c+1,r);
            }
            if(direction==BOTTOM){
                this.cells[r][c].bottom = false; 
                this.cells[r-1][c].top = false;
                this.removeWalls(c,r-1); 
            }  
            if(direction==TOP){
                this.cells[r][c].top = false; 
                this.cells[r+1][c].bottom = false;
                this.removeWalls(c,r+1); 
            }  
        }
    }



    draw(gl, shaderProgram){
        for(let r=0; r<this.HEIGHT; r++){
            for(let c= 0; c<this.WIDTH; c++){
                this.cells[r][c].draw(gl, shaderProgram, c, r);
            }
        }
    }
    drawOptimized(gl, shaderProgram){
        let vertices = [];
        for(let r=0; r<this.HEIGHT; r++){
            for(let c=0; c<this.WIDTH; c++){
                this.cells[r][c].drawOptimized(gl, shaderProgram, c, r, vertices);
            }
        }
        drawUVVertices(gl, shaderProgram, vertices, gl.TRIANGLES);

    }
    isSafe(x,y,radius){ // returns true if the given circle parameters do not intersect any existing wall or corner
        const c = Math.floor(x);
        const r = Math.floor(y);
        const offsetX = x - c;
        const offsetY = y - r;

        // Check if the right wall is there, and our radius overlaps it:
        if (this.cells[r][c].right && offsetX + radius >1)
            return false;

        // Similarily check other three walls:
        if (this.cells[r][c].left && offsetX - radius < 0)
            return false;
        if (this.cells[r][c].top && offsetY + radius > 1)
            return false;
        if (this.cells[r][c].bottom && offsetY - radius < 0)
            return false;

        // Make sure we are not in any corner:
        if (offsetX + radius > 1 && (offsetY + radius>1 || offsetY-radius<0))
            return false;
        if (offsetX - radius < 0 && (offsetY + radius>1 || offsetY-radius<0))
            return false;
        
        return true; // this is a safe location
    }
}

export {Maze};
