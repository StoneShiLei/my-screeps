import { take } from "lodash";
import { BodyConfig } from "modules/bodyConfig/bodyConfig";
import { BaseTaskAction } from "taskService/baseTaskAction";
import { TaskHelper } from "taskService/taskHelper";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";
import { Container, Singleton } from "typescript-ioc";
import { SourceTaskNameEntity } from "./sourceTaskNameEntity";

export type SourceActionName = 'harvestEnergy' | 'harvestEnergyKeeper' | 'harvestEnergyOutterKeeper' | 'updateSourcesInfo' | 'outterRoomDefanse' |
                                'reserveOutterHarvestRoom'  | 'harvestOutterTranBuildRoad' | 'harvestOutterTransport' |
                                'scouterToRoom'
export type SourceRegName = 'registerSources' | 'registerSourcesTranInRoom' | 'registerSourcesTranOutterRoom'

@Singleton
export class SourceTaskAction extends BaseTaskAction {


    updateSourcesInfo(creep:Creep){
        const map = creep.room.memory.serviceDataMap["sourceTaskService"]
        if(!map) {
            creep.popTopTask().doWorkWithTopTask()
            return
        }

        const sourceData = map[creep.topTask.targetId]
        if(!sourceData) {
            creep.popTopTask().doWorkWithTopTask()
            return
        }
        sourceData.spawnTime = sourceData.spawnTime || 0
        sourceData.pathTime = Game.time - sourceData.spawnTime //（ 出生时间  - 接触时间  = 移动时间）
        // （移动时间）+ 生的时间 -  这样下次走到那边就可以刚刚好前面那只死掉,再缓冲 10tick 理论上走到后寿命不足1500t 不和能量重生重合
        sourceData.spawnTime -= sourceData.pathTime + creep.body.length * 3 - 10
        map[creep.topTask.targetId] = sourceData
        creep.room.memory.serviceDataMap["sourceTaskService"] = map
        creep.popTopTask().doWorkWithTopTask()
    }

    registerSources(creep:Creep){
        const map = Memory.rooms[creep.topTask.roomName].serviceDataMap["sourceTaskService"]
        if(map && map[creep.topTask.targetId]){
            const sourceData = map[creep.topTask.targetId]
            if(creep.spawning){
                sourceData.spawnTime = Game.time
            }
            let rmHarList = sourceData.creeps
            if(!rmHarList) rmHarList = []

            if(!_.include(rmHarList,creep.id)){
                rmHarList.push(creep.id)
            }
        }
    }

    registerSourcesTranInRoom(creep:Creep){
        const room = Game.rooms[creep.memory.roomName]
        room._used = room._used || {}
        room._used[creep.topTask.targetId] = 1
    }

    registerSourcesTranOutterRoom(creep:Creep){
        const task = creep.topTask
        const map = creep.room.memory.serviceDataMap.sourceTaskService
        if(!map) return
        const data = map[task.targetId]
        if(!data) return
        data.tranCreeps = data.tranCreeps || []
        if(!_.include(data.tranCreeps,creep.id)){
            data.tranCreeps.push(creep.id)
        }
    }

