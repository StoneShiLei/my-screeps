import { BaseTaskAction } from "./baseTaskAction";

export abstract class BaseTaskService{
    abstract actions:BaseTaskAction
    registerTask(creep:Creep):void {
        console.log('未实现的registerTask')
    }
    unregisterTask(creep:Creep):void {
        console.log('未实现的unregisterTask')
    }

}
