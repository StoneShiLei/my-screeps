import { roomManagerCallbacks } from "manager";
import { BaseManager } from "manager/BaseManager";
import { Singleton } from "typescript-ioc";
import { ErrorHelper } from "utils/erroHelper";

@Singleton
export class CreepManager extends BaseManager{
    tickStart(): void {
        //清除缓存 同时更新room的creeps列表
        const creeps:{[roomName in string]:Creep[]} = {}
        for(let name in Memory.creeps){
            if(!Game.creeps[name]){
                delete Memory.creeps[name]
            }
            else{
                const roomName = Memory.creeps[name].roomName

                if(roomName){
                    if(!creeps[roomName]) creeps[roomName] = []
                    creeps[roomName].push(Game.creeps[name])
                }
            }
        }

        _.keys(creeps).forEach(roomName =>{
            const room = Game.rooms[roomName]
            if(room){
                room.setCreeps(creeps[roomName])
            }
        })
    }
    tickEnd(): void {

    }
    run(target: Creep): void {
        const creep = target;
        ErrorHelper.catchError(()=>creep.doWorkWithTopTask(),creep.name)
    }

}
