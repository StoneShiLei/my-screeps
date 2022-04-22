import { TaskServiceProxy } from "taskService";
import { BaseTaskAction } from "taskService/baseTaskAction";
import { TaskHelper } from "taskService/taskHelper";
import { Container, Singleton } from "typescript-ioc"
import { TransportTaskNameEntity } from "./transportTaskNameEntity";

export type TransportActionName = 'transportResource' | 'fillResource' | 'goToNearAndPopTask' | 'pickupResource' | 'goToAndPopTask'
export type TransportRegName = 'registerTranDrops' | 'reg2'

@Singleton
export class TransportTaskAction extends BaseTaskAction{

    registerTranDrops(creep:Creep){
        const room = Game.rooms[creep.memory.roomName]
        room._roomDropRegMap = room._roomDropRegMap || {}
        const id = creep.topTask.targetId
        room._roomDropRegMap[id] = true
    }

    transportResource(creep:Creep){
        const opt = creep.topTask.opt as TransportTaskOpt;
        if(!opt.resourceType) throw new Error('TransportTaskAction: transportResource: opt.resourceType is undefined')
        const target = creep.topTarget as AnyStoreStructure

        if(!target || target.store[opt.resourceType] == 0 || creep.storeIsFull()){
            creep.popTopTask()
            creep.doWorkWithTopTask()
            return
        }

        if(!creep.pos.isNearTo(target)) creep.goTo(target)

        //阻塞锁  防止1tick多任务时进行无效的withdraw
        if(creep._moveResourceActive) return
        creep._moveResourceActive = true

        let amount = 0;
        if(target.store[opt.resourceType] && opt.resourceCount){
            amount = Math.min(target.store[opt.resourceType],creep.store.getFreeCapacity(opt.resourceType),opt.resourceCount)
        }
        const result = creep.withdraw(target,opt.resourceType,amount)
        if(result === OK){

            //阻塞锁  防止1tick多任务时进行无效的拿起和放下操作
            creep._moveResourceActiveOK = true

            //todo
            if(!opt.resourceCount) opt.resourceCount = 1e5
            const freeCapacity = creep.store.getFreeCapacity(opt.resourceType)
            const num = Math.min(freeCapacity,opt.resourceCount,target.store[opt.resourceType])
            creep.store[opt.resourceType] += num
            target.store[opt.resourceType] -= num

            creep.popTopTask()
            creep.doWorkWithTopTask()
        }
        else if(result === ERR_NOT_ENOUGH_ENERGY) creep.popTopTask()
        else{}
    }

    fillResource(creep:Creep){
        const id = creep.topTask.targetId
        const opt = creep.topTask.opt as TransportTaskOpt;
        if(!creep._fillActive) creep._fillActive = {}
        if(!opt.resourceType) throw new Error('TransportTaskAction: fillResource: opt.resourceType is undefined')

        const target = Game.getObjectById(creep.topTask.targetId) as AnyStoreStructure
        if(creep._fillActive[id]) return

        if(!target){
            creep._fillActive[id] = true
            if(creep.room.name == creep.topTask.roomName) creep.popTopTask().doWorkWithTopTask()
            return
        }

        const room = target.room
        const fromStorage = opt.fromStorage !== undefined ? opt.fromStorage : true
        const carryAbleCount = opt.resourceCount ?? 0

        //没能量时优先取房间内大容量存储建筑内的能量
        if(!creep._moveResourceActiveOK && creep.storeIsEmpty() && creep.room.my && fromStorage &&
        creep.room.storage && !room.isRoomMassStore(target) && room.roomMassStroeUsedCapacity(opt.resourceType) >= carryAbleCount){
            const taskService = Container.get(TaskServiceProxy)
            const newTasks = taskService.transportTaskService.genMassStoreTranTask(room,opt.resourceType,carryAbleCount)
            if(newTasks.length) creep.addTask(newTasks).doWorkWithTopTask()
            else creep.popTopTask().doWorkWithTopTask()
            return
        }

        // @ts-ignore
        let targetFreeCapacity = target.store.getFreeCapacity(opt.resourceType) ?? 0

        if(targetFreeCapacity <= 0 || creep.store[opt.resourceType] == 0){
            creep._fillActive[id] = true;
            creep.popTopTask().doWorkWithTopTask()
            return
        }


        if(creep.room.name != creep.topTask.roomName || !creep.pos.isNearTo(target)){
            creep.goTo(target)
            creep._moveResourceActive = true;
        }

        if(creep._moveResourceActive) return;

        if(creep.room.name === creep.topTask.roomName && creep.pos.isNearTo(target)){

            let num = Math.min(creep.store[opt.resourceType],opt.resourceCount ?? 1e5,targetFreeCapacity)
            const result = creep.transfer(target,opt.resourceType,num)
            if(result === OK && opt.resourceCount && opt.resourceCount > num && targetFreeCapacity != num){
                creep._moveResourceActive = true
                opt.resourceCount -= num
                creep.store[opt.resourceType] -= num
                target.store[opt.resourceType] += num
                creep.doWorkWithTopTask()
                return
            }

            if(result === OK){
                creep._moveResourceActive = true
                creep.store[opt.resourceType] -= num
                target.store[opt.resourceType] += num
                creep.popTopTask().doWorkWithTopTask()
                return
            }
        }
    }

    goToNearAndPopTask(creep:Creep){
        const target = creep.topTarget
        if(!target) {
            creep.popTopTask()
            return
        }
        if(!creep.pos.isNearTo(target.pos)){
            creep.goTo(target)
            return
        }

        creep.memory.dontPullMe = true;
        creep.popTopTask()
        creep.doWorkWithTopTask()
    }

    goToAndPopTask(creep:Creep){
        const target = creep.topTarget
        if(!target) {
            creep.popTopTask()
            return
        }
        if(!creep.pos.isEqualTo(target.pos)){
            creep.goTo(target)
            return
        }

        creep.memory.dontPullMe = true;
        creep.popTopTask()
        creep.doWorkWithTopTask()
    }

    pickupResource(creep:Creep){
        const target = creep.topTarget as Resource
        if(!target){
            creep.popTopTask()
            return
        }

        const result = creep.pickup(target)
        if(result === ERR_NOT_IN_RANGE){
            creep.addTask(TaskHelper.genTaskWithTarget(target,new TransportTaskNameEntity("goToNearAndPopTask")))
            creep.doWorkWithTopTask()
        }

        if(result != ERR_NOT_IN_RANGE){
            creep.popTopTask()
            creep.doWorkWithTopTask()
        }
    }
}
