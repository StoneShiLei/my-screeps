import { BodyConfig } from "modules/bodyConfig/bodyConfig"
import { BaseTaskAction } from "taskService/baseTaskAction"
import { Singleton } from "typescript-ioc"

export type UpgradeActionName = 'upgrade' | 'upgradeKeeper'
export type UpgradeRegName = 'registerUpgrade' | 'unregisterUpgrade' | 'registerUpgradeTranEnergyInRoom'

@Singleton
export class UpgradeTaskAction extends BaseTaskAction {

    registerUpgrade(creep:Creep){
        const map = Memory.rooms[creep.memory.roomName].serviceDataMap['upgradeTaskService']
        if(!map) return
        const data = map[STRUCTURE_CONTROLLER]
        if(creep.spawning) data.spawnTime = Game.time

        if(!_.contains(data.creeps,creep.id)) data.creeps.push(creep.id)
    }

    unregisterUpgrade(creep:Creep){
        const map = Memory.rooms[creep.memory.roomName].serviceDataMap['upgradeTaskService']
        if(!map) return
        const data = map[STRUCTURE_CONTROLLER]
        data.creeps = _.without(data.creeps,creep.id)
    }


    registerUpgradeTranEnergyInRoom(creep:Creep){
        const room = Game.rooms[creep.memory.roomName]
        room._used = room._used || {}
        const id:string = creep.topTask.targetId
        room._used[id] = (room._used[id] || 0) + BodyConfig.getPartCount(creep,CARRY) * 50
    }

    upgradeKeeper(creep:Creep){
        const target = creep.topTarget

        const map = Memory.rooms[creep.memory.roomName].serviceDataMap['upgradeTaskService']
        if(!map || !target){
            creep.popTopTask().doWorkWithTopTask()
            return
        }
        const data = map[STRUCTURE_CONTROLLER]
        if(creep.ticksToLive && creep.ticksToLive < (data.pathTime || 0)){
            creep.unregisterMyTopTask()
            creep.popTopTask().doWorkWithTopTask()
            return
        }



        if(creep.store[RESOURCE_ENERGY] > 0){
            //少于 1w 的时候暂时不更新
            if(!(creep.memory._concated && creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] < 10000) || creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY)<10000){
                const result = creep.upgradeController(target as StructureController)
                if(result === ERR_NOT_IN_RANGE && creep.ticksToLive && creep.ticksToLive % 3 === 0) creep.moveTo(target,{range:3})

                if(creep.pos.inRangeTo(target,3)){
                    if(!creep.memory._concated){
                        data.pathTime = Game.time - (data.spawnTime || 0)
                        data.spawnTime = data.spawnTime || 0
                        data.spawnTime -= data.pathTime + creep.body.length * 3

                        creep.memory._concated = true
                    }
                }
            }
        }

        const container = data.containerId ? Game.getObjectById<StructureContainer>(data.containerId) : undefined
        const link = data.linkIdA ? Game.getObjectById<StructureLink>(data.linkIdA) : undefined
        const containerNotFull = container && container.store.getFreeCapacity(RESOURCE_ENERGY) > BodyConfig.getPartCount(creep,CARRY) * 50 * 2
        let moved = false;
        let isWithdrawLink = false




        //如果没满的情况下 拿全部的这样才能快速填满container
        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) <= BodyConfig.getPartCount(creep,WORK) * (containerNotFull ? 2000 : 1) ){
            if(link && (link._upgradeUsed || 0) <= link.store[RESOURCE_ENERGY] && link.store[RESOURCE_ENERGY] > 0){
                const result = creep.withdraw(link,RESOURCE_ENERGY)
                if(result == ERR_NOT_IN_RANGE){
                    creep.moveTo(link)
                    moved = true
                } else {
                    link._upgradeUsed = (link._upgradeUsed || 0) + creep.store.getFreeCapacity(RESOURCE_ENERGY)
                    isWithdrawLink = true
                }
            }

            if(container && isWithdrawLink && containerNotFull){
                creep.transfer(container,RESOURCE_ENERGY,BodyConfig.getPartCount(creep,CARRY) * 50 - BodyConfig.getPartCount(creep,WORK) * 2)
            }
            else if(container && (!link || creep.store.getUsedCapacity(RESOURCE_ENERGY) <= BodyConfig.getPartCount(creep,WORK))){
                const result = creep.withdraw(container,RESOURCE_ENERGY)
                if(result == ERR_NOT_IN_RANGE){
                    creep.moveTo(container)
                    moved = true
                }
            }
        }



        if(!moved && container && !creep.pos.isEqualTo(container) && data.creeps.length <= 1){
            creep.moveTo(container)
        }

        if(creep.ticksToLive && creep.ticksToLive % 7 == 0){
            const container = creep.pos.findInRange(FIND_STRUCTURES,3,{filter:s => s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax * 0.9}).head()
            if(container) creep.repair(container)
        }
        if(creep.ticksToLive && creep.ticksToLive % 2 == 0){
            creep.memory.dontPullMe = false
        }
    }


    upgrade(creep:Creep) {
        if(creep.store[RESOURCE_ENERGY] == 0) creep.popTopTask()

        const target = creep.topTarget as StructureController
        const result = creep.upgradeController(target)

        if(result == ERR_NOT_IN_RANGE) {
            creep.goTo(target)
            return
        }

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
        if(creep.ticksToLive && creep.ticksToLive % 100 === 0 && creep.room.find(FIND_CONSTRUCTION_SITES).length > 0){
            creep.popTopTask()
            creep.doWorkWithTopTask()
        }

        if(creep.ticksToLive && creep.ticksToLive % 3 === 0) creep.memory.dontPullMe = false
    }


}
