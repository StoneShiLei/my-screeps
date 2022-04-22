import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Inject } from "typescript-ioc";
import { WorkTaskNameEntity } from "./workTaskNameEntity";
import { WorkTaskAction } from "./workTaskAction";
import { filter } from "lodash";

export class WorkTaskService extends BaseTaskService{

    @Inject
    actions!: WorkTaskAction;

    genBuildTask(creep:Creep):Task[]{
        const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
        if(!target) return []

        return [TaskHelper.genTaskWithTarget(target,new WorkTaskNameEntity("buildConst"))]
    }

    genRepairTask(creep:Creep):Task[]{
        const target = creep.pos.findClosestByPath(FIND_STRUCTURES,
            {filter:s => s.hits < s.hitsMax * 0.9 && s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_WALL})
        if(!target) return []

        return [TaskHelper.genTaskWithTarget(target,new WorkTaskNameEntity("repairStructure"))]
    }
}
