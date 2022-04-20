import { Inject, Singleton } from "typescript-ioc";
import { SpawnActionName, SpawnTaskAction } from "./spawnTaskService/spawnTaskAction";
import { SpawnTaskService } from "./spawnTaskService/spawnTaskService";
import { TransportActionName, TransportTaskAction } from "./transportTaskService/transportTaskAction";
import { TransportTaskService } from "./transportTaskService/transportTaskService";
import { UpgradeActionName, UpgradeTaskAction } from "./upgradeTaskService/upgradeTaskAction";
import { UpgradeTaskService } from "./upgradeTaskService/upgradeTaskService";
import { WorkActionName, WorkTaskAction } from "./workTaskService/workTaskAction";
import { WorkTaskService } from "./workTaskService/workTaskService";


@Singleton
export class TaskServiceProxy {

    @Inject
    spawnTaskService!:SpawnTaskService;

    @Inject
    workTaskService!:WorkTaskService;

    @Inject
    transportTaskService!:TransportTaskService

    @Inject
    upgradeTaskService!:UpgradeTaskService

}

export type TaskService = SpawnTaskService | WorkTaskService | TransportTaskService | UpgradeTaskService
export type TaskAction = SpawnTaskAction | WorkTaskAction | TransportTaskAction | UpgradeTaskAction

export type ServiceName = "spawnTaskService" | "workTaskService" | "transportTaskService" | "upgradeTaskService"
export type ActionName = SpawnActionName | WorkActionName | TransportActionName | UpgradeActionName

