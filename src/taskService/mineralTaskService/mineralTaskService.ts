import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Inject } from "typescript-ioc";
import { MineralTaskNameEntity } from "./mineralTaskNameEntity";
import { MineralTaskAction } from "./mineralTaskAction";
import { filter } from "lodash";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";

export class MineralTaskService extends BaseTaskService{

    @Inject
    actions!: MineralTaskAction;

    genTranMineralTask(room:Room):Task[]{
        const map = room.memory.serviceDataMap.mineralTaskService
        if(!map) return[]
        const data = map[STRUCTURE_EXTRACTOR]
        if(!data) return[]

        room._used = room._used || {}
        const task:Task[] = []

        const container = data.containerId ? Game.getObjectById<StructureContainer>(data.containerId) : undefined
        const regenerationTicks = room.get<Mineral>(LOOK_MINERALS).ticksToRegeneration

        if(!container || container.store.getUsedCapacity(data.type as ResourceConstant) < 400 || (container.store.getUsedCapacity(data.type as ResourceConstant) < 2000 && regenerationTicks <= 0)) return []

        if(!room._used[container.id]){
            _.keys(container.store).forEach(type => {
                task.push(TaskHelper.genTaskWithTarget(container,new TransportTaskNameEntity("transportResource"),{resourceType:type as ResourceConstant},new MineralTaskNameEntity(undefined,"registerMineralTranInRoom")))
            })
        }

        return task
    }

    update(room:Room){
        const mineral = room.get<Mineral>(LOOK_MINERALS)
        if(!mineral) return
        const usedContainer:{[key:string]:boolean} = {};
        const map = room.memory.serviceDataMap.mineralTaskService || {}
        const data = map[STRUCTURE_EXTRACTOR] || {}

        const container = room.get<StructureContainer[]>("container").filter(c => c.pos.isNearTo(mineral) && !usedContainer[c.id]).head()

        data.roomName = room.name
        data.targetId = mineral.id
        data.type = mineral.mineralType
        data.x = mineral.pos.x
        data.y = mineral.pos.y
        data.containerId = container?.id
        data.creeps = data.creeps || []
        data.spawnTime = data.spawnTime || 0
        data.pathTime = data.pathTime || 0

        map[STRUCTURE_EXTRACTOR] = data
        room.memory.serviceDataMap.mineralTaskService = map
    }
}
