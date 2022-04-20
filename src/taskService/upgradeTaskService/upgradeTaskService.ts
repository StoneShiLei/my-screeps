import { BaseTaskService } from "taskService/baseTaskService";
import { Inject, Singleton } from "typescript-ioc";
import { UpgradeTaskAction } from "./upgradeTaskAction";

@Singleton
export class UpgradeTaskService extends BaseTaskService{

    @Inject
    actions!:UpgradeTaskAction





    // registerTask(creep:Creep):void{
    //     console
    // }
}
