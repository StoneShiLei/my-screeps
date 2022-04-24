import { link } from "fs";
import { Data, RegName, ServiceName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { BaseTaskService } from "taskService/baseTaskService";
import { MineralTaskService } from "taskService/mineralTaskService/mineralTaskService";
import { SourceTaskNameEntity } from "taskService/sourceTaskService/sourceTaskNameEntity";
import { TaskHelper } from "taskService/taskHelper";
import { Container, Inject, Singleton } from "typescript-ioc";
import { TransportTaskAction } from "./transportTaskAction";
import { TransportTaskNameEntity } from "./transportTaskNameEntity";

@Singleton
export class TransportTaskService extends BaseTaskService{

    @Inject
    actions!: TransportTaskAction;

    private _pickupTaskCacheMap:{[roomName:string]:Task[]} = {}

    genMassStoreEnergyTranTask(room:Room,energyCount:number = 6600):Task[]{
        if(room.storage && room.storage.store.energy >= 2000){
            return [TaskHelper.genTaskWithTarget(room.storage,new TransportTaskNameEntity("transportResource"),{
                resourceType:RESOURCE_ENERGY,resourceCount:energyCount
            })]
        }

        const resouceCount = room.roomMassStroeUsedCapacity(RESOURCE_ENERGY)
        if(resouceCount > Math.max(energyCount,2000)){
            return this.genMassStoreTranTask(room,RESOURCE_ENERGY,Math.min(energyCount,resouceCount))
        }
        return []
    }

    genMassStoreTranTask(room:Room,resourceType:ResourceConstant,carryAbleCount:number,regNameEntity?:BaseTaskNameEntity):Task[]{
        const tasks:Task[] = []

        for(let target of [room.storage,room.terminal]){
            if(!target) continue;
            const currentCount = Math.min(target.store[resourceType] ?? 0,carryAbleCount)
            carryAbleCount -= currentCount
            if(currentCount > 0) tasks.push(TaskHelper.genTaskWithTarget(target,new TransportTaskNameEntity("transportResource"),{
                resourceType,resourceCount:currentCount
            },regNameEntity))

            if(carryAbleCount <= 0) break;
        }
        return tasks;
    }

    genFillAllMainRoomMassStoreTask(creep:Creep):Task[]{
        const storage = creep.mainRoom.storage
        const thisAction = Container.get(TransportTaskService)
        if(storage && storage.store.getFreeCapacity() > 0) return thisAction._genFillAllResourceTask(creep,storage)
        else {
            const terminal = creep.mainRoom.terminal
            if(terminal && terminal.store.getFreeCapacity() > 0) return thisAction._genFillAllResourceTask(creep,terminal)
        }
        return []
    }

    _genFillAllResourceTask(creep:Creep,target:AnyStoreStructure):Task[]{
        const tasks = _.keys(creep.store).map(type =>TaskHelper.genTaskWithTarget(target,new TransportTaskNameEntity("fillResource"),{resourceType:type as ResourceConstant}))
        const lastTaskResourceType = tasks.last().opt?.resourceType
        // @ts-ignore
        if(lastTaskResourceType && (target.store.getFreeCapacity(lastTaskResourceType) ?? 0) > 0){
            return tasks
        }
        return []
    }

    takeCachedPickupTranTask(room:Room,idleCreeps:Creep[],onlyEnergy:boolean = false){
        let pickTasks = this._pickupTaskCacheMap[room.name] ?? []
        //捡起资源 性能消耗高  9tick更新一次task
        if(Game.time + room.hashCode() % 9 == 0){
            const service = Container.get(MineralTaskService)
            pickTasks = this.genPickupTranTask(room,onlyEnergy).concat(service.genTranMineralTask(room))
        }
        if(idleCreeps.length > 0 && pickTasks.length > 0) idleCreeps.pop()?.addTask(pickTasks.pop())
        this._pickupTaskCacheMap[room.name] = pickTasks;
    }

    genPickupTranTask(room:Room,onlyEnergy:boolean = false):Task[]{
        room._roomDropRegMap = room._roomDropRegMap ?? {}

        const tombstones = room.find(FIND_TOMBSTONES)
        const ruins = room.find(FIND_RUINS)

        let drops:(Tombstone | Ruin)[] = tombstones
        drops = drops.concat(ruins).filter(s => !room._roomDropRegMap[s.id])

        let dropsTask:Task[] = []
        for(let drop of drops){
            if(drop.store.getUsedCapacity(onlyEnergy ? RESOURCE_ENERGY : undefined)){
                if(onlyEnergy){
                    dropsTask.push(TaskHelper.genTaskWithTarget(drop,new TransportTaskNameEntity("transportResource"),
                    {resourceType:RESOURCE_ENERGY},new TransportTaskNameEntity(undefined,"registerTranDrops")))
                }
                else{
                    const temps = _.keys(drop.store).map(resourceType => TaskHelper.genTaskWithTarget(drop,new TransportTaskNameEntity("transportResource"),{
                        resourceType:resourceType as ResourceConstant},new TransportTaskNameEntity(undefined,"registerTranDrops")))
                    dropsTask = dropsTask.concat(temps)
                }
            }
        }

        let pickTasks = room.find(FIND_DROPPED_RESOURCES)
            .filter(d => !room._roomDropRegMap[d.id])
            .filter(d => (d.resourceType != RESOURCE_ENERGY || d.amount > 100) && (onlyEnergy ? d.resourceType == RESOURCE_ENERGY : true))
            .map(drops =>{
                return TaskHelper.genTaskWithTarget(drops,new TransportTaskNameEntity("pickupResource"),{resourceType:drops.resourceType},new TransportTaskNameEntity(undefined,"registerTranDrops"))
            })

        dropsTask = dropsTask.concat(pickTasks)
        return dropsTask
    }

    genTranEnergyFromLinkTask(room:Room):Task[]{
        const sourceMap = room.memory.serviceDataMap.sourceTaskService
        const tranMap = room.memory.serviceDataMap.transportTaskService

        if(!sourceMap || !tranMap) return []

        const tranData = tranMap[STRUCTURE_STORAGE]
        const tasks:Task[] = []

        let needTran = 0
        for(let sourceData of _.values<Data>(sourceMap)){
            const container = sourceData.containerId ? Game.getObjectById<StructureContainer>(sourceData.containerId) : undefined
            const linkA = sourceData.linkIdA ? Game.getObjectById<StructureLink>(sourceData.linkIdA) : undefined
            const linkB = sourceData.linkIdB ? Game.getObjectById<StructureLink>(sourceData.linkIdB) : undefined
            if(!needTran && container)
                needTran = container.store[RESOURCE_ENERGY] && (linkA && linkB && (linkA.store.getFreeCapacity() === 0 && linkB.store.getFreeCapacity() === 0)) ? 0 : 800
        }
        let centerLink = tranData.linkIdA ? Game.getObjectById<StructureLink>(tranData.linkIdA) : undefined
        if(needTran && centerLink && centerLink.store.getUsedCapacity() !== 0 && !room._used[centerLink.id]){
            if(room.storage){
                tasks.push(TaskHelper.genTaskWithTarget(room.storage,new TransportTaskNameEntity("fillResource"),{resourceType:RESOURCE_ENERGY},new SourceTaskNameEntity(undefined,"registerSourcesTranInRoom")))
                tasks.push(TaskHelper.genTaskWithTarget(centerLink,new TransportTaskNameEntity("transportResource"),{resourceType:RESOURCE_ENERGY},new SourceTaskNameEntity(undefined,"registerSourcesTranInRoom")))
            }
            else{
                tasks.push(TaskHelper.genTaskWithTarget(centerLink,new TransportTaskNameEntity("transportResource"),{resourceType:RESOURCE_ENERGY},new SourceTaskNameEntity(undefined,"registerSourcesTranInRoom")))
            }
        }
        return tasks
    }

    runTransformLink(room:Room){

        const upgradeMap = room.memory.serviceDataMap.upgradeTaskService
        const transportMap = room.memory.serviceDataMap.transportTaskService
        const sourceMap = room.memory.serviceDataMap.sourceTaskService


        if(!upgradeMap || !transportMap || !sourceMap) return

        const upgradeData = upgradeMap[STRUCTURE_CONTROLLER]
        const transportData = transportMap[STRUCTURE_STORAGE]

        if(!upgradeData || !transportData) return

        let updateLink = upgradeData.linkIdA ? Game.getObjectById<StructureLink>(upgradeData.linkIdA) : undefined
        let centerLink = transportData.linkIdA ? Game.getObjectById<StructureLink>(transportData.linkIdA) : undefined


        if(!updateLink && !centerLink) return

        for(let sourceId in sourceMap){
            const sourceData = sourceMap[sourceId]

            let sourceLinkA = sourceData.linkIdA ? Game.getObjectById<StructureLink>(sourceData.linkIdA) : undefined
            let sourceLinkB = sourceData.linkIdB ? Game.getObjectById<StructureLink>(sourceData.linkIdB) : undefined
            let minFreeSend = 100
            let targetLink = sourceLinkA

            if(!sourceLinkA && !sourceLinkB) continue

            if(sourceLinkA && sourceLinkB){
                if(sourceLinkA.store.getFreeCapacity(RESOURCE_ENERGY) > minFreeSend || sourceLinkA.cooldown) targetLink = sourceLinkB
                else targetLink = sourceLinkA
            }

            const container = sourceData.containerId ? Game.getObjectById<StructureContainer>(sourceData.containerId) : undefined
            if(!targetLink) continue


            const canSend = targetLink.store.getFreeCapacity(RESOURCE_ENERGY) <= minFreeSend
            if(!canSend) continue

            if(updateLink && canSend && updateLink.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
                targetLink.transferEnergy(updateLink)
                updateLink = null;
                continue
            }

            if(centerLink && canSend && centerLink.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
                if(container && container.store[RESOURCE_ENERGY] >
                    ((sourceLinkA && sourceLinkB && (sourceLinkA.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && sourceLinkB.store.getFreeCapacity(RESOURCE_ENERGY) == 0)) ? 0 : 800)){
                        targetLink.transferEnergy(centerLink);
                        centerLink = null
                        continue
                }
            }
        }

        if(updateLink && updateLink.store.getUsedCapacity(RESOURCE_ENERGY) == 0 && centerLink && centerLink.store.getUsedCapacity(RESOURCE_ENERGY) != 0){
            centerLink.transferEnergy(updateLink)
        }
    }

    update(room:Room){
        const map = room.memory.serviceDataMap.transportTaskService ?? {}
        const data = map[STRUCTURE_STORAGE] ?? {}
        let centerLink:StructureLink | undefined
        room.get<StructureLink[]>("link").forEach(link =>{
            if(room.storage && link.pos.isNearTo(room.storage)) centerLink = link
        })

        if(centerLink) {
            data.linkIdA = centerLink.id
            data.linkIdB = centerLink.id
        }

        map[STRUCTURE_STORAGE] = data
        room.memory.serviceDataMap.transportTaskService = map
    }
}
