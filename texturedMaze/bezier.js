import { drawCircle, drawLineStrip } from "./shapes2d.js";
import { randomDouble } from "./random.js";

function makeBezier(xlow, xhigh, ylow, yhigh){
    const bezierSizeX = (xhigh-xlow)/4;
    const bezierSizeY = (yhigh-ylow)/10;
    const x0 = randomDouble(xlow, xhigh-bezierSizeX);
    const y0 = randomDouble(ylow+bezierSizeY,yhigh-bezierSizeY);
    const x1 = x0 + bezierSizeX/3;
    const x2 = x1 + bezierSizeX/3;
    const x3 = x2 + bezierSizeX/3;
    const y1 = y0 + bezierSizeY;
    const y2 = y0 - bezierSizeY;
    const y3 = y0;
    const b = new Bezier(new Point2(x0,y0), new Point2(x1,y1),new Point2(x2,y2), new Point2(x3,y3));
    return b;
}

class Point2{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

class Bezier{
    static RADIUS = .4;
    constructor(p0, p1, p2, p3) {
        this.points = [p0, p1, p2, p3];
        //this.color = [myRandom(), myRandom(), myRandom(), 1];
        this.color = [1,.9,.2, 1];
    }

    evaluate(t){
        const p = new Point2(0,0);
        p.x = this.points[0].x * (1-t)**3 + 3*this.points[1].x * (1-t)**2 * t + 3*this.points[2].x * (1-t)*t*t + this.points[3].x*t*t*t;
        p.y = this.points[0].y * (1-t)**3 + 3*this.points[1].y * (1-t)**2 * t + 3*this.points[2].y * (1-t)*t*t + this.points[3].y*t*t*t;
        return p;
    }

    drawCurve(gl, shaderProgram){
        const steps = 100;
        const vertices = [];

        for (let i = 0; i < steps + 1; i++) {
            const t = i / steps;
            const p = this.evaluate(t);
            vertices.push(p.x, p.y);
        }

        drawLineStrip(gl, shaderProgram, vertices, this.color);
    }

    drawControlPoints(gl, shaderProgram){
        // Draw all bezier points as circles:
        for (let i=0; i<4; i++){
            const p = this.points[i];
            drawCircle(gl, shaderProgram, p.x, p.y, Bezier.RADIUS, this.color);       
        }
    }
    isPicked(x, y){
        for(let i=0; i<4; i++){
            const p = this.points[i];
            const distSquared = (x-p.x)**2 + (y-p.y)**2;
            if (distSquared < Bezier.RADIUS**2){
                return i;
            }
        }
        return -1;
    }
    setPoint(i, x, y){
        this.points[i].x = x;
        this.points[i].y = y;
    }
}

export {makeBezier, Point2, Bezier};