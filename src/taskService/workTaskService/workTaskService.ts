import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Inject } from "typescript-ioc";
import { WorkTaskAction } from "./workTaskAction";

export class WorkTaskService extends BaseTaskService{

    @Inject
    actions!: WorkTaskAction;

    genBuildTask(creep:Creep):Task[]{
        const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
        if(!target) return []

        return [TaskHelper.genTaskWithTarget(target,"workTaskService","buildConst")]
    }
}
