import { Vector2d } from "./vector2d";

var latestId = 0;

export class TrackableObject {     
    id: number;
    gPos: Vector2d;//GlobalPosition
    type: TrackableObjectType;

    constructor(position: Vector2d, type: TrackableObjectType){
        this.gPos = position;
        this.id = latestId++;
        this.type = type;
    }

    despawn() {
        
    }
}

export enum TrackableObjectType {
    Elf,
    RefillStation
}