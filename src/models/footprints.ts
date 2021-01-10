import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { Elf } from "./elf";
import { Vector2d } from "./vector2d";

const FOOTSTEP_FADE_TIME = 2750;

export class Footprint {
    position: Vector2d;
    size: Vector2d = new Vector2d(7,4);
    gameCanvas: GameCanvasComponent;
    generatedTime: number;
    parent: Elf;

    constructor(parent: Elf, position: Vector2d){
        this.parent = parent;
        this.gameCanvas = this.parent.gameComponent;
        this.position = position;
        this.generatedTime = new Date().getTime();
    }

    draw() {
        let timePassed = new Date().getTime() - this.generatedTime;
        if (timePassed > FOOTSTEP_FADE_TIME){
            //Delete footstep
            this.deleteFootstep();
        }else{
            let opacity = (1-(timePassed / FOOTSTEP_FADE_TIME))*0.5; 
            this.gameCanvas.context.beginPath();
            this.gameCanvas.context.setTransform(1,0,0,1,0,0);
            this.gameCanvas.context.translate(Math.floor(this.gameCanvas.myCanvas.nativeElement.width / 2), Math.floor(this.gameCanvas.myCanvas.nativeElement.height / 2));
            this.gameCanvas.context.fillStyle = `rgba(55, 55, 55, ${opacity})`;
            this.gameCanvas.context.arc(
                -(this.gameCanvas.pos.x+this.position.x)-this.size.x/2,
                -(this.gameCanvas.pos.y+this.position.y)-this.size.y/2,
                this.size.x,
                0,
                2 * Math.PI);
            this.gameCanvas.context.fill();
        }
    }

    deleteFootstep()
    {
        this.parent.footprints = this.parent.footprints.filter(x => (x != this));
    }
}