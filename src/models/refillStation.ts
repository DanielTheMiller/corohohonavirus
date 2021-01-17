import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { ImageRef } from "./assetManager";
import { ProjectileType } from "./projectile";
import { Vector2d } from "./vector2d";

export class RefillStation{
    type: ProjectileType;
    position: Vector2d;
    size: Vector2d;
    pickedUp: boolean = false;
    stationImage: HTMLImageElement;
    stationEmptyImage: HTMLImageElement;
    gameCanvas: GameCanvasComponent;

    //Check if the main character intersects with this station
    checkPickup(){
        if (!this.pickedUp){
            let mainElf = this.gameCanvas.mainElf;
            let intersection = (Math.abs(-mainElf.position.x - this.position.x) <= 60) && (Math.abs(-mainElf.position.y - this.position.y) <= 60);
            if (intersection){
                console.log(this.gameCanvas.weapons.map(x=>x.projectileType), this.type);
                this.gameCanvas.weapons.find(x => x.projectileType == this.type).ammo + 25;
                this.pickedUp = true;
            }
        }
    }

    draw(){
        if (!this.gameCanvas.itemIsInViewport(this.position, this.size)){
            this.gameCanvas.removeStation(this);
            return;
        }
        this.checkPickup();
        this.gameCanvas.context.beginPath();
        this.gameCanvas.context.setTransform(1,0,0,1,0,0);
        this.gameCanvas.context.translate(Math.floor(this.gameCanvas.myCanvas.nativeElement.width / 2), Math.floor(this.gameCanvas.myCanvas.nativeElement.height / 2));
        this.gameCanvas.context.drawImage(
            this.pickedUp ? this.stationEmptyImage : this.stationImage,
            -this.gameCanvas.pos.x-this.size.x/2+this.position.x,
            -this.gameCanvas.pos.y-this.size.y/2+this.position.y);
        this.gameCanvas.context.fill();        
    }

    constructor (gameCanvas: GameCanvasComponent, type: ProjectileType, position: Vector2d){
        this.gameCanvas = gameCanvas;
        this.position = position;
        this.type = type;
        switch(type){
            case(ProjectileType.BULLET):
                this.stationImage = gameCanvas.assetManager.getImage(ImageRef.BULLET_STATION);
                this.stationEmptyImage = gameCanvas.assetManager.getImage(ImageRef.BULLET_STATION_DRY);
                break;
            case(ProjectileType.SYRINGE):
                this.stationImage = gameCanvas.assetManager.getImage(ImageRef.VACINE_STATION);
                this.stationEmptyImage = gameCanvas.assetManager.getImage(ImageRef.VACINE_DRY);
                break;
            case(ProjectileType.ICECUBE):
                this.stationImage = gameCanvas.assetManager.getImage(ImageRef.SNOW_STATION);
                this.stationEmptyImage = gameCanvas.assetManager.getImage(ImageRef.SNOW_DRY);
                break;
        }
        this.size = new Vector2d(this.stationImage.width, this.stationImage.height);
    }
}