    harvestEnergyKeeper(creep:Creep){
        const task =creep.topTask

        const source = Game.getObjectById<Source>(task.targetId)
        const map = Memory.rooms[creep.topTask.roomName].serviceDataMap["sourceTaskService"]
        if(!map || !source){
            creep.popTopTask()
            return
        }
        const sourceData = map[task.targetId]


        if(task.roomName != creep.room.name){
            creep.goTo(task)
            return
        }

        const container = sourceData.containerId ? Game.getObjectById<StructureContainer>(sourceData.containerId) : undefined
        const linkA = sourceData.linkIdA ? Game.getObjectById<StructureContainer>(sourceData.linkIdA) : undefined
        const linkB = sourceData.linkIdB ? Game.getObjectById<StructureContainer>(sourceData.linkIdB) : undefined
        let linkTarget = (!linkA && linkB) ? linkB : linkA
        if(linkA && linkB && (linkA.store.getUsedCapacity(RESOURCE_ENERGY) > linkB.store.getUsedCapacity(RESOURCE_ENERGY)) && linkA.store[RESOURCE_ENERGY] == 800){
            linkTarget = linkB
        }
        else{
            linkTarget = linkA
        }

        //委托函数指针时   this指向的是委托函数的对象 所以要显示指定实例
        //先压入updateSourceInfo任务，等走到目标位置后才会更新信息
        if(container && !container.pos.isEqualTo(creep)){
            creep.addTask(TaskHelper.genTaskWithTarget(source,new SourceTaskNameEntity("updateSourcesInfo")))
            creep.addTask(TaskHelper.genTaskWithTarget(container,new TransportTaskNameEntity("goToAndPopTask")))
            creep.doWorkWithTopTask()
            return
        }
        else if(source && !source.pos.isNearTo(creep)){
            creep.addTask(TaskHelper.genTaskWithTarget(source,new SourceTaskNameEntity("updateSourcesInfo")))
            creep.addTask(TaskHelper.genTaskWithTarget(source,new TransportTaskNameEntity("goToNearAndPopTask")))
            creep.doWorkWithTopTask()
        }
        else{}

        if((source.energy + 300) / source.energyCapacity > (source.ticksToRegeneration || 300) / 300 && source.energy){
           creep.harvest(source)
        }

        const linkIsNotFull = linkTarget && linkTarget.store[RESOURCE_ENERGY] != 800
        if((creep.ticksToLive && creep.ticksToLive % 3 === 0) || creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0){
            const nearFull = creep.store.getFreeCapacity(RESOURCE_ENERGY) < BodyConfig.getPartCount(creep,WORK) * 2
            if(nearFull){
                const constructionSite = (creep.room.get(LOOK_CONSTRUCTION_SITES) as unknown as ConstructionSite[])
                    .filter(s => s.pos.isNearTo(creep)).head()

                if(constructionSite) creep.build(constructionSite)
                else if(container && container.hits / container.hitsMax < 0.9) creep.repair(container)
                else if(linkTarget && linkTarget.hits / linkTarget.hitsMax < 0.9) creep.repair(linkTarget)
                else {}
            }

            if(linkIsNotFull && container && linkTarget){
                if(nearFull) creep.transfer(linkTarget,RESOURCE_ENERGY)
                if(container.store.getUsedCapacity(RESOURCE_ENERGY) > BodyConfig.getPartCount(creep,CARRY) * 50){
                    creep.withdraw(container,RESOURCE_ENERGY)
                }
            }
        }

        //捡起周围掉落的能量 并且放到容器里
        if(creep.ticksToLive && creep.ticksToLive % 6 <= 1){
            const dropEnergy = creep.pos.lookFor(LOOK_RESOURCES).head()
            if(dropEnergy && container){
                creep.pickup(dropEnergy)
                if(!linkIsNotFull) creep.transfer(container,RESOURCE_ENERGY)
            }

            const tombstone = creep.pos.lookFor(LOOK_TOMBSTONES).head()
            if(tombstone && container){
                creep.withdraw(tombstone,RESOURCE_ENERGY)
                if(!linkIsNotFull) creep.transfer(container,RESOURCE_ENERGY)
            }
        }
    }

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
                creep.addTask(TaskHelper.genTaskWithTarget(source,new TransportTaskNameEntity("goToNearAndPopTask")))
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

    outterRoomDefanse(creep:Creep){
        const task = creep.topTask
        if(task.roomName != creep.room.name){
            creep.goTo(task)
            return
        }

        let em:Structure | AnyCreep = creep.room.find(FIND_HOSTILE_CREEPS).head()
        if(!em) em = creep.room.find(FIND_HOSTILE_STRUCTURES).filter(s => s.structureType == STRUCTURE_INVADER_CORE).head()
        if(em){
            if(creep.attack(em) == ERR_NOT_IN_RANGE){
                creep.moveTo(em)
                creep.heal(creep)
            }
            creep.rangedAttack(em)
            return
        }

        const injuredCreep = creep.pos.findClosestByPath(FIND_MY_CREEPS,{filter:e=>e.hits != e.hitsMax})
        if(injuredCreep && creep.heal(injuredCreep) == ERR_NOT_IN_RANGE){
            creep.moveTo(injuredCreep)
            creep.memory.dontPullMe = true
            return
        }

        const mineral = creep.topTarget
        if(mineral && !creep.pos.inRangeTo(mineral,3)){
            creep.moveTo(mineral)
        }
    }

