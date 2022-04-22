import { ActionName, RegName, ServiceName } from "taskService";

export abstract class BaseTaskNameEntity{
    abstract serviceName:ServiceName
    abstract actionName?:ActionName
    abstract regName?:RegName
    abstract unregName?:RegName
}
