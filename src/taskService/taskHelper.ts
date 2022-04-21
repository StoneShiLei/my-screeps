import { ActionName, RegName, ServiceName } from "taskService";

export class TaskHelper {


    static genTaskWithTarget(target:TaskTarget,serviceName:ServiceName,actionName:ActionName,
        opt?:TaskOpt,reg?:RegName,unreg?:RegName):Task {
        const task:Task = {
            serviceName:serviceName,
            actionName:actionName,
            regName:reg,
            unregName:unreg,
            targetId:target.id,
            roomName:target.pos.roomName,
            x:target.pos.x,
            y:target.pos.y,
            opt:opt
        }
        return task
    }

    static genTaskWithOutView(targetId:string,roomName:string,x:number,y:number,serviceName:ServiceName,actionName:ActionName,
        opt?:TaskOpt,reg?:RegName,unreg?:RegName):Task {
            const task:Task = {
                serviceName:serviceName,
                actionName:actionName,
                regName:reg,
                unregName:unreg,
                targetId:targetId,
                roomName:roomName,
                x:x,
                y:y,
                opt:opt
            }
            return task
        }

    static genTaskWithFlag(flag:Flag,serviceName:ServiceName,actionName:ActionName,
        reg?:RegName,unreg?:RegName,opt:TaskOpt = {}):Task {
        const task:Task = {
            serviceName:serviceName,
            actionName:actionName,
            regName:reg,
            unregName:unreg,
            targetId:flag.id,
            roomName:flag.pos.roomName,
            x:flag.pos.x,
            y:flag.pos.y,
            opt:opt
        }
        return task
    }
}
