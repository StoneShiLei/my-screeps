import { BaseTaskAction } from "taskService/baseTaskAction"
import { TaskHelper } from "taskService/taskHelper"
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity"
import { Singleton } from "typescript-ioc"

export type SpawnActionName = 'fillHive' | 'recycleCreep'
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
            filter:(structure) => (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
            structure.store.getFreeCapacity() != 0 &&
            !room._hiveEnergySendingReg[structure.id]
        })

        if(!target) {
            creep.popTopTask()
            return
        }

        room._hiveEnergySendingReg[target.id] = true
        creep.addTask(TaskHelper.genTaskWithTarget(target,new TransportTaskNameEntity("fillResource"),{resourceType:RESOURCE_ENERGY}))
        creep.doWorkWithTopTask()
    }

    recycleCreep(creep:Creep){
        const task = creep.topTask

        if(creep.mainRoom.name != creep.room.name){
            creep.goTo(creep.mainRoom.randomPosition())
            return
        }

        let spawn = Game.getObjectById<StructureSpawn>(task.targetId)
        if(!spawn){
            spawn = creep.mainRoom.get<StructureSpawn[]>("spawn").head()
            if(spawn) task.targetId = spawn.id
        }

        if(spawn){
            creep.say("recycle!")
            if(!creep.pos.isNearTo(spawn)){
                creep.goTo(spawn)
            }
            else{
                spawn.recycleCreep(creep)
            }
        }
    }

}
