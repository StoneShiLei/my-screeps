import { Inject, Singleton } from "typescript-ioc";
import { SpawnActionName, SpawnTaskAction } from "./spawnTaskService/spawnTaskAction";
import { SpawnTaskService } from "./spawnTaskService/spawnTaskService";
import { WorkActionName, WorkTaskAction } from "./workTaskService/workTaskAction";
import { WorkTaskService } from "./workTaskService/workTaskService";


@Singleton
export class TaskServiceProxy {

    @Inject
    spawnTaskService!:SpawnTaskService;

    @Inject
    workTaskService!:WorkTaskService;

}

export type TaskService = SpawnTaskService | WorkTaskService
export type TaskAction = SpawnTaskAction | WorkTaskAction
export type ServiceName = "spawnTaskService" | "workTaskService"
export type ActionName = SpawnActionName | WorkActionName
