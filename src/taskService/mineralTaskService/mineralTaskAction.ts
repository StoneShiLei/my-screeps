import { BaseRegName, BaseTaskAction } from "taskService/baseTaskAction";
import { SpawnTaskNameEntity } from "taskService/spawnTaskService/spawnTaskNameEntity";
import { TaskHelper } from "taskService/taskHelper";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";
import { Singleton } from "typescript-ioc";
import { MineralTaskNameEntity } from "./mineralTaskNameEntity";

export type MineralActionName = 'harvestMineralKeeper' | 'updateMineralInfo'
export type MineralRegName = BaseRegName | 'registerMineral'

@Singleton
export class MineralTaskAction extends BaseTaskAction {

    updateMineralInfo(creep:Creep){
        const map = creep.room.memory.serviceDataMap.mineralTaskService
        if(!map) return
        const data = map[STRUCTURE_EXTRACTOR]
        if(!data) return

        if(!creep.memory._concated){
            creep.memory._concated = true
            data.spawnTime = data.spawnTime || 0
            data.spawnTime -= Game.time - data.spawnTime - 10
            map[STRUCTURE_EXTRACTOR] = data
            creep.room.memory.serviceDataMap.mineralTaskService = map
        }
        creep.popTopTask()
        creep.doWorkWithTopTask()
    }

    registerMineral(creep:Creep){
        const map = creep.room.memory.serviceDataMap.mineralTaskService
        if(!map) return
        const data = map[STRUCTURE_EXTRACTOR]
        if(!data) return

        if(creep.spawning) data.spawnTime = Game.time - Math.ceil(creep.body.length * 3 / 2) //因为 后面计算的时候又减少一遍了，所以除以2

        data.creeps = data.creeps || []
        if(!_.include(data.creeps,creep.id)) data.creeps.push(creep.id)

        map[STRUCTURE_EXTRACTOR] = data
        creep.room.memory.serviceDataMap.mineralTaskService = map
    }

    harvestMineralKeeper(creep:Creep){
        const task = creep.topTask
        if(task.roomName != creep.room.name) {
            creep.goTo(task)
            return
        }
        const mineral = creep.topTarget as Mineral
        if(!mineral) return
        const map = creep.room.memory.serviceDataMap.mineralTaskService
        if(!map) return
        const data = map[STRUCTURE_EXTRACTOR]
        if(!data) return

        const container = data.containerId ? Game.getObjectById<StructureContainer>(data.containerId):undefined
        if(!container) return

        if(!container.pos.isEqualTo(creep)){
            creep.addTask(TaskHelper.genTaskWithTarget(container,new MineralTaskNameEntity("updateMineralInfo")))
            creep.addTask(TaskHelper.genTaskWithTarget(container,new TransportTaskNameEntity("goToAndPopTask")))
            creep.doWorkWithTopTask()
        }

        if(creep.ticksToLive && creep.ticksToLive % 6 === 0){
            if(data.type && container.store.getFreeCapacity(data.type as ResourceConstant) > 80){
                if(mineral.mineralAmount == 0){
                    if(creep.ticksToLive > 600){
                        creep.popTopTask()
                        .addTask(TaskHelper.genTaskWithAnyData(new SpawnTaskNameEntity("recycleCreep")))
                        .doWorkWithTopTask()
                    }
                    else{
                        creep.suicide()
                    }
                }
                creep.harvest(mineral)
            }
        }
    }
}
