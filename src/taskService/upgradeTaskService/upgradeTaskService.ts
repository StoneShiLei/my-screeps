import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Container, Inject, Singleton } from "typescript-ioc";
import { UpgradeTaskNameEntity } from "./upgradeTaskNameEntity";
import { UpgradeTaskAction } from "./upgradeTaskAction";
import { TaskServiceProxy } from "taskService";
import { BodyConfig } from "modules/bodyConfig/bodyConfig";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";

@Singleton
export class UpgradeTaskService extends BaseTaskService{

    @Inject
    actions!:UpgradeTaskAction

    genUpgradeTask(room:Room):Task[]{
        if(room.controller && room.controller.my){
            return [TaskHelper.genTaskWithTarget(room.controller,new UpgradeTaskNameEntity("upgrade"),undefined,
            new UpgradeTaskNameEntity(undefined,"registerUpgrade"))]
        }
        return[]
    }

    genUpgradeKeeperTask(room:Room):Task[]{
        if(!room.controller || !room.controller.my) return []
        return [TaskHelper.genTaskWithTarget(room.controller,new UpgradeTaskNameEntity("upgradeKeeper"),undefined,
        new UpgradeTaskNameEntity(undefined,"registerUpgrade"))]
    }

    genFillUpgradeEnergyTask(room:Room,carryCap?:number):Task[]{
        const map = room.memory.serviceDataMap.upgradeTaskService
        if(!map || !carryCap) return []
        const data = map[STRUCTURE_CONTROLLER]
        room._used = room._used || {}

        const container = data.containerId ? Game.getObjectById<StructureContainer>(data.containerId) : undefined
        const upgradelink = data.linkIdA ? Game.getObjectById<StructureLink>(data.linkIdA) : undefined
        if(!upgradelink || upgradelink && upgradelink.store.getUsedCapacity() === 0){
            const tranMap = room.memory.serviceDataMap.transportTaskService
            const centerLinkId = tranMap ? tranMap[STRUCTURE_STORAGE].linkIdA : undefined
            const centerLink = centerLinkId ? Game.getObjectById<StructureLink>(centerLinkId) : undefined

            if(centerLink && upgradelink && upgradelink.store.getUsedCapacity() === 0 && centerLink.store.getUsedCapacity() == 0){
                return [TaskHelper.genTaskWithTarget(centerLink,new TransportTaskNameEntity("fillResource"),{resourceType:RESOURCE_ENERGY}
                ,new UpgradeTaskNameEntity(undefined,"registerUpgradeTranEnergyInRoom"))]
            }

            if(container){
                room._used[container.id] = room._used[container.id] ?? 0
                const num1 = room._used[container.id] + container.store[RESOURCE_ENERGY] + Math.min(1000,Math.max(carryCap-400,0))
                const num2 = room._used[container.id] + container.store.getUsedCapacity(RESOURCE_ENERGY)
                if(num1 < 2000 && num2 < 800){
                    return[TaskHelper.genTaskWithTarget(container,new TransportTaskNameEntity("fillResource"),{resourceType:RESOURCE_ENERGY}
                    ,new UpgradeTaskNameEntity(undefined,"registerUpgradeTranEnergyInRoom"))]
                }
            }

        }

        return []
    }

    trySpawnUpgrader(room:Room):void{
        const rm = room.memory.serviceDataMap["upgradeTaskService"]
        if(!rm || !room.controller) return
        const data = rm[STRUCTURE_CONTROLLER]
        if(!data.creeps) data.creeps = []

        if(!data.containerId || !Game.getObjectById(data.containerId)) return

        data.creeps = data.creeps.filter(e => Game.getObjectById(e))

        if(room.level < 8 || !room.storage){
            let minUpgraderCount = 0;
            if(!room.storage || room.controller.progress >= room.controller.progressTotal){
                this._trySpawnUpgrader(room)
            }
            else if(((room.storage.store[RESOURCE_ENERGY]-(room.level-3.5)*10000) / 100000  > room.creeps("upgrader",false).length) ||
            room.controller.ticksToDowngrade < 500 ||
            (room.storage.store[RESOURCE_ENERGY]>10000 && minUpgraderCount > room.creeps("upgrader",false).length)){
                this._trySpawnUpgrader(room)
            }
            else{}
        }
    }

    update(room:Room){
        if(!room.controller) return
        let map = room.memory.serviceDataMap["upgradeTaskService"] || {}
        let data = map[STRUCTURE_CONTROLLER] || {}
        let container = room.controller.pos.findInRange(FIND_STRUCTURES,1,{filter:s=>s.structureType == STRUCTURE_CONTAINER}).head()
        if(container) data.containerId = container.id

        if(container){
            const link = room.get<StructureLink[]>("link").filter(e => container.pos.isNearTo(e)).head()
            if(link) {
                data.linkIdA = link.id
                data.linkIdB = link.id
            }
        }

        data.targetId = room.controller.id
        data.x = room.controller.pos.x
        data.y = room.controller.pos.y
        data.roomName = room.name
        data.creeps = map[STRUCTURE_CONTROLLER]?.creeps || []

        map[STRUCTURE_CONTROLLER] = data
        room.memory.serviceDataMap["upgradeTaskService"] = map
    }

    private _trySpawnUpgrader(room:Room):void{
        const tasks = this.genUpgradeKeeperTask(room)
        if(!tasks.length) return

        const service = Container.get(TaskServiceProxy)
        service.spawnTaskService.trySpawn(room,room.name,"upgrader",50,tasks,
        BodyConfig.upgraderBodyConfig.lowLevelUpgraderBodyCalctor,{spawnRoom:room})
    }


}
