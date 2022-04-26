import { BaseTaskAction } from "taskService/baseTaskAction";
import { TaskHelper } from "taskService/taskHelper";
import { Singleton } from "typescript-ioc";
import Utils from "utils/utils";

export type DefenseActionName = 'lowLevelDefense'
export type DefenseRegName = ''

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
}
