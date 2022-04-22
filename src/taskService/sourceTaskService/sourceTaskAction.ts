import { BodyConfig } from "modules/bodyConfig/bodyConfig";
import { BaseTaskAction } from "taskService/baseTaskAction";
import { TaskHelper } from "taskService/taskHelper";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";
import { Container, Singleton } from "typescript-ioc";

export type SourceActionName = 'harvestEnergy' | 'harvestEnergyKeeper' | 'harvestEnergyOutterKeeper'
export type SourceRegName = 'registerSources'

@Singleton
export class SourceTaskAction extends BaseTaskAction {

    registerSources(creep:Creep){
        const rm = Memory.rooms[creep.topTask.roomName]
        const map = rm.serviceDataMap["sourceTaskService"]
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

    harvestEnergyKeeper(creep:Creep){
        const task =creep.topTask

        const source = Game.getObjectById<Source>(task.targetId)
        const rm = Memory.rooms[task.roomName]
        const map = rm.serviceDataMap["sourceTaskService"]
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
        const thisAction = Container.get(SourceTaskAction)
        if(container && !container.pos.isEqualTo(creep)){
            thisAction._updateSourcesInfo(creep)
            creep.addTask(TaskHelper.genTaskWithTarget(container,new TransportTaskNameEntity("goToAndPopTask")))
            return
        }
        else if(source && !source.pos.isNearTo(creep)){
            thisAction._updateSourcesInfo(creep)
            creep.addTask(TaskHelper.genTaskWithTarget(source,new TransportTaskNameEntity("goToNearAndPopTask")))
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

    harvestEnergyOutterKeeper(creep:Creep){

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

    _updateSourcesInfo(creep:Creep){
        const rm = Memory.rooms[creep.topTask.roomName]
        if(!rm) return
        const map = rm.serviceDataMap["sourceTaskService"]
        if(!map) return

        const sourceData = map[creep.topTask.targetId]
        const pathTime = Game.time - sourceData.spawnTime //（接触时间 - 出生时间  = 移动时间）
        // （移动时间）+ 生的时间 -  这样下次走到那边就可以刚刚好前面那只死掉,再缓冲 10tick 理论上走到后寿命不足1500t 不和能量重生重合
        sourceData["spawnTime"] -= pathTime + creep.body.length * 3 - 10
        sourceData["pathTime"] = pathTime
    }
}
