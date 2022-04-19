import { ActionName, ServiceName } from "taskService";

export class TaskHelper {


    static genTaskWithTarget(target:TaskTarget,serviceName:ServiceName,actionName:ActionName,
        haveToReg:boolean = false,haveToUnreg:boolean = false,opt:TaskOpt = {}):Task {
        const task:Task = {
            serviceName:serviceName,
            actionName:actionName,
            haveToReg:haveToReg,
            haveToUnreg:haveToUnreg,
            targetId:target.id,
            roomName:target.pos.roomName,
            x:target.pos.x,
            y:target.pos.y,
            opt:opt
        }
        return task
    }

    static genTaskWithFlag(flag:Flag,serviceName:ServiceName,actionName:ActionName,
        haveToReg:boolean = false,haveToUnreg:boolean = false,opt:TaskOpt = {}):Task {
        const task:Task = {
            serviceName:serviceName,
            actionName:actionName,
            haveToReg:haveToReg,
            haveToUnreg:haveToUnreg,
            targetId:flag.name,
            roomName:flag.pos.roomName,
            x:flag.pos.x,
            y:flag.pos.y,
            opt:opt
        }
        return task
    }
}
