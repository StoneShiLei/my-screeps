import { BaseTaskAction } from "taskService/baseTaskAction";
import { Singleton } from "typescript-ioc";

export type WorkActionName = 'buildConst' | 'repairStructure'
export type WorkRegName = 'func31'

@Singleton
export class WorkTaskAction extends BaseTaskAction {

    buildConst(creep:Creep){
        const target = creep.topTarget as ConstructionSite
        if(!target || creep.storeIsEmpty()) {
            creep.popTopTask()
            creep.doWorkWithTopTask()
        }

        const result = creep.build(target)
        if(result === ERR_NOT_OWNER){
            creep.popTopTask()
            creep.doWorkWithTopTask()
        }

        if(result === ERR_NOT_IN_RANGE) creep.goTo(target)
    }
}
