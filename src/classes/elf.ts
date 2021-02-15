import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { Footprint } from "./footprints";
import { InputDirections } from "./inputDirection";
import { TrackableObject, TrackableObjectType } from "./TrackableObject";
import { Vector2d } from "./vector2d";
import * as config from "../config.json";
import { ElfHealthState } from "src/models/ElfHealthState";
import { ImageRef } from "src/models/ImageRef";

const NO_OF_SIDE_WALK_FRAMES = 17;
const NO_OF_FRONT_WALK_FRAMES = 8;
const WALKSPEED = 50;//IN PIXELS PER SECOND
const ANIMATIONSPEED = 12;//IN FRAMES PER SECOND
const TIME_BETWEEN_STEPS: number = 200;
const TIME_TO_BE_ISOLATED: number = 10000;
const INFECTION_LIFETIME: number = 30000;
var noOfElvesSpawned: number = 0;

export class Elf extends TrackableObject {
    healthState: ElfHealthState;
    isolated: boolean = false;
    contactedIllElf: boolean = false;
    _keepStill: boolean = false;

    isNPC: boolean = false;

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
    timeSpawned: number;
    lastChangeOfDirection: number = new Date().getTime();//Property for NPC roaming
    footprints: Footprint[] = [];
    gameComponent: GameCanvasComponent;
    currentFrame: number = 0;
    holdFrame: boolean = false;//Used to half the walk rate when walking

    frameHeight: number = 260;
    frameWidth: number = 180;
    stepOffset: boolean = false; //Used to alternate footprint positions

    lastShotMade: number = 0;

    constructor(gameComponent: GameCanvasComponent, npc: boolean = false, position: Vector2d = new Vector2d(), healthState=ElfHealthState.NOT_VACINATED, keepStill=false){
        super(position, TrackableObjectType.Elf);
        this.id = noOfElvesSpawned++;
        let assetManager = gameComponent.assetManager;
        this.gameComponent = gameComponent;
        this.isNPC = npc;
        this.icedImage = assetManager.getImage(ImageRef.NPC_ICED);
        this.healthState = healthState;
        this._keepStill = keepStill;
        this.timeSpawned = new Date().getTime();
        if (healthState == ElfHealthState.INFECTED){
            this.timeInfected = this.timeSpawned; 
        }
        if (!npc){
            this.idleFrontImage = assetManager.getImage(ImageRef.MAIN_IDLE_FRONT);
            this.idleBackImage = assetManager.getImage(ImageRef.MAIN_IDLE_BACK);
            this.idleSideImage = assetManager.getImage(ImageRef.MAIN_IDLE_SIDE);
            this.sideWalkImage = assetManager.getImage(ImageRef.MAIN_SIDE_WALK_CYCLE);
            this.frontWalkImage = assetManager.getImage(ImageRef.MAIN_FRONT_WALK_CYCLE);
            this.backWalkimage = assetManager.getImage(ImageRef.MAIN_BACK_WALK_CYCLE);
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
        return this.gPos.y;
    }

    move(){
        let thisTime = new Date().getTime();
        if (this.isNPC) {
            if (this.healthState != ElfHealthState.DEAD && !this.isolated && !this._keepStill){
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
                this.gPos.translate(this.walkDir);
                this.gameComponent.gridManager.addObject(this);
            }else if (this.isolate &&  thisTime - this.timeIsolated > TIME_TO_BE_ISOLATED){
                this.isolated = false;
            }
            if (this.healthState == ElfHealthState.INFECTED){
                if (thisTime - this.timeInfected > INFECTION_LIFETIME){
                    if (Math.ceil(Math.random()*100)<=33) {
                        //5% change of death
                        this.kill();
                    }
                    this.recover();
                }else if(!this.isolated){
                    //See if anyone is in contact range
                    let elf = this.gameComponent.gridManager.findFirstImpactedElf(this.gPos, 150, [this]);
                    //Invoke contacted method
                    elf?.contactMade();

                }
            }
        } else {
            this.gPos.translate(this.walkDir);
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
            let pos = this.gPos;
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

    isElfVulnerable() : boolean { 
        return (this.healthState == ElfHealthState.NOT_VACINATED)
    }

    contactMade() {
        if (this.contactedIllElf == false && this.isElfVulnerable()){
            this.contactedIllElf = true;
            this.timeContacted = new Date().getTime();
        }
    }

    infect() {
        this.healthState = ElfHealthState.INFECTED;
        this.timeInfected = new Date().getTime();
        this.gameComponent.gameStateManager.newElfInfection();
    }

    recover() {
        this.healthState = ElfHealthState.RECOVERED;
        this.gameComponent.gameStateManager.newElfRecovery();
    }

    kill() {
        if (this.healthState == ElfHealthState.INFECTED){
            this.healthState = ElfHealthState.DEAD;
            this.gameComponent.gameStateManager.illElfDied();
        }
        this.walkDir.set(0,0);
    }

    isolate() {
        this.isolated = true;
        this.walkDir.set(0,0);
        this.timeIsolated = new Date().getTime();
    }

    vacinate() {
        if (this.healthState == ElfHealthState.NOT_VACINATED){        
            this.healthState = ElfHealthState.VACINATED;
            this.gameComponent.gameStateManager.newElfVacination();
        }
    }

    despawn() {
        this.gameComponent.removeElf(this);//This method updates the gamestate
    }

    render(){
        let lookDirX = this.lookDir.x;
        let sprinting = this.dirInputs.sprint;
        let facingDirection = Math.sign(lookDirX);
        facingDirection = facingDirection == 0 || (this.isolated || this.healthState == ElfHealthState.DEAD) ? 1 : facingDirection;        
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
            } else if (this.healthState == ElfHealthState.DEAD) {
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
            destX = (this.gPos.x-this.gameComponent.mainElf.gPos.x)*facingDirection;
            destY = this.gPos.y-this.gameComponent.mainElf.gPos.y;
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
        if (this.healthState == ElfHealthState.INFECTED) {
            this.gameComponent.context.drawImage(
                this.illTokenImage,
                destX + this.currentImage.width/4*facingDirection - this.illTokenImage.width/2,
                destY - 50
            )
        }

        if (this.healthState == ElfHealthState.VACINATED || this.healthState == ElfHealthState.RECOVERED) {
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
        if (config.SHOW_ELF_DEBUG_INFO){
            this.gameComponent.context.fillText(`${this.id} - ${this.gPos.toString()}`, destX, destY);
            this.gameComponent.context.fillText(`${destX} ${destY}`, destX, destY+20);
            this.gameComponent.context.fillText(`${this.gameComponent.gridManager.getCellFromObject(this)?.coord.toString()}`, destX, destY+40);
            this.gameComponent.context.fillText(this.getStringFromHealthState(this.healthState), destX, destY+60);
            this.gameComponent.context.fillText(`Contact made: ${this.contactedIllElf}`, destX, destY+80)
        }
    }

    getStringFromHealthState(state: ElfHealthState): string{
        switch(state){
            case ElfHealthState.NOT_VACINATED:
                return "Healthy";
            case ElfHealthState.INFECTED:
                return `Infected - ${this.timeInfected}`;
            case ElfHealthState.DEAD:
                return "Dead";
            case ElfHealthState.RECOVERED:
                return "Recovered";
            case ElfHealthState.VACINATED:
                return "Vacinated";
        }
    }
}