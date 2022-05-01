import { BaseTaskAction } from "taskService/baseTaskAction";
import { DefenseTaskService } from "taskService/defenseTaskService/defenseTaskService";
import { Container, Singleton } from "typescript-ioc";

export type WorkActionName = 'buildConst' | 'repairStructure'
export type WorkRegName = 'func31'


@Singleton
export class WorkTaskAction extends BaseTaskAction {

    buildConst(creep:Creep){
        const target = creep.topTarget as ConstructionSite
        const task = creep.topTask

        if(!target || creep.storeIsEmpty()) {
            creep.popTopTask()
        }

        const result = creep.build(target)

        //造完建筑之后看下是不是rampart，是的话更新房间wall信息
        if(!target){
            const structures = new RoomPosition(task.x,task.y,task.roomName).lookFor(LOOK_STRUCTURES)
            if(structures.length > 0){
                const rampart = structures?.filter(s => s.structureType == STRUCTURE_RAMPART)?.head()
                if(rampart){
                    const service = Container.get(DefenseTaskService)
                    service.update(creep.room)
                }
            }
        }

        if(result === ERR_NOT_OWNER){
            creep.popTopTask()
        }

        if(result === ERR_NOT_IN_RANGE) creep.goTo(target)
    }
}
