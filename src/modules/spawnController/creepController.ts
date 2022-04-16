import { creepRoleConfigs } from "role"
import Utils from "utils/utils"
import SpawnTask from "./spawnTask"


export default class creepController{

    static run():void{
        if(Object.keys(Memory.creeps || {}).length === Object.keys(Game.creeps).length) return

        for(const name in Memory.creeps){
            if(name in Game.creeps) continue


            if(Object.keys(Memory.creeps[name]).length <= 0){
                delete Memory.creeps[name]
                continue
            }

            const creepMemory = Memory.creeps[name]

            this.handleNotExistCreep(name,creepMemory)
        }
    }

    static handleNotExistCreep(creepName:string,creepMemory:CreepMemory){
        const {spawnRoom:spawnRoomName,data,role,cantRespawn} = creepMemory

        if(cantRespawn){
            Utils.log(`死亡 ${creepName} 被禁止孵化, 已删除`, [ 'creepController' ])
            delete Memory.creeps[creepName]
            return
        }

        const spawnRoom = Game.rooms[spawnRoomName]
        if(!spawnRoom){
            Utils.log(`死亡 ${creepName} 未找到 ${spawnRoomName}, 已删除`, [ 'creepController' ])
            delete Memory.creeps[creepName]
            return
        }

        const creepWorkConfig = creepRoleConfigs[role]
        if(creepWorkConfig.keepAlive && !creepWorkConfig.keepAlive(spawnRoom,creepMemory)){
            delete Memory[creepName]
            return
        }

        const result = spawnRoom.spawnController.addTask(new SpawnTask(creepName,role,data))
        if(result === ERR_NAME_EXISTS) Utils.log(`死亡 ${creepName} 孵化任务已存在`, [ 'creepController' ])

        delete Memory.creeps[creepName]
    }
}
