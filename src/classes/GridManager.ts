import { GameCanvasComponent } from "src/app/game-canvas/game-canvas.component";
import { Elf } from "./elf";
import { RefillStation } from "./refillStation";
import { TrackableObject, TrackableObjectType } from "./TrackableObject";
import { Vector2d } from "./vector2d";

//This class defines a grid which will be used to separate elfs on map into sections 
const CELLS_X: number = 8;
const CELLS_Y: number = 8 

export class GridCell {
    coord: Vector2d;
    objects: TrackableObject[];

    constructor(coord: Vector2d, objects: TrackableObject[] = []) {
        this.coord = coord;
        this.objects = objects;
    }
}

export class GridManager {
    grid: GridCell[] = [];
    cellSize: Vector2d;
    gameCanvas: GameCanvasComponent;
    width: number;
    height: number;
    canvasOffset: Vector2d;

    constructor(gameCanvas: GameCanvasComponent)
    {
        this.gameCanvas = gameCanvas;        
        this.width = this.gameCanvas.myCanvas.nativeElement.width;
        this.height = this.gameCanvas.myCanvas.nativeElement.height;
        this.canvasOffset = new Vector2d(-this.width/2,-this.height/2);
        this.newGrid();
    }

    newGrid(){
        for (let y = -1; y < CELLS_Y+1; y++){
            for (let x = -1; x < CELLS_X+1; x++){
                this.grid.push(new GridCell(new Vector2d(x, y)));
            }
        }
        let x = this.width / CELLS_X;
        let y = this.height / CELLS_Y;
        this.cellSize = new Vector2d(x,y);
    }

    getCell(coords: Vector2d): GridCell{
        if (coords == null){
            return null;
        }
        let gridCell: GridCell = this.grid.find(gc=>gc.coord.x == coords.x && gc.coord.y == coords.y);
        if (gridCell != null) {
            return gridCell;
        } else {
            return null;
        }
    }

    /**
     * @deprecated The method should not be used
     */
    getElvesFromCell(coords: Vector2d): TrackableObject[]{
        let gridCell: GridCell = this.getCell(coords);
        if (gridCell == null){
            return [];
        }
        return gridCell.objects.filter(x => x.type == TrackableObjectType.Elf);
    }
    
    /**
     * @deprecated The method should not be used
     */
    getStationsFromCell(coords: Vector2d): TrackableObject[]{
        let gridCell: GridCell = this.getCell(coords);
        if (gridCell == null){
            return [];
        }
        return gridCell.objects.filter(x => x.type == TrackableObjectType.Elf);
    }

    getObjectsFromCell(coords: Vector2d, type: TrackableObjectType): TrackableObject[]{
        let gridCell: GridCell = this.getCell(coords);
        if (gridCell == null){
            return [];
        }
        return gridCell.objects.filter(x => x.type == type);
    }

    getCellFromObject(object: TrackableObject): GridCell{
        for (let gridIndex = 0; gridIndex < this.grid.length; gridIndex++){
            let gridCell = this.grid[gridIndex];
            if (gridCell.objects.indexOf(object) >= 0){
                return gridCell;
            }
        }
        return null;
    }

    clearGrid() {
        this.grid = [];
        this.newGrid();
    }
    
    getRelativePositionFromPosition(position: Vector2d): Vector2d {
        //Would usually inverse the gameCanvas pos, but it's already unintentially inversed
        return position.add(this.gameCanvas.mainElf.gPos.getInverse()).add(this.canvasOffset.getInverse());
    }

    getCoordsFromPosition(position: Vector2d): Vector2d {
        let relativePos = this.getRelativePositionFromPosition(position);
        //console.log(`MainPos: ${this.gameCanvas.pos}; Position: ${position}; Relative: ${relativePos}; CanvasOffset: ${this.canvasOffset}; Width: ${this.width}; Height: ${this.height}`);//Print out the offset too
        return this.getCoordsFromRelativePosition(relativePos);
    }

    getCoordsFromRelativePosition(relativePos: Vector2d): Vector2d {
        let X = Math.floor(relativePos.x/this.cellSize.x);
        let Y = Math.floor(relativePos.y/this.cellSize.y);
        if (X < -1 || X > CELLS_X +1 || Y < -1 || Y > CELLS_Y + 1){
            return null;
        }
        return new Vector2d(X, Y);
    }

    addObject(object: TrackableObject) {
        let theseCoords: Vector2d = this.getCoordsFromPosition(object.gPos);
        if (theseCoords){//Null if position is invalid
            let gridCell: GridCell = this.getCell(theseCoords);
            if (gridCell != null){
                gridCell.objects.push(object);
            }else{
                //Invalid position. Despawning
                this.gameCanvas.despawnObject(object);
            }
        }      
    }

    isStationInViewport(station: RefillStation): boolean {
        let theseCoords: Vector2d = this.getCoordsFromPosition(station.gPos);
        if (theseCoords) {
            let gridCell: GridCell = this.getCell(theseCoords);
            return gridCell != null;
        }
        return false;
    }

    //Elfs of interest
    searchByRadius(position: Vector2d, radius: number, objectType: TrackableObjectType): TrackableObject[] {
        let relativePos: Vector2d = this.getRelativePositionFromPosition(position);
        let coords: Vector2d = this.getCoordsFromRelativePosition(relativePos);
        if (coords == null){
            return [];
        }
        let elvesToReturn: TrackableObject[] = this.getObjectsFromCell(coords, objectType);
        let includeLeftCell = relativePos.x % this.cellSize.x < radius;
        let includeRightCell = -relativePos.x % this.cellSize.x > radius;
        let includeTopCell = relativePos.y % this.cellSize.y < radius;
        let includeBottomCell = -relativePos.y % this.cellSize.y > radius;
        if (includeLeftCell){
            elvesToReturn = elvesToReturn.concat(this.getObjectsFromCell(coords.add(new Vector2d(-1,0)), objectType));
        }
        if (includeRightCell){
            elvesToReturn = elvesToReturn.concat(this.getObjectsFromCell(coords.add(new Vector2d(1,0)), objectType));
        }
        if (includeTopCell){
            elvesToReturn = elvesToReturn.concat(this.getObjectsFromCell(coords.add(new Vector2d(0,-1)), objectType));
        }
        if (includeBottomCell){
            elvesToReturn = elvesToReturn.concat(this.getObjectsFromCell(coords.add(new Vector2d(0,1)), objectType));
        }
        if (includeTopCell && includeLeftCell){
            elvesToReturn = elvesToReturn.concat(this.getObjectsFromCell(coords.add(new Vector2d(-1,-1)), objectType));
        }
        if (includeTopCell && includeRightCell){
            elvesToReturn = elvesToReturn.concat(this.getObjectsFromCell(coords.add(new Vector2d(1,1)), objectType));
        }
        if (includeBottomCell && includeLeftCell){
            elvesToReturn = elvesToReturn.concat(this.getObjectsFromCell(coords.add(new Vector2d(-1,1)), objectType));
        }
        if (includeBottomCell && includeRightCell){
            elvesToReturn = elvesToReturn.concat(this.getObjectsFromCell(coords.add(new Vector2d(1,1)), objectType));
        }
        return elvesToReturn;
    }

    findFirstImpactedElf(globalPosition: Vector2d, radius: number, ignore: TrackableObject[]): Elf{
        let relevantElves: TrackableObject[] = this.searchByRadius(globalPosition, radius, TrackableObjectType.Elf);
        for (let eIndex = 0; eIndex < relevantElves.length; eIndex++){
            let thisElf: TrackableObject = relevantElves[eIndex];
            if (ignore.indexOf(thisElf) >= 0){//Blacklsted elf
                continue;
            }
            let diff = thisElf.gPos.add(globalPosition.getInverse()).getAbsolute();
            if (diff.x <= radius && diff.y <= radius){
                return thisElf as Elf;
            }
        }
        return null;
    }

    getRandomSpawnLocation(): Vector2d {
        let spawnXIndex: number;
        let spawnYIndex: number;
        let spawnOrigin: number =Math.floor(Math.random() * 4); 
        switch (spawnOrigin){
            case (0):{//Spawn top
                spawnYIndex = -1;
                spawnXIndex = Math.floor(Math.random() * CELLS_X);
                break;
            };
            case (1):{//Spawn right
                spawnXIndex = CELLS_X+1;
                spawnYIndex = Math.floor(Math.random() * CELLS_X); 
                break;
            };
            case (2):{//Spawn bottom
                spawnYIndex = CELLS_Y+1;
                spawnXIndex = Math.floor(Math.random() * CELLS_X);
                break;
            }
            case (3):{//Spawn left
                spawnXIndex = -1;
                spawnYIndex = Math.floor(Math.random() * CELLS_X);
                break;
            }
        }
        spawnXIndex -= CELLS_X/2;
        spawnYIndex -= CELLS_Y/2;
        let mainPos = this.gameCanvas.mainElf.gPos;
        let relativePos = new Vector2d(this.cellSize.x * spawnXIndex, this.cellSize.y * spawnYIndex);
        let newRandomLocation = mainPos.add(relativePos);
        return newRandomLocation;
    }
}