import { RegName, ServiceName } from "taskService";
import { BaseTaskNameEntity } from "taskService/baseTaskNameEntity";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Inject, Singleton } from "typescript-ioc";
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

    takeCachedPickupTranTask(room:Room,idleCreeps:Creep[],onlyEnergy:boolean = false){
        let pickTasks = this._pickupTaskCacheMap[room.name] ?? []
        //捡起资源 性能消耗高  9tick更新一次task
        if(Game.time + room.hashCode() % 9 == 0){
            pickTasks = this.genPickupTranTask(room,onlyEnergy) // generatorCarryMineralTask
        }
        if(idleCreeps.length > 0 && pickTasks.length > 0) idleCreeps.pop()?.addTask(pickTasks.pop())
        this._pickupTaskCacheMap[room.name] = pickTasks;
    }

    genPickupTranTask(room:Room,onlyEnergy:boolean = false):Task[]{
        room._roomDropRegMap = room._roomDropRegMap ?? {}

        const tombstones = room.find(FIND_TOMBSTONES) as unknown as AnyStoreStructure[]
        const ruins = room.find(FIND_RUINS) as unknown as AnyStoreStructure[]
        let tasks = tombstones.concat(ruins).filter(s => !room._roomDropRegMap[s.id])
            .map(drops =>{
                // @ts-ignore
                if(drops.store.getUsedCapacity(onlyEnergy ? RESOURCE_ENERGY : undefined)){
                    if(onlyEnergy){
                        return [TaskHelper.genTaskWithTarget(drops,new TransportTaskNameEntity("transportResource"),
                        {resourceType:RESOURCE_ENERGY},new TransportTaskNameEntity(undefined,"registerTranDrops"))]
                    }
                    else{
                        return _.keys(drops.store).map(resourceType => TaskHelper.genTaskWithTarget(drops,new TransportTaskNameEntity("transportResource"),{
                            resourceType:resourceType as ResourceConstant},new TransportTaskNameEntity(undefined,"registerTranDrops")))
                    }
                }
                return undefined
            })
        const temp:Task[] = []
        tasks.forEach(t => {if(t) temp.concat(t)})

        let pickTasks = room.find(FIND_DROPPED_RESOURCES)
            .filter(d => !room._roomDropRegMap[d.id])
            .filter(d => (d.resourceType != RESOURCE_ENERGY || d.amount > 100) && (onlyEnergy ? d.resourceType == RESOURCE_ENERGY : true))
            .map(drops =>{
                return [TaskHelper.genTaskWithTarget(drops,new TransportTaskNameEntity("pickupResource"),{resourceType:drops.resourceType},new TransportTaskNameEntity(undefined,"registerTranDrops"))]
            })
        const temp2:Task[] = []
        pickTasks.forEach(t => temp2.concat(t))


        const result:Task[] = []
        return result.concat(temp,temp2)
    }
}
