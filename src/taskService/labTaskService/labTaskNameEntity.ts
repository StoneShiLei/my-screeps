import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { LabActionName, LabRegName } from "./labTaskAction";

export class LabTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: LabActionName;
    regName?: LabRegName;
    unregName?: LabRegName;

    constructor(actionName?:LabActionName,regName?:LabRegName,unregName?:LabRegName){
        super()
        this.serviceName = "labTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
