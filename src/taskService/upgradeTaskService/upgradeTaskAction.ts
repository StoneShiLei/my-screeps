import { BaseTaskAction } from "taskService/baseTaskAction"
import { Singleton } from "typescript-ioc"

export type UpgradeActionName = 'upgrade'
export type UpgradeRegName = 'registerUpgrade'

@Singleton
export class UpgradeTaskAction extends BaseTaskAction {

    // registerUpgrade(creep:Creep){
    //     const rm = Memory.rooms[creep.memory.roomName]

    //     if(rm && rm.serviceDataMap && rm.serviceDataMap['upgradeTaskService']){
    //         const source = rm.serviceDataMap['upgradeTaskService']
    //         if(creep){
    //             source.spawnTime = Game.time
    //         }
    //     }
    // }

    upgrade(creep:Creep) {
        if(creep.store[RESOURCE_ENERGY] == 0) creep.popTopTask()

        const target = creep.topTarget as StructureController
        const result = creep.upgradeController(target)
        if(result == ERR_NOT_IN_RANGE) creep.goTo(target)

        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) >= 50){
            let store:AnyStoreStructure = creep.pos.findInRange<StructureLink>(FIND_STRUCTURES,4,{filter:s=>s.structureType == STRUCTURE_LINK}).head()
            if(!store || store.store[RESOURCE_ENERGY] == 0)
                store = creep.pos.findInRange<StructureContainer>(FIND_STRUCTURES,3,{filter:s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0}).head()

            if(store && store.store[RESOURCE_ENERGY] > 0){
                const result = creep.withdraw(store,RESOURCE_ENERGY)
                if(result === ERR_NOT_IN_RANGE) creep.goTo(store)
            }
        }

        const room = Game.rooms[creep.memory.roomName]
        if(creep.store[RESOURCE_ENERGY] == 0 || room.controller?.upgradeBlocked){
            creep.popTopTask()
            creep.doWorkWithTopTask()
        }

        // 如果有工地则不升级
        if(creep.ticksToLive && creep.ticksToLive % 300 === 0 && creep.room.find(FIND_CONSTRUCTION_SITES).length > 0){
            creep.popTopTask()
            creep.doWorkWithTopTask()
        }

        if(creep.ticksToLive && creep.ticksToLive % 3 === 0) creep.memory.dontPullMe = false
    }


}
