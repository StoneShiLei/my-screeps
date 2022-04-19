import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { Inject } from "typescript-ioc";
import { WorkTaskAction } from "./workTaskAction";

export class WorkTaskService extends BaseTaskService{

    @Inject
    actions!: WorkTaskAction;

    abcd(){}
}