    reserveOutterHarvestRoom(creep:Creep){
        const taks = creep.topTask
        if(taks.roomName != creep.room.name){
            creep.goTo(taks)
            return
        }

        const controller = creep.topTarget as StructureController
        if(controller && creep.reserveController(controller) == ERR_NOT_IN_RANGE){
            creep.moveTo(controller)
        }
        creep.memory.dontPullMe = (creep.ticksToLive || 3) % 3 != 0
    }

    harvestEnergyOutterKeeper(creep:Creep){
        const task =creep.topTask
        const map = Memory.rooms[task.roomName].serviceDataMap["sourceTaskService"]

        if(!map){
            creep.popTopTask()
            return
        }

        const sourceData = map[task.targetId]
        if(task.roomName != creep.room.name){
            creep.goTo(task)
            return
        }

        const source = Game.getObjectById<Source>(task.targetId)
        if(!source){
            creep.popTopTask()
            return
        }
        const container = sourceData.containerId ? Game.getObjectById<StructureContainer>(sourceData.containerId) : undefined
        //委托函数指针时   this指向的是委托函数的对象 所以要显示指定实例
        //先压入updateSourceInfo任务，等走到目标位置后才会更新信息
        if(container && !container.pos.isEqualTo(creep)){
            creep.addTask(TaskHelper.genTaskWithTarget(source,new SourceTaskNameEntity("updateSourcesInfo")))
            creep.addTask(TaskHelper.genTaskWithTarget(container,new TransportTaskNameEntity("goToAndPopTask")))
            creep.doWorkWithTopTask()
            return
        }
        else if(source && !source.pos.isNearTo(creep)){
            creep.addTask(TaskHelper.genTaskWithTarget(source,new SourceTaskNameEntity("updateSourcesInfo")))
            creep.addTask(TaskHelper.genTaskWithTarget(source,new TransportTaskNameEntity("goToNearAndPopTask")))
            creep.doWorkWithTopTask()
        }
        else{}

        if(container && !container.pos.isEqualTo(creep)){
            creep.addTask(TaskHelper.genTaskWithTarget(source,new SourceTaskNameEntity("updateSourcesInfo")))
            creep.addTask(TaskHelper.genTaskWithTarget(container,new TransportTaskNameEntity("goToAndPopTask")))
            creep.doWorkWithTopTask()
            return
        }
        else if(source && !source.pos.isNearTo(creep)){
            creep.addTask(TaskHelper.genTaskWithTarget(source,new SourceTaskNameEntity("updateSourcesInfo")))
            creep.addTask(TaskHelper.genTaskWithTarget(source,new TransportTaskNameEntity("goToNearAndPopTask")))
            creep.doWorkWithTopTask()
        }
        else{}

        if((source.energy + 100) / source.energyCapacity > (source.ticksToRegeneration || 300) / 300 && source.energy){
           creep.harvest(source)
        }

        if(!container&& creep.ticksToLive  && creep.ticksToLive % 7 == 0){
            creep.pos.createConstructionSite(STRUCTURE_CONTAINER)
        }

        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) < BodyConfig.getPartCount(creep,WORK) * 2){
            const cons = source.pos.findInRange(FIND_CONSTRUCTION_SITES,1,{filter:c => c.structureType == STRUCTURE_CONTAINER}).head()
            if(cons) creep.build(cons)
            if(container && container.hits < container.hitsMax * 0.9) creep.repair(container)
        }

        //捡起周围掉落的能量 并且放到容器里
        if(creep.ticksToLive && creep.ticksToLive % 7 < 2){
            const dropEnergy = creep.pos.lookFor(LOOK_RESOURCES).head()
            if(dropEnergy && container){
                creep.pickup(dropEnergy)
                creep.transfer(container,RESOURCE_ENERGY)
            }

            const tombstone = creep.pos.lookFor(LOOK_TOMBSTONES).head()
            if(tombstone && container){
                creep.withdraw(tombstone,RESOURCE_ENERGY)
                creep.transfer(container,RESOURCE_ENERGY)
            }
        }
    }

    harvestOutterTranBuildRoad(creep:Creep){
        const target = creep.topTarget
        if(!target || creep.pos.isNearTo(target) || creep.store[RESOURCE_ENERGY] == 0){
            creep.popTopTask().doWorkWithTopTask()
            return
        }

        if(BodyConfig.getPartCount(creep,WORK) == 0 || creep.getActiveBodyparts(WORK) == 0 || creep.pos.isBorder()){
            creep.moveTo(target)
            return
        }

        let road:Structure | ConstructionSite | undefined = creep.pos.lookFor(LOOK_STRUCTURES).filter(s => s.structureType == STRUCTURE_ROAD).head()
        if(!road){
            road = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).filter(s => s.structureType == STRUCTURE_ROAD).head()
            if(!road && creep.ticksToLive && creep.ticksToLive > 300){
                creep.pos.createConstructionSite(STRUCTURE_ROAD)
                return
            }
            else if(road){
                creep.build(road)
                creep.memory.dontPullMe = false
                return
            }
            else{
                creep.moveTo(target)
                return
            }
        }
        else{
            if(road.hits < road.hitsMax * 0.9) creep.repair(road)
            if(road.hits > road.hitsMax * 0.8) creep.moveTo(target)
        }
    }

    harvestOutterTransport(creep:Creep){
        const task = creep.topTask
        const map = Game.rooms[task.roomName]?.memory?.serviceDataMap?.sourceTaskService
        if(!map){
            creep.popTopTask().doWorkWithTopTask()
            return
        }
        const data = map[task.targetId]
        if(!data){
            creep.popTopTask().doWorkWithTopTask()
            return
        }

        if(task.roomName != creep.room.name){
            creep.goTo(task)
            return
        }
        const harCreep = data.creeps.length ? Game.getObjectById<Creep>(data.creeps[0]) : undefined
        const container = data.containerId ? Game.getObjectById<StructureContainer>(data.containerId) : undefined

        // 挖矿爬就位才动，避免堵路 ，如果自己在边界的地方也不能停下，两个在一起直接堵路
        if(harCreep && container && harCreep.pos.isNearTo(container) || creep.pos.isBorder()){
            if(container && !creep.pos.isNearTo(container)){
                creep.goTo(container)
            }

            if(container && container.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY)){
                const result = creep.withdraw(container,RESOURCE_ENERGY)
                if(result == ERR_NOT_IN_RANGE) creep.moveTo(container)
            }
        }

        const tombstone = creep.pos.lookFor(LOOK_TOMBSTONES).filter(e => e.store[RESOURCE_ENERGY] > 0).head()
        if(tombstone) creep.withdraw(tombstone,RESOURCE_ENERGY)

        const drops = creep.pos.lookFor(LOOK_RESOURCES).head()
        if(drops) creep.pickup(drops)

        if(creep.store[RESOURCE_ENERGY] * 2 > creep.store.getCapacity(RESOURCE_ENERGY) && creep.mainRoom.storage){
            const tasks = [
                TaskHelper.genTaskWithTarget(creep.mainRoom.storage,new TransportTaskNameEntity("fillResource"),{resourceType:RESOURCE_ENERGY}),
                TaskHelper.genTaskWithTarget(creep.mainRoom.storage,new SourceTaskNameEntity("harvestOutterTranBuildRoad")),
            ]
            creep.addTask(tasks)
        }
    }

    scouterToRoom(creep:Creep){
        const task = creep.topTask
        const pos = new RoomPosition(25,25,task.roomName)
        if(creep.room.name == pos.roomName){
            creep.suicide()
        }

        if(!Memory.rooms[creep.room.name] || !Memory.rooms[creep.room.name]?.serviceDataMap?.sourceTaskService){
            creep.room.updateRoomInfo()
        }
        else{
            creep.goTo(pos)
        }


    }
}
