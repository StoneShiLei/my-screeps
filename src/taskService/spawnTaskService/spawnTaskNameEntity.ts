import { ServiceName, ActionName, RegName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { SpawnActionName, SpawnRegName } from "./spawnTaskAction";

export class SpawnTaskNameEntity extends BaseTaskNameEntity{
    serviceName: ServiceName;
    actionName?: SpawnActionName;
    regName?: SpawnRegName;
    unregName?: SpawnRegName;

    constructor(actionName?:SpawnActionName,regName?:SpawnRegName,unregName?:SpawnRegName){
        super()
        this.serviceName = "spawnTaskService",
        this.actionName = actionName
        this.regName = regName
        this.unregName = unregName
    }
}
