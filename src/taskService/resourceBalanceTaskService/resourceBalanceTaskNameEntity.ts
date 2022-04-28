import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { ResourceBalanceActionName, ResourceBalanceRegName } from "./resourceBalanceTaskAction";


export class ResourceBalanceTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: ResourceBalanceActionName;
    regName?: ResourceBalanceRegName;
    unregName?: ResourceBalanceRegName;

    constructor(actionName?:ResourceBalanceActionName,regName?:ResourceBalanceRegName,unregName?:ResourceBalanceRegName){
        super()
        this.serviceName = "resourceBalanceTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
