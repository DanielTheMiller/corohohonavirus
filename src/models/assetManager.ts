import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";

export class AssetManager {
    GameImages: GameImage[];
    loadingCompleteCallback: ()=>void;

    constructor(loadingCompleteCallback:()=>void){
        this.loadingCompleteCallback = loadingCompleteCallback;
        this.GameImages = [];
        this.loadAllImages();
    }

    allImagesLoaded(): boolean{
        for (let imageIndex = 0; imageIndex < this.GameImages.length; imageIndex++){
            let image = this.GameImages[imageIndex];
            if (!image.image.complete) {
                return false;
            }
        }
        return true;
    }

    loadAllImages(): void{
        for (let keyIndex = 0; keyIndex < Object.keys(ImageRef).length; keyIndex++) {
            let thisKey: string = Object.keys(ImageRef)[keyIndex];
            let gameImage: GameImage = new GameImage(ImageRef[thisKey], this.onAssetLoaded);
            this.GameImages.push(gameImage);
        }
    }

    onAssetLoaded = ():void => {
        if (this.GameImages.length == Object.values(ImageRef).length && this.allImagesLoaded()){
           this.loadingCompleteCallback(); 
        }
    }

    getImage(imageRef: ImageRef):HTMLImageElement{
        let gameImage: GameImage = this.GameImages.find(x=>x.imageRef == imageRef);
        return gameImage.image;
    }
}

export class GameImage {
    gameCanvas: GameCanvasComponent;
    image: HTMLImageElement;
    imageRef: ImageRef;

    constructor(ref: ImageRef, callback: ()=>void){
        this.image = new Image();
        this.image.src = ref;
        this.image.onload = ()=>{callback()};
        this.imageRef = ref;
    }
}

export enum ImageRef {
    BULLET = "assets/bullet.png",
    SNOW_BACKDROP = "assets/snowtexture2.jpg",
    SYRINGE = "assets/syringe.png",
    NPC_IDLE_FRONT = "assets/NPCIdle.png",
    NPC_IDLE_SIDE = "assets/NPCIdleSide.png",
    NPC_IDLE_BACK = "assets/NPCIdleBack.png",
    NPC_WALK_CYCLE = "assets/NPCSideWalk.png",
    NPC_FRONT_WALK_CYCLE = "assets/NPCFrontWalk2.png",
    NPC_BACK_WALK_CYCLE = "assets/NPCBackWalk.png",
    NPC_ICED = "assets/elfIce.png",
    NPC_DEAD = "assets/NPCDead.png",
    MAIN_IDLE_FRONT = "assets/MainIdle.png",
    MAIN_IDLE_BACK = "assets/MainIdleBack.png",
    MAIN_IDLE_SIDE = "assets/MainIdleSide.png",
    MAIN_SIDE_WALK_CYCLE = "assets/MainSideWalk.png",
    MAIN_FRONT_WALK_CYCLE = "assets/MainFrontWalk.png",
    MAIN_BACK_WALK_CYCLE = "assets/MainBackWalk.png",
    ICE_CUBE = "assets/iceCube.png",
    TOKEN_VACINATED = "assets/vacinatedToken.png",
    TOKEN_INFECTED = "assets/virusToken.png",
    BULLET_STATION = "assets/BULLET_STATION.png",
    BULLET_STATION_DRY = "assets/BULLET_STATION_DRY.png",
    SNOW_STATION = "assets/SNOWMAN_STATION.png",
    SNOW_DRY = "assets/SNOWMAN_DRY.png",
    VACINE_STATION = "assets/VACINE_STATION.png",
    VACINE_DRY = "assets/VACINE_DRY.png"
}