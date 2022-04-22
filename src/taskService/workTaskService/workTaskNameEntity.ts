import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { WorkActionName, WorkRegName } from "./workTaskAction";

export class WorkTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: WorkActionName;
    regName?: WorkRegName;
    unregName?: WorkRegName;

    constructor(actionName?:WorkActionName,regName?:WorkRegName,unregName?:WorkRegName){
        super()
        this.serviceName = "workTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
