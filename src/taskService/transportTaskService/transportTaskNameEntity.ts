import { ServiceName, ActionName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { TransportActionName, TransportRegName } from "./transportTaskAction";

export class TransportTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: TransportActionName;
    regName?: TransportRegName;
    unregName?: TransportRegName;

    constructor(actionName?:TransportActionName,regName?:TransportRegName,unregName?:TransportRegName){
        super()
        this.serviceName = "transportTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
