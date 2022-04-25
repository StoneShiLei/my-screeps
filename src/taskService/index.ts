import { Inject, Singleton } from "typescript-ioc";
import { MineralActionName, MineralRegName, MineralTaskAction } from "./mineralTaskService/mineralTaskAction";
import { MineralTaskService } from "./mineralTaskService/mineralTaskService";
import { SourceActionName, SourceRegName, SourceTaskAction } from "./sourceTaskService/sourceTaskAction";
import { SourceTaskService } from "./sourceTaskService/sourceTaskService";
import { SpawnActionName, SpawnRegName, SpawnTaskAction } from "./spawnTaskService/spawnTaskAction";
import { SpawnTaskService } from "./spawnTaskService/spawnTaskService";
import { TowerActionName, TowerRegName, TowerTaskAction } from "./towerTaskService/towerTaskAction";
import { TowerTaskService } from "./towerTaskService/towerTaskService";
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

    @Inject
    towerTaskService!:TowerTaskService

    @Inject
    mineralTaskService!:MineralTaskService

}

export type TaskService = SpawnTaskService | WorkTaskService | TransportTaskService | UpgradeTaskService | SourceTaskService | TowerTaskService | MineralTaskService
export type TaskAction = SpawnTaskAction | WorkTaskAction | TransportTaskAction | UpgradeTaskAction | SourceTaskAction | TowerTaskAction | MineralTaskAction

export type ServiceName = "spawnTaskService" | "workTaskService" | "transportTaskService" | "upgradeTaskService" | "sourceTaskService" | "towerTaskService" | "mineralTaskService"
export type ActionName = SpawnActionName | WorkActionName | TransportActionName | UpgradeActionName | SourceActionName | TowerActionName | MineralActionName
export type RegName = SpawnRegName | WorkRegName | TransportRegName | UpgradeRegName | SourceRegName | TowerRegName | MineralRegName






declare global {
    interface RoomMemory{
        serviceDataMap:ServiceDataMap
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
    tranCreeps?:string[],
    defenseCreeps?:string[],
    spawnTime?:number,
    pathTime?:number,
    containerId?:string,
    linkIdA?:string,
    linkIdB?:string,
    type?:string,
}
