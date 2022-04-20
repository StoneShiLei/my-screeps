import { BaseTaskService } from "taskService/baseTaskService";
import { Inject } from "typescript-ioc";
import { TransportTaskAction } from "./transportTaskAction";

export class TransportTaskService extends BaseTaskService{

    @Inject
    actions!: TransportTaskAction;

    abcd(){}
}
