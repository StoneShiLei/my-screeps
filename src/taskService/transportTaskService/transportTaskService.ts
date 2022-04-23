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
}
