import { BodyConfig } from "modules/bodyConfig/bodyConfig";
import { Data, ServiceData, ServiceDataMap, TaskServiceProxy } from "taskService";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";
import { Container, Inject, Singleton } from "typescript-ioc";
import { SourceTaskAction } from "./sourceTaskAction";
import { SourceTaskNameEntity } from "./sourceTaskNameEntity";

@Singleton
export class SourceTaskService extends BaseTaskService{

    @Inject
    actions!: SourceTaskAction;

    genReleaseAbleHarvestTask(data:Data):Task[]{
        return [TaskHelper.genTaskWithServiceData(data,new SourceTaskNameEntity("harvestEnergy"))]
    }

    genHarvestTask(data:Data):Task[]{
        return [TaskHelper.genTaskWithServiceData(data,new SourceTaskNameEntity("harvestEnergyKeeper"),undefined,new SourceTaskNameEntity(undefined,"registerSources"))]
    }

    genHarvestOuterTask(data:Data):Task[]{
        return [TaskHelper.genTaskWithServiceData(data,new SourceTaskNameEntity("harvestEnergyOutterKeeper"),undefined,new SourceTaskNameEntity(undefined,"registerSources"))]
    }

    genEnergyTranTask(room:Room,minEnergy:number = 1200):Task[]{
        const rm = room.memory
        room._used = room._used || {}

        let tasks:Task[] = []

        if(!rm) return tasks

        if(room.level == 8) minEnergy = 1600

        for(let data of _.values<Data>(rm.serviceDataMap["sourceTaskService"])){
            if(!data.containerId) continue
            const container = Game.getObjectById<StructureContainer>(data.containerId)

            if(container && container.store[RESOURCE_ENERGY] > minEnergy && !room._used[container.id]){
                tasks.push(TaskHelper.genTaskWithTarget(container,new TransportTaskNameEntity("transportResource"),{
                    resourceType:RESOURCE_ENERGY
                },new SourceTaskNameEntity(undefined,"registerSourcesTranInRoom")))
            }
        }

        return tasks
    }

    trySpawnHarvesterKeeper(workRoom:string,spawnRoom:Room){
        //防止低等级时只出生挖矿但没有搬运的
        if(workRoom === spawnRoom.name &&
            spawnRoom.creeps("energyHarvester").filter(creep => (creep?.ticksToLive ?? 0)> 300).length &&
            spawnRoom.creeps("transporter").filter(creep => (creep?.ticksToLive ?? 0)> 300).length == 0) return

        const service = Container.get(TaskServiceProxy)
        // delete room.memory.serviceDataMap?["sourceTaskService"]["undefined"]
        const rm = Memory.rooms[workRoom]
        if(!rm?.serviceDataMap) return
        const sourcesData = rm.serviceDataMap["sourceTaskService"]
        for(let sourceDataName in sourcesData){

            const sourceData = sourcesData[sourceDataName]

            // 如果两个多个连在一起死掉一个 (1source 2creep)
            let harCreeps = sourceData.creeps.map(creepId => Game.getObjectById<Creep>(creepId)).filter(creep => creep && creep.ticksToLive)

            harCreeps.forEach(creepA => {
                harCreeps.forEach(creepB => {
                    if(creepA && creepB){
                        if(creepA.id != creepB.id && creepA.pos.isNearTo(creepB) && creepA.ticksToLive && creepB.ticksToLive){
                            if(creepA.ticksToLive < creepB.ticksToLive){
                                creepA.suicide()
                            }
                            else{
                                creepB.suicide()
                            }
                        }

                    }
                })
            })

            sourceData.creeps = sourceData.creeps.filter(creepId => Game.getObjectById<Creep>(creepId))

            if(sourceData.targetId && (Game.time - (sourceData.spawnTime ?? 0) > 1500 || sourceData.creeps.length === 0)){
                const tasks = (workRoom == spawnRoom.name) ? this.genHarvestTask(sourceData) : this.genHarvestOuterTask(sourceData)
                service.spawnTaskService.trySpawn(spawnRoom,spawnRoom.name,"energyHarvester",100,tasks,BodyConfig.harvesterBodyConfig.harvesterBodyCalctor,
                {energy:spawnRoom.getEnergyCapacityAvailable(),isOutRoom:workRoom !== spawnRoom.name})
            }
        }
    }

    update(room:Room){
        const sources = room.get(LOOK_SOURCES) as unknown as Source[]

        if(!room.memory.serviceDataMap) room.memory.serviceDataMap = {}
        if(!room.memory.serviceDataMap["sourceTaskService"]) room.memory.serviceDataMap["sourceTaskService"] = {}
        const dataMap:ServiceData =  room.memory.serviceDataMap["sourceTaskService"]

        sources.forEach(source =>{
            const sourceId = source.id
            let container:StructureContainer | undefined | null

            if(dataMap[sourceId]){
                const tempId = dataMap[sourceId].containerId
                if(tempId) container = Game.getObjectById<StructureContainer>(tempId)
            }
            if(!container) container = (room.get(STRUCTURE_CONTAINER) as StructureContainer[]).filter(c => c.pos.isNearTo(source)).head()

            let links:StructureLink[] = []
            if(container) links = (room.get(STRUCTURE_LINK) as StructureLink[]).filter(l => container?.pos.isNearTo(l))


            dataMap[source.id] = {
                roomName:source.room.name,
                targetId:source.id,
                x:source.pos.x,
                y:source.pos.y,
                creeps:dataMap[source.id]?.creeps || [],
                spawnTime:dataMap[source.id]?.spawnTime || 0,
                pathTime:dataMap[source.id]?.pathTime || 0,
                containerId: container ? container.id : undefined,
                linkIdA:links[0] ? links[0].id : undefined,
                linkIdB:links[1] ? links[1].id : undefined,
            }
        })
    }
}
