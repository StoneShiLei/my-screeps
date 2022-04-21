import { Inject, Singleton } from "typescript-ioc";
import { SourceActionName, SourceRegName, SourceTaskAction } from "./sourceTaskService/sourceTaskAction";
import { SourceTaskService } from "./sourceTaskService/sourceTaskService";
import { SpawnActionName, SpawnRegName, SpawnTaskAction } from "./spawnTaskService/spawnTaskAction";
import { SpawnTaskService } from "./spawnTaskService/spawnTaskService";
import { TransportActionName, TransportRegName, TransportTaskAction } from "./transportTaskService/transportTaskAction";
import { TransportTaskService } from "./transportTaskService/transportTaskService";
import { UpgradeActionName, UpgradeRegName, UpgradeTaskAction } from "./upgradeTaskService/upgradeTaskAction";
import { UpgradeTaskService } from "./upgradeTaskService/upgradeTaskService";
import { WorkActionName, WorkRegName, WorkTaskAction } from "./workTaskService/workTaskAction";
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

    @Inject
    sourceTaskService!:SourceTaskService

}

export type TaskService = SpawnTaskService | WorkTaskService | TransportTaskService | UpgradeTaskService | SourceTaskService
export type TaskAction = SpawnTaskAction | WorkTaskAction | TransportTaskAction | UpgradeTaskAction | SourceTaskAction

export type ServiceName = "spawnTaskService" | "workTaskService" | "transportTaskService" | "upgradeTaskService" | "sourceTaskService"
export type ActionName = SpawnActionName | WorkActionName | TransportActionName | UpgradeActionName | SourceActionName
export type RegName = SpawnRegName | WorkRegName | TransportRegName | UpgradeRegName | SourceRegName


declare global {
    interface RoomMemory{
        serviceDataMap?:ServiceDataMap
    }
}

export type ServiceDataMap = {
    [key in ServiceName]?:ServiceData
}
export type ServiceData = {
    [key:string]:Data
}
export type Data = {
    roomName:string,
    targetId:string,
    x:number,
    y:number,
    creeps:string[],
    spawnTime:number,
    pathTime:number,
    containerId:string,
    linkIdA:string,
    linkIdB:string,
}
