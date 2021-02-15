import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { ImageRef } from "src/models/ImageRef";
import { ProjectileType } from "./projectile";
import { TrackableObject, TrackableObjectType } from "./TrackableObject";
import { Vector2d } from "./vector2d";

const AMMO_QUANT: number = 25;

export class RefillStation extends TrackableObject{
    stationType: ProjectileType;
    size: Vector2d;
    pickedUp: boolean = false;
    stationImage: HTMLImageElement;
    stationEmptyImage: HTMLImageElement;
    gameCanvas: GameCanvasComponent;
    
    //Check if the main character intersects with this station
    checkPickup(){
        if (!this.pickedUp){
            let mainElf = this.gameCanvas.mainElf;
            let radius = 60;
            let diff = mainElf.gPos.add(this.gPos.getInverse()).getAbsolute();
            if (diff.x <= radius && diff.y <= radius){
                console.log(this.gameCanvas.weapons.map(x=>x.projectileType), this.type);
                let currentWeapon = this.gameCanvas.weapons.find(x => x.projectileType == this.stationType);
                currentWeapon.ammo = Math.min(currentWeapon.ammo + AMMO_QUANT, currentWeapon.maxAmmo);
                this.pickedUp = true;
            }
        }
    }

    draw(){
        if (!this.gameCanvas.gridManager.isStationInViewport(this)){
            this.gameCanvas.removeStation(this);
            return;
        }
        this.checkPickup();
        this.gameCanvas.context.beginPath();
        this.gameCanvas.context.setTransform(1,0,0,1,0,0);
        this.gameCanvas.context.translate(Math.floor(this.gameCanvas.myCanvas.nativeElement.width / 2), Math.floor(this.gameCanvas.myCanvas.nativeElement.height / 2));
        this.gameCanvas.context.drawImage(
            this.pickedUp ? this.stationEmptyImage : this.stationImage,
            -this.gameCanvas.pos.x-this.size.x/2+this.gPos.x,
            -this.gameCanvas.pos.y-this.size.y/2+this.gPos.y);
        this.gameCanvas.context.fill();        
    }

    constructor (gameCanvas: GameCanvasComponent, type: ProjectileType, position: Vector2d){
        super(position, TrackableObjectType.RefillStation);
        this.gameCanvas = gameCanvas;
        this.stationType = type;
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
