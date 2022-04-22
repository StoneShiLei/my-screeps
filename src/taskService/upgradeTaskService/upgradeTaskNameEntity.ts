import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { UpgradeActionName, UpgradeRegName } from "./upgradeTaskAction";

export class UpgradeTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: UpgradeActionName;
    regName?: UpgradeRegName;
    unregName?: UpgradeRegName;

    constructor(actionName?:UpgradeActionName,regName?:UpgradeRegName,unregName?:UpgradeRegName){
        super()
        this.serviceName = "upgradeTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
