import { CardinalDirection } from "src/models/CardinalDirection";
import { ImageRef } from "src/models/ImageRef";
import { Elf } from "./elf";
import { Vector2d } from "./vector2d";
import { Weapon } from "./weapon";

const TIME_FLYING = 1000;
const size = new Vector2d(64,32);
const SPEED = 1800;//pixels per second

export class Projectile {
    direction: Vector2d;
    cardinalDirection: CardinalDirection;
    position: Vector2d;
    createdTime: number;
    type: ProjectileType;
    parent: Weapon;
    image: HTMLImageElement;
    size: Vector2d = size;
    imageRotationDeg: number;

    constructor(parent: Weapon, type: ProjectileType){
        this.parent = parent;
        this.createdTime = new Date().getTime();
        this.type = type;
        this.position = parent.gameCanvas.mainElf.gPos.clone();
        this.position.translate(new Vector2d(0,-15));
        this.direction = parent.gameCanvas.mainElf.lookDir.clone();
        this.imageRotationDeg = this.direction.getImageRotation();
        this.cardinalDirection = this.direction.getCardinalDirection();
        switch(type){
            case(ProjectileType.SYRINGE):
                this.image = this.parent.gameCanvas.assetManager.getImage(ImageRef.SYRINGE);
                this.size = new Vector2d(10,25);
                break;
            case (ProjectileType.BULLET):
                this.image = this.parent.gameCanvas.assetManager.getImage(ImageRef.BULLET);
                this.size = new Vector2d(10,20);
                break;
            case (ProjectileType.ICECUBE):
                this.image = this.parent.gameCanvas.assetManager.getImage(ImageRef.ICE_CUBE);
                this.size = new Vector2d(40,40);
        }
    }

    moveAndAct(){
        if (new Date().getTime() - this.createdTime < TIME_FLYING){
            let deltaTime = this.parent.gameCanvas.deltaTime;
            this.position.translate(this.direction.multiply(SPEED * deltaTime));//Move
            let elfHit: Elf = this.parent.gameCanvas.gridManager.findFirstImpactedElf(this.position,35,[this.parent.gameCanvas.mainElf]);
            if (elfHit != null){//Bullet hit a guy!
                switch(this.type){
                    case(ProjectileType.BULLET):
                        elfHit.kill();
                        break;
                    case(ProjectileType.ICECUBE):
                        elfHit.isolate();
                        break;
                    case(ProjectileType.SYRINGE):
                        elfHit.vacinate();
                        break;
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
        
        let XPos = this.position.x-this.parent.gameCanvas.mainElf.gPos.x-this.size.x/2;
        let YPos = this.position.y-this.parent.gameCanvas.mainElf.gPos.y-this.size.y/2;

        this.parent.gameCanvas.context.translate(XPos, YPos);
        this.parent.gameCanvas.context.rotate(this.imageRotationDeg*Math.PI/180);
        this.parent.gameCanvas.context.drawImage(
            this.image,
            0,
            0,
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