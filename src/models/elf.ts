import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { ImageRef } from "./assetManager";
import { Footprint } from "./footprints";
import { InputDirections } from "./inputDirection";
import { Vector2d } from "./vector2d";

const NO_OF_SIDE_WALK_FRAMES = 17;
const NO_OF_FRONT_WALK_FRAMES = 8;
const TIME_BETWEEN_STEPS: number = 200;
const TIME_TO_BE_ISOLATED: number = 10000;
const INFECTION_LIFETIME: number = 15000;
var noOfElvesSpawned: number = 0;

export class Elf {
    id: number;
    alive: boolean = true;
    isolated: boolean = false;
    vacinated: boolean = false;
    ill: boolean = false;
    contactedIllElf: boolean = false;
    _keepStill: boolean = false;

    isNPC: boolean = false;
    position: Vector2d;

    currentImage: HTMLImageElement;

    idleFrontImage: HTMLImageElement;
    idleBackImage: HTMLImageElement;
    idleSideImage: HTMLImageElement;
    sideWalkImage: HTMLImageElement;
    frontWalkImage: HTMLImageElement;
    backWalkimage: HTMLImageElement;
    icedImage: HTMLImageElement;
    deadImage: HTMLImageElement;

    illTokenImage: HTMLImageElement;
    vacinatedTokenImage: HTMLImageElement;

    lookDir: Vector2d = new Vector2d();
    walkDir: Vector2d = new Vector2d();
    dirInputs: InputDirections = new InputDirections();

    timeContacted: number;
    timeIsolated: number;
    timeInfected: number;
    lastChangeOfDirection: number = new Date().getTime();//Property for NPC roaming
    footprints: Footprint[] = [];
    gameComponent: GameCanvasComponent;
    currentFrame: number = 0;
    holdFrame: boolean = false;//Used to half the walk rate when walking

    frameHeight: number = 260;
    frameWidth: number = 180;
    stepOffset: boolean = false; //Used to alternate footprint positions

    lastShotMade: number = 0;

    constructor(gameComponent: GameCanvasComponent, npc: boolean = false, position: Vector2d = new Vector2d(), isInfected=false, keepStill=false){
        this.id = noOfElvesSpawned++;
        let assetManager = gameComponent.assetManager;
        this.gameComponent = gameComponent;
        this.position = position;
        this.isNPC = npc;
        this.icedImage = assetManager.getImage(ImageRef.NPC_ICED);
        this.ill = isInfected;
        this._keepStill = keepStill;
        if (isInfected){
            this.timeInfected = new Date().getTime();            
        }
        if (!npc){
            this.idleFrontImage = assetManager.getImage(ImageRef.MAIN_IDLE_FRONT);
            this.idleBackImage = assetManager.getImage(ImageRef.MAIN_IDLE_BACK);
            this.idleSideImage = assetManager.getImage(ImageRef.MAIN_IDLE_SIDE);
            this.sideWalkImage = assetManager.getImage(ImageRef.MAIN_SIDE_WALK_CYCLE);
            this.frontWalkImage = assetManager.getImage(ImageRef.MAIN_FRONT_WALK_CYCLE);
            this.backWalkimage = assetManager.getImage(ImageRef.MAIN_BACK_WALK_CYCLE);
            this.walkDir = this.gameComponent.walkDir;
            this.position = this.gameComponent.pos;
            this.dirInputs = this.gameComponent.inputDirection;
        } else {
            this.idleFrontImage = assetManager.getImage(ImageRef.NPC_IDLE_FRONT);
            this.idleBackImage = assetManager.getImage(ImageRef.NPC_IDLE_BACK);
            this.idleSideImage = assetManager.getImage(ImageRef.NPC_IDLE_SIDE);
            this.sideWalkImage = gameComponent.assetManager.getImage(ImageRef.NPC_WALK_CYCLE);            
            this.frontWalkImage = gameComponent.assetManager.getImage(ImageRef.NPC_FRONT_WALK_CYCLE);
            this.backWalkimage = gameComponent.assetManager.getImage(ImageRef.NPC_BACK_WALK_CYCLE);
            this.deadImage = gameComponent.assetManager.getImage(ImageRef.NPC_DEAD);
        }
        this.illTokenImage = assetManager.getImage(ImageRef.TOKEN_INFECTED);
        this.vacinatedTokenImage = assetManager.getImage(ImageRef.TOKEN_VACINATED);
    }

    getY(): number{
        return this.isNPC ? this.position.y : -this.position.y;
    }

    move(){
        let thisTime = new Date().getTime();
        if (this.isNPC) {
            if (this.alive && !this.isolated && !this._keepStill){
                if (thisTime - this.lastChangeOfDirection > 500){
                    switch(Math.ceil(Math.random()*5)){//Change direction
                        case 1:
                            this.dirInputs.up = !this.dirInputs.up;
                            break;
                        case 2:
                            this.dirInputs.down = !this.dirInputs.down;
                            break;
                        case 3:
                            this.dirInputs.left = !this.dirInputs.left;
                            break;
                        case 4:
                            this.dirInputs.right = !this.dirInputs.right;
                            break;
                        case 5:
                            this.dirInputs.sprint = !this.dirInputs.sprint;
                            break;
                    }            
                    this.lastChangeOfDirection = thisTime;
                }
                this.dirInputs.getWalkDirFromInput(this.walkDir, true);
                this.position.translate(this.walkDir);
                this.gameComponent.gridManager.addElf(this);
            }else if (this.isolate &&  thisTime - this.timeIsolated > TIME_TO_BE_ISOLATED){
                this.isolated = false;
            }
            if (this.ill){
                if (thisTime - this.timeInfected > INFECTION_LIFETIME){
                    if (Math.ceil(Math.random()*100)<=5) {
                        //5% change of death
                        this.kill();
                    }
                    this.ill = false;
                }else if(!this.isolated){
                    //See if anyone is in contact range
                    let elf = this.gameComponent.gridManager.findFirstImpactedElf(this.position, 50, [this]);
                    //Invoke contacted method
                    elf?.contactMade();

                }
            }
        }
        
        let footprintRequired = false;
        //If there is a footprint existing
        if (!this.walkDir.isZero()){
            this.lookDir = this.walkDir.getLookDir();
            if (this.footprints.length > 0){
                let lastFootprint = this.footprints[this.footprints.length-1];
                footprintRequired = thisTime - lastFootprint.generatedTime > TIME_BETWEEN_STEPS;
            }else{
                footprintRequired = true;
            }
        }
        if (footprintRequired){
            let pos = this.position;
            this.footprints.push(new Footprint(this, new Vector2d(pos.x + (this.stepOffset ? 20 : -20), pos.y + 70)));
            this.stepOffset = !this.stepOffset;
        }
    }

    /*clearBackground(){
        if (!this.isNPC){//Main character
            this.gameComponent.background.drawElfRect(-this.elfImage.width/4, -this.elfImage.height/4, this.elfImage.width/2, this.elfImage.height/2);
        }else{
            this.gameComponent.background.drawElfRect(this.gameComponent.pos.x-this.elfImage.width/4+this.position.x, this.gameComponent.pos.y-this.elfImage.height/4+this.position.y, this.elfImage.width/2, this.elfImage.height/2);
        }
    }*/

    contactMade() {
        if (this.contactedIllElf == false && !this.vacinated && this.ill == false){
            this.contactedIllElf = true;
            this.timeContacted = new Date().getTime();
        }
    }

    infect() {
        this.ill = true;
        this.timeInfected = new Date().getTime();
        this.gameComponent.infected++;
    }

    recover() {
        this.ill = false;
        this.gameComponent.infected--;
        this.vacinate();
    }

    kill() {
        if (this.ill){
            this.ill = false;
            this.gameComponent.infected--;
        }
        this.walkDir.set(0,0);
        this.alive = false;
    }

    isolate() {
        this.isolated = true;
        this.walkDir.set(0,0);
        this.timeIsolated = new Date().getTime();
    }

    vacinate() {
        if (this.vacinated == false){        
            this.vacinated = true;
            this.gameComponent.vacinated++;
        }
    }

    despawn() {
        this.gameComponent.removeElf(this);
    }

    render(){
        let lookDirX = this.lookDir.x;
        let sprinting = this.dirInputs.sprint;
        let facingDirection = Math.sign(lookDirX);
        facingDirection = facingDirection == 0 || this.isolated ? 1 : facingDirection;
        
        for (let fIndex = 0; fIndex < this.footprints.length; fIndex++) {
            let footprint = this.footprints[fIndex];
            footprint.draw()
        }
        
        let destX = 0;
        let destY = 0;
        let srcX = 0;
        let srcY = 0;
        let srcWidth = this.frameWidth;
        let srcHeight = this.frameHeight;
        let destWidth = this.idleFrontImage.width/2*facingDirection;
        let destHeight = this.idleFrontImage.height/2;

        if (this.walkDir.isZero()){
            //Idle;
            if (this.isolated){
                this.currentImage = this.icedImage;
                srcWidth = this.icedImage.width;
                srcHeight = this.icedImage.height;
                destWidth = this.icedImage.width/2;
                destHeight = this.icedImage.height/2;
            } else if (!this.alive) {
                this.currentImage = this.deadImage;
                srcWidth = this.deadImage.width;
                srcHeight = this.deadImage.height; 
                destWidth = this.deadImage.width/2;
                destHeight = this.deadImage.height/2;
            } else if (this.lookDir.isZero() || this.lookDir.y == 1) {
                this.currentImage = this.idleFrontImage;
            }else if (this.lookDir.y == -1){
                this.currentImage = this.idleBackImage;
            }else{
                this.currentImage = this.idleSideImage;
            }
            srcY = 0;
            this.currentFrame = 0;
        }else{
            //Walking,
            //Work out which directions animation to use
            let headingSideways = false;
            let directionChanged: boolean = false;
            if (this.walkDir.x != 0){//Left/Right animation
                headingSideways = true;
                directionChanged = this.currentImage != this.sideWalkImage;
                this.currentImage = this.sideWalkImage;
            }else if (this.walkDir.y < 0){
                this.currentImage = this.backWalkimage;
            }else{
                this.currentImage = this.frontWalkImage
            }
            this.holdFrame = sprinting ? false : !this.holdFrame;
            this.currentFrame =  directionChanged ? 0 : this.currentFrame;
            srcY = this.currentFrame * this.frameHeight;
            let noOfWalkingFrames = headingSideways ? NO_OF_SIDE_WALK_FRAMES : NO_OF_FRONT_WALK_FRAMES;
            this.currentFrame = (this.currentFrame+(this.holdFrame?0:1))%noOfWalkingFrames;
        }

        if (this.isNPC) {
            destX = (this.position.x-this.gameComponent.pos.x)*facingDirection;
            destY = this.position.y-this.gameComponent.pos.y;
        }

        //console.log(srcImage, srcX, srcY, this.frameWidth, this.frameHeight, destX, destY, destHeight, destHeight)
        this.gameComponent.context.setTransform(1,0,0,1,0,0);
        this.gameComponent.context.translate(Math.floor(this.gameComponent.myCanvas.nativeElement.width / 2-srcWidth/4), Math.floor(this.gameComponent.myCanvas.nativeElement.height / 2-srcHeight/4));
        this.gameComponent.context.scale(facingDirection, 1);
        this.gameComponent.context.drawImage(
            this.currentImage,
            srcX,
            srcY,
            srcWidth,
            srcHeight,
            destX,
            destY,
            destWidth,
            destHeight);

        //Draw token if required
        if (this.ill) {
            this.gameComponent.context.drawImage(
                this.illTokenImage,
                destX + this.currentImage.width/4*facingDirection - this.illTokenImage.width/2,
                destY - 50
            )
        }

        if (this.vacinated) {
            this.gameComponent.context.drawImage(
                this.vacinatedTokenImage,
                destX + this.currentImage.width/4*facingDirection - this.vacinatedTokenImage.width/2,
                destY - 50
            )
        }
        this.gameComponent.context.scale(facingDirection, 1);
        this.gameComponent.context.fillStyle = `rgba(0, 0, 0)`;
        if (this.isNPC) {
            destX *= facingDirection;// += this.gameComponent.myCanvas.nativeElement.width/2;
        }
        this.gameComponent.context.fillText(`${this.id} - ${this.position.toString()}`, destX, destY);
        this.gameComponent.context.fillText(`${destX} ${destY}`, destX, destY+20);
        this.gameComponent.context.fillText(`${this.gameComponent.gridManager.getCellFromElf(this)?.coord.toString()}`, destX, destY+40);
    }
}