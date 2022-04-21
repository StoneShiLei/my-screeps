import { Data, ServiceData } from "taskService";
import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Inject } from "typescript-ioc";
import { SourceTaskAction } from "./sourceTaskAction";

export class SourceTaskService extends BaseTaskService{

    @Inject
    actions!: SourceTaskAction;

    genReleaseAbleHarvestTask(data:Data):Task[]{
        return [TaskHelper.genTaskWithOutView(data.targetId,data.roomName,data.x,data.y,"sourceTaskService","harvestEnergy")]
    }

    update(room:Room){
        const sources = room.get(LOOK_SOURCES) as unknown as Source[]

        const containerRegMap:ContainerRegMap = {}

        if(!room.memory.serviceDataMap) room.memory.serviceDataMap = {}
        if(!room.memory.serviceDataMap["sourceTaskService"]) room.memory.serviceDataMap["sourceTaskService"] = {}
        const dataMap:ServiceData =  room.memory.serviceDataMap["sourceTaskService"]

        sources.forEach(source =>{

            let container = Game.getObjectById<StructureContainer>(dataMap[source.id]?.containerId)
            if(!container) container = (room.get(STRUCTURE_CONTAINER) as StructureContainer[]).filter(c => c.pos.isNearTo(source) && !containerRegMap[c.id]).head()
            let links:StructureLink[]
            if(container) links = (room.get(STRUCTURE_LINK) as StructureLink[]).filter(l => container?.pos.isNearTo(l) && !containerRegMap[container.id])

            if(!dataMap[source.id]) dataMap[source.id] = {
                roomName:source.room.name,
                targetId:source.id,
                x:source.pos.x,
                y:source.pos.y,
                creeps:dataMap[source.id]?.creeps || [],
                spawnTime:dataMap[source.id]?.spawnTime || 0,
                pathTime:dataMap[source.id]?.pathTime || 0,
                containerId:'',
                linkIdA:'',
                linkIdB:'',
            }
        })
    }
}
