import { env } from "process"
import Utils from "utils/utils"
import { mountCreep } from "./creep"
import { AppLifecycleCallbacks } from "./framework/types"
import { mountRoom } from "./room"
import mountRoomPosition from "./roomPosition"
import { mountRoomSpawnController } from "./spawnController"
import watchClient from 'watch-client';

const mountAll = function(){
    //挂载room
    mountRoom()
    //挂载position
    mountRoomPosition()
    //挂载creep
    mountCreep()
    //挂载spawn控制器
    mountRoomSpawnController()
}

export const createGlobalExtension = function():AppLifecycleCallbacks{
    mountAll()
    return {
        born:() => {
            const spawns = Object.values(Game.spawns)
            if (spawns.length > 1) return

            Utils.log('游戏初始化完成',['HuLu Bot'],false,'green')
        },
        tickEnd:()=>{
            watchClient();
        }
    }
}

export const roomRunner = function(room:Room):void{
    room.find(FIND_STRUCTURES).forEach(structure => {
        if(structure.onWork) structure.onWork()
    })
}

export const creepRunner = function(creep:Creep):void{
    if(creep.onWork) creep.onWork()
}
