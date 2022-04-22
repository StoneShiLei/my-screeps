import { BaseTaskAction } from "taskService/baseTaskAction"
import { TaskHelper } from "taskService/taskHelper"
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity"
import { Singleton } from "typescript-ioc"

export type SpawnActionName = 'fillHive'
export type SpawnRegName = 'registerFillHiveInRoom'

@Singleton
export class SpawnTaskAction extends BaseTaskAction {

    registerFillHiveInRoom(creep:Creep):void {
        const room = Game.rooms[creep.memory.roomName]
        room._hiveEnergySending = room._hiveEnergySending ?? 0
        room._hiveEnergySendingReg = room._hiveEnergySendingReg ?? {}

        room._hiveEnergySending += creep.tasks.length > 2 ? creep.store.getCapacity(RESOURCE_ENERGY) : creep.store[RESOURCE_ENERGY]

        if(creep.tasks.length >= 2) {
            const id = creep.tasks[1].targetId
            room._hiveEnergySendingReg[id] = true
        }
    }


    fillHive(creep:Creep) {
        if(creep.store[RESOURCE_ENERGY] == 0){
            creep.popTopTask()
            return
        }

        const room = Game.rooms[creep.memory.roomName]
        room._hiveEnergySendingReg = room._hiveEnergySendingReg ?? {}

        const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:(structure) => (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
            structure.store[RESOURCE_ENERGY] < structure.store.getCapacity(RESOURCE_ENERGY) &&
            !room._hiveEnergySendingReg[structure.id]
        })

        if(!target) {
            creep.popTopTask()
            return
        }

        room._hiveEnergySendingReg[target.id] = true
        creep.addTask(TaskHelper.genTaskWithTarget(target,new TransportTaskNameEntity("fillResource"),{resouceType:RESOURCE_ENERGY}))
        creep.doWorkWithTopTask()
    }



}
