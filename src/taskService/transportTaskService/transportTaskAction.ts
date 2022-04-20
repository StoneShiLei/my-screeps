import { object } from "lodash";
import { BaseTaskAction } from "taskService/baseTaskAction";
import { Singleton } from "typescript-ioc"

export type TransportActionName = 'transportResource'

@Singleton
export class TransportTaskAction extends BaseTaskAction{

    transportResource(creep:Creep){
        debugger
        const task = creep.topTask;
        const opt = task.opt as TransportTaskOpt;

        if(!opt.resouceType) throw new Error('TransportTaskAction: transportResource: opt.resouceType is undefined')
        const target = Game.getObjectById(task.targetId) as AnyStoreStructure;

        if(!creep.pos.isNearTo(target)) creep.goTo(target)

        if(!target || target.store[opt.resouceType] == 0 || creep.storeIsFull()){
            creep.popTopTask()
            creep.doWorkWithTopTask()
            return
        }

        //阻塞锁  防止1tick多任务时进行无效的withdraw
        if(creep._moveResourceActive) return
        creep._moveResourceActive = true

        let amount = 0;
        if(target.store[opt.resouceType] && opt.resourceCount){
            amount = Math.min(target.store[opt.resouceType],creep.store.getFreeCapacity(opt.resouceType),opt.resourceCount)
        }
        const result = creep.withdraw(target,opt.resouceType,amount)
        if(result === OK){
            //阻塞锁  防止1tick多任务时进行无效的拿起和放下操作
            creep._moveResourceActiveOK = true

            if(!opt.resourceCount) opt.resourceCount = 1e5
            const freeCapacity = creep.store.getFreeCapacity(opt.resouceType)
            const num = Math.min(freeCapacity,opt.resourceCount,target.store[opt.resouceType])
            creep.store[opt.resouceType] += num

            target.store[opt.resouceType] -= num

            creep.popTopTask()
            creep.doWorkWithTopTask()
        }
        else if(result === ERR_NOT_ENOUGH_ENERGY) creep.popTopTask()
        else{}
    }
}
