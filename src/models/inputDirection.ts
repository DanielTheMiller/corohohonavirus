import { Vector2d } from "./vector2d";

const MAX_SPEED:number = 3;
const MAX_SPRINT_SPEED: number = 5;

export class InputDirections {
    constructor(){
    }

    public up: boolean = false;
    public down: boolean = false;
    public left: boolean = false;
    public right: boolean = false;
    public sprint: boolean = false;
    public fire: boolean = false;

    getWalkDirFromInput(vector: Vector2d, isNPC: boolean = false): void{
        let accelerationSpeed = this.sprint ? 2 : 1;
        let maxSpeed = this.sprint ? MAX_SPRINT_SPEED : MAX_SPEED;
        maxSpeed = isNPC ? maxSpeed - 2 : maxSpeed; 
        let xDir = (this.left ? -accelerationSpeed : 0) + (this.right ? accelerationSpeed : 0);
        let yDir = (this.up ? -accelerationSpeed : 0) + (this.down ? accelerationSpeed : 0);
        if (vector.x > 0 && xDir == 0) xDir = -1;
        if (vector.x < 0 && xDir == 0) xDir = 1;
        if (vector.y > 0 && yDir == 0) yDir = -1;
        if (vector.y < 0 && yDir == 0) yDir = 1;
        vector.setX(clamp(vector.x+xDir, -maxSpeed, maxSpeed));
        vector.setY(clamp(vector.y+yDir, -maxSpeed, maxSpeed));
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