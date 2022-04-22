import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { SourceActionName, SourceRegName } from "./sourceTaskAction";

export class SourceTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: SourceActionName;
    regName?: SourceRegName;
    unregName?: SourceRegName;

    constructor(actionName?:SourceActionName,regName?:SourceRegName,unregName?:SourceRegName){
        super()
        this.serviceName = "sourceTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
