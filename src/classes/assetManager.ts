import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { ImageRef } from "src/models/ImageRef";

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
