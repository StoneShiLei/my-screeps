import { StructMap } from "autoPlanner63";

declare global {
    export interface RoomMemory {
        structMap:StructMap
    }

    export interface Room{
        _construct_builed:number
    }
}


