import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Inject, Singleton } from "typescript-ioc";
import { UpgradeTaskAction } from "./upgradeTaskAction";

@Singleton
export class UpgradeTaskService extends BaseTaskService{

    @Inject
    actions!:UpgradeTaskAction

    genUpgradeTask(room:Room):Task[]{
        if(room.controller && room.controller.my){
            return [TaskHelper.genTaskWithTarget(room.controller,"upgradeTaskService","upgrade")]
        }

        return[]
    }
}