import { BaseRegName, BaseTaskAction } from "taskService/baseTaskAction";
import { SpawnTaskNameEntity } from "taskService/spawnTaskService/spawnTaskNameEntity";
import { TaskHelper } from "taskService/taskHelper";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";
import { Singleton } from "typescript-ioc";
import { ResourceBalanceTaskNameEntity } from "./resourceBalanceTaskNameEntity";

export type ResourceBalanceActionName = 'harvestResourceBalanceKeeper' | 'updateResourceBalanceInfo'
export type ResourceBalanceRegName = BaseRegName | 'registerResourceBalance'

@Singleton
export class ResourceBalanceTaskAction extends BaseTaskAction {


}
