import { AppLifecycleCallbacks } from "modules/framework/types"
import Utils from "utils/utils"
import creepController from "./creepController"
import SpawnExtension from "./spawn"
import RoomSpawnController from "./spawnController"
import SpawnTask from "./spawnTask"


export const mountRoomSpawnController = function() {
    Utils.assignPrototype(StructureSpawn,SpawnExtension)

    const controllerStorage:SpawnControllerStorage = {}

    Utils.createGetter(Room,'spawnController',function(this:Room){
        if(!(this.name in controllerStorage)) controllerStorage[this.name] = new RoomSpawnController(this.name)

        return controllerStorage[this.name]
    })
}

export const creepControllerService = function():AppLifecycleCallbacks {
    return {tickStart:()=> creepController.run() }
}

interface SpawnControllerStorage{
    [roomName:string]:RoomSpawnController
}


declare global {
    interface Room {
        spawnController:RoomSpawnController
    }

    interface RoomMemory{
        spawnTaskQueue:SpawnTask[]
    }
}
