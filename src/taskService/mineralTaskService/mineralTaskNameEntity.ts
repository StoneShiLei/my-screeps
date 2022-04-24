import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { MineralActionName, MineralRegName } from "./mineralTaskAction";

export class MineralTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: MineralActionName;
    regName?: MineralRegName;
    unregName?: MineralRegName;

    constructor(actionName?:MineralActionName,regName?:MineralRegName,unregName?:MineralRegName){
        super()
        this.serviceName = "mineralTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
