import { ActionName, Data, RegName, ServiceName } from "taskService";
import { BaseTaskNameEntity } from "./baseTaskNameEntity";

export class TaskHelper {


    static genTaskWithTarget(target:TaskTarget,entity:BaseTaskNameEntity,
        opt?:TaskOpt,regEntity?:BaseTaskNameEntity):Task {
        if(!entity.actionName) throw new Error("actionName is not defined")
        const task:Task = {
            serviceName:entity.serviceName,
            actionName:entity.actionName,
            regServiceName:regEntity?.serviceName,
            regName:regEntity?.regName,
            unregName:regEntity?.unregName,
            targetId:target.id,
            roomName:target.pos.roomName,
            x:target.pos.x,
            y:target.pos.y,
            opt:opt
        }
        return task
    }

    static genTaskWithServiceData(data:Data,entity:BaseTaskNameEntity,
        opt?:TaskOpt,regEntity?:BaseTaskNameEntity):Task {
            if(!entity.actionName) throw new Error("actionName is not defined")
            const task:Task = {
                serviceName:entity.serviceName,
                actionName:entity.actionName,
                regServiceName:regEntity?.serviceName,
                regName:regEntity?.regName,
                unregName:regEntity?.unregName,
                targetId:data.targetId,
                roomName:data.roomName,
                x:data.x,
                y:data.y,
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
