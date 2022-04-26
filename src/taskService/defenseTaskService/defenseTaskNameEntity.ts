import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { DefenseActionName, DefenseRegName } from "./defenseTaskAction";

export class DefenseTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: DefenseActionName;
    regName?: DefenseRegName;
    unregName?: DefenseRegName;

    constructor(actionName?:DefenseActionName,regName?:DefenseRegName,unregName?:DefenseRegName){
        super()
        this.serviceName = "defenseTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
