import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { Vector2d } from "./vector2d";

const ACCELERATION_SPEED = 2;//Acceleration speed per second;
const ACCELERATION_SPRINT_SPEED = 4;

export class InputDirections {
    constructor(gameCanvas: GameCanvasComponent){
        this.gameCanvas = gameCanvas;
    }

    private gameCanvas: GameCanvasComponent;

    public up: boolean = false;
    public down: boolean = false;
    public left: boolean = false;
    public right: boolean = false;
    public sprint: boolean = false;
    public fire: boolean = false;

    getWalkDirFromInput(vector: Vector2d, isNPC: boolean = false): void{
        if (vector == null){
            return;
        }
        console.log("Breakpoint here");
        let accelerationSpeedRate = this.sprint ? ACCELERATION_SPRINT_SPEED : ACCELERATION_SPEED;
        let accelerationSpeed = accelerationSpeedRate * this.gameCanvas.deltaTime;
        let xDir = (this.left ? -accelerationSpeed : 0) + (this.right ? accelerationSpeed : 0);
        let yDir = (this.up ? -accelerationSpeed : 0) + (this.down ? accelerationSpeed : 0);
        //Deccelerate 
        if (vector.x > 0 && xDir == 0){
            xDir = -accelerationSpeed;
            if (xDir < 0){
                xDir = -vector.x;
            }
        } 
        if (vector.x < 0 && xDir == 0){ 
            xDir = accelerationSpeed;
            if (xDir > 0){
                xDir = -vector.x;
            }
        }
        if (vector.y > 0 && yDir == 0){ 
            yDir = -accelerationSpeed;
            if (yDir < 0){
                yDir = -vector.y;
            }
        }
        if (vector.y < 0 && yDir == 0){
            yDir = accelerationSpeed;
            if (yDir > 0){
                yDir = -vector.y;
            }
        }
        vector.x += xDir;
        vector.y += yDir;
        vector.setX(clamp(vector.x, -1, 1));
        vector.setY(clamp(vector.y, -1, 1));
    }

    reset(): void{
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.sprint = false;
        this.fire = false;
    }
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
};