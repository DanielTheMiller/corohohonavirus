import { ImageRef } from "./assetManager";
import { Elf } from "./elf";
import { Vector2d } from "./vector2d";
import { Weapon } from "./weapon";

const TIME_FLYING = 1000;
const size = new Vector2d(64,32);

export class Projectile {
    direction: Vector2d;
    position: Vector2d;
    createdTime: number;
    type: ProjectileType;
    parent: Weapon;
    image: HTMLImageElement;
    size: Vector2d = size;

    constructor(parent: Weapon, type: ProjectileType){
        this.parent = parent;
        this.createdTime = new Date().getTime();
        this.type = type;
        this.position = parent.gameCanvas.pos.getInverse();
        this.direction = parent.gameCanvas.mainElf.lookDir.multiplyThis(15);
        console.log("LookDir", this.direction);
        switch(type){
            case(ProjectileType.SYRINGE):
                this.image = this.parent.gameCanvas.assetManager.getImage(ImageRef.SYRINGE);
                break;
            case (ProjectileType.BULLET):
                this.image = this.parent.gameCanvas.assetManager.getImage(ImageRef.BULLET);
                this.size = new Vector2d(15,10);
                break;
            case (ProjectileType.ICECUBE):
                this.image = this.parent.gameCanvas.assetManager.getImage(ImageRef.ICE_CUBE);
                this.size = new Vector2d(45,45);
        }
    }

    moveAndAct(){
        if (new Date().getTime() - this.createdTime < TIME_FLYING){
            this.position.translate(this.direction);//Move
            let elfHit: Elf = this.parent.gameCanvas.gridManager.findFirstImpactedElf(this.position,35,[this.parent.gameCanvas.mainElf]);
            if (elfHit != null){//Bullet hit a guy!
                switch(this.type){
                    case(ProjectileType.BULLET):
                        elfHit.kill();
                    case(ProjectileType.ICECUBE):
                        elfHit.isolate();
                    case(ProjectileType.SYRINGE):
                        elfHit.vacinate();
                }    
                this.parent.removeBullet(this);
            }
        }else{
            //Destroy this
            this.parent.removeBullet(this);
        }
    }

    draw(){
        this.parent.gameCanvas.context.beginPath();
        this.parent.gameCanvas.context.setTransform(1,0,0,1,0,0);
        this.parent.gameCanvas.context.translate(Math.floor(this.parent.gameCanvas.myCanvas.nativeElement.width / 2), Math.floor(this.parent.gameCanvas.myCanvas.nativeElement.height / 2));
        this.parent.gameCanvas.context.drawImage(
            this.image,
            this.parent.gameCanvas.pos.x+this.position.x-this.size.x/2,
            this.parent.gameCanvas.pos.y+this.position.y-this.size.y/2,
            this.size.x,
            this.size.y);
        this.parent.gameCanvas.context.fill();
    }
}

export enum ProjectileType {
    SYRINGE,
    ICECUBE,
    BULLET
}