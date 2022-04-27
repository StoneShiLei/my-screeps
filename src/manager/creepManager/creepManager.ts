import { BaseManager } from "manager/BaseManager";
import { Singleton } from "typescript-ioc";
import { ErrorHelper } from "utils/erroHelper";

@Singleton
export class CreepManager extends BaseManager{
    tickStart(): void {

        const creeps:{[roomName in string]:Creep[]} = {}
        for(let name in Memory.creeps){
            if(!Game.creeps[name]){
                //清除缓存
                delete Memory.creeps[name]
            }
            else{
                const roomName = Memory.creeps[name].roomName

                if(roomName){
                    //更新room的creeps列表
                    const creep = Game.creeps[name]
                    if(!creeps[roomName]) creeps[roomName] = []
                    creeps[roomName].push(creep)

                    //调用Service的Register
                    ErrorHelper.catchError(()=>creep.registerMyTasks())
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
        // creep.sayTopTask()
        creep.doWorkWithTopTask()
    }

}
