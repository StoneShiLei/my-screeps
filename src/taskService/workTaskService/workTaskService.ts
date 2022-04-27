import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Inject, Singleton } from "typescript-ioc";
import { WorkTaskNameEntity } from "./workTaskNameEntity";
import { WorkTaskAction } from "./workTaskAction";


@Singleton
export class WorkTaskService extends BaseTaskService{

    @Inject
    actions!: WorkTaskAction;

    genBuildTask(creep:Creep):Task[]{
        const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
        if(!target) return []

        return [TaskHelper.genTaskWithTarget(target,new WorkTaskNameEntity("buildConst"))]
    }
}
