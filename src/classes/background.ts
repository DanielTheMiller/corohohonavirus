import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { ImageRef } from "src/models/ImageRef";
import { Vector2d } from "./vector2d";

export class Background {
    backdropImage: HTMLImageElement;
    pattern: CanvasPattern;
    gameCanvas: GameCanvasComponent;

    constructor(gameCanvas: GameCanvasComponent){
        this.gameCanvas = gameCanvas;
        this.backdropImage = gameCanvas.assetManager.getImage(ImageRef.SNOW_BACKDROP);
        this.pattern = this.gameCanvas.context.createPattern(this.backdropImage, 'repeat') ?? new CanvasPattern(); // Create a pattern with this image, and set it to "repeat".
        this.update();
    }

    update(){  
        this.gameCanvas.context.fillStyle = this.pattern;
        if (this.pattern == undefined || this.pattern == null){
            console.warn("Background pattern is null!");
            return;
        }
//        console.log("Re-rendering backdrop");
        //this.context.translate(-xPos, yPos);
        this.gameCanvas.context.setTransform(1,0,0,1,(-this.gameCanvas.pos.x),(-this.gameCanvas.pos.y));
        this.gameCanvas.context.beginPath();
        this.gameCanvas.context.rect(
            this.gameCanvas.pos.x, 
            this.gameCanvas.pos.y, 
            this.gameCanvas.myCanvas.nativeElement.width, 
            this.gameCanvas.myCanvas.nativeElement.height); // context.fillRect(x, y, width, height);
        this.gameCanvas.context.fill();
    }

    drawElfRect(x: number, y: number, xs: number, ys: number){        
        this.gameCanvas.context.setTransform(1,0,0,1,0,0);
        this.gameCanvas.context.translate(Math.floor(this.gameCanvas.myCanvas.nativeElement.width / 2),Math.floor(this.gameCanvas.myCanvas.nativeElement.height / 2));
        this.gameCanvas.context.clearRect(x-this.gameCanvas.pos.x, y-this.gameCanvas.pos.y, xs, ys);
        this.gameCanvas.context.beginPath();
        this.gameCanvas.context.rect(x-this.gameCanvas.pos.x, y-this.gameCanvas.pos.y, xs, ys); // context.fillRect(x, y, width, height);
        this.gameCanvas.context.fill();
    }
}