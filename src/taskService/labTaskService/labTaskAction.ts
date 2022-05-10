import { BaseTaskAction } from "taskService/baseTaskAction";
import { SpawnTaskNameEntity } from "taskService/spawnTaskService/spawnTaskNameEntity";
import { TaskHelper } from "taskService/taskHelper";
import { Singleton } from "typescript-ioc";
import Utils from "utils/utils";

export type LabActionName = 'labRoom'
export type LabRegName = ''


@Singleton
export class LabTaskAction extends BaseTaskAction {


}
