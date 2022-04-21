import { BaseTaskAction } from "taskService/baseTaskAction";
import { TaskHelper } from "taskService/taskHelper";
import { Singleton } from "typescript-ioc";

export type SourceActionName = 'harvestEnergy'
export type SourceRegName = 'func311'

@Singleton
export class SourceTaskAction extends BaseTaskAction {

    harvestEnergy(creep:Creep){
        const task = creep.topTask
        if(creep.storeIsFull()) creep.popTopTask()

        if(task.roomName != creep.room.name){
            creep.goTo(task)
        }
        else{
            const source = Game.getObjectById<Source>(task.targetId)
            if(!source){
                creep.popTopTask()
                return
            }

            if(!source.pos.isNearTo(creep)){
                creep.addTask(TaskHelper.genTaskWithTarget(source,"transportTaskService","goToNearAndPopTask"))
                return
            }

            if(source.energy === 0){
                creep.popTopTask()
                return;
            }

            creep.harvest(source)

            if(creep.ticksToLive && creep.ticksToLive % 4 ==0){
                const dropEnergy = creep.pos.lookFor(LOOK_ENERGY).head()
                if(dropEnergy) creep.pickup(dropEnergy)

                const tombstone = creep.pos.lookFor(LOOK_TOMBSTONES).head()
                if(tombstone) creep.withdraw(tombstone,RESOURCE_ENERGY)
            }
        }
    }
}
