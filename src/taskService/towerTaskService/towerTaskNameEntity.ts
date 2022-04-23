import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { TowerActionName, TowerRegName } from "./towerTaskAction";

export class TowerTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: TowerActionName;
    regName?: TowerRegName;
    unregName?: TowerRegName;

    constructor(actionName?:TowerActionName,regName?:TowerRegName,unregName?:TowerRegName){
        super()
        this.serviceName = "towerTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
