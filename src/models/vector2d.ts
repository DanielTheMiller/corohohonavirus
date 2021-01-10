export class Vector2d {

    public x: number;
    public y: number;

    constructor(x=0,y=0){
        //console.log("New Vector ", x,y);
        this.x = x;
        this.y = y;
    }

    set(x=0, y=0){
        this.x = x;
        this.y = y;
    }

    setX(x=0){
        this.x = x;
    }

    setY(y=0){
        this.y = y;
    }

    //Returns bool representing if there was a change
    translate(xy: Vector2d):boolean{
        this.x += xy.x;
        this.y += xy.y;
        return xy.x != 0 || xy.y != 0;
    }

    public equals(other: Vector2d):boolean{
        return this.x == other.x && this.y == other.y
    }

    public toString(): string{
        return `[${this.x},${this.y}]`;
    }

    public isZero(): boolean {
        return this.x == 0 && this.y == 0;
    }

    public getInverse(): Vector2d{
        return new Vector2d(-this.x,-this.y);
    }

    public getLookDir(): Vector2d{
        return new Vector2d(Math.sign(this.x), Math.sign(this.y));
    }

    public getAbsolute(): Vector2d{
        return new Vector2d(Math.abs(this.x), Math.abs(this.y));
    }

    public clone(): Vector2d{
        return new Vector2d(this.x, this.y);
    }

    public add(vector: Vector2d): Vector2d{
        return new Vector2d(this.x + vector.x, this.y + vector.y);
    }

    public multiplyThis(multiplier: number): Vector2d {
        this.x = this.x * multiplier;
        this.y = this.y * multiplier;
        return this;
    }

    public doubleThis(): Vector2d {
        this.x = this.x * 2;
        this.y = this.y * 2;
        return this;
    }
}