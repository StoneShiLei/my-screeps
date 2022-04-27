import { BaseRegName, BaseTaskAction } from "taskService/baseTaskAction";
import { Singleton } from "typescript-ioc";

export type DefenseActionName = 'lowLevelDefense' | 'repairWall'
export type DefenseRegName = BaseRegName


@Singleton
export class DefenseTaskAction extends BaseTaskAction {



    lowLevelDefense(creep:Creep){
        const em = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
        if(em){
            creep.attack(em)
            creep.goTo(em)
            return
        }
        creep.memory.dontPullMe = false
    }

    repairWall(creep:Creep){
        if(creep.store[RESOURCE_ENERGY] == 0){
            creep.popTopTask()
        }

        const target = creep.topTarget as StructureWall | StructureRampart
        if(!target || target.hits >= target.hitsMax){
            creep.popTopTask()
            return
        }

        const result = creep.repair(target)

        if(result == ERR_NOT_IN_RANGE) creep.goTo(target)
        if(creep.ticksToLive && creep.ticksToLive % 3 == 0) creep.memory.dontPullMe = false
    }
}
