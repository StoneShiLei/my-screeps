import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { ClaimActionName, ClaimRegName } from "./claimTaskAction";

export class ClaimTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: ClaimActionName;
    regName?: ClaimRegName;
    unregName?: ClaimRegName;

    constructor(actionName?:ClaimActionName,regName?:ClaimRegName,unregName?:ClaimRegName){
        super()
        this.serviceName = "claimTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
