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
                },new SourceTaskNameEntity(undefined,"registerInRoom")))
            }
        }

        return tasks
    }

    trySpawnInnerHarvesterKeeper(spawnRoom:Room){
        this._trySpawnHarvesterKeeper(spawnRoom.name,spawnRoom,900)
    }

    trySpawnOutterHarvesterKeeper(workRoomName:string,spawnRoom:Room,priority:number){
        this._trySpawnHarvesterKeeper(workRoomName,spawnRoom,priority)
    }

    _trySpawnHarvesterKeeper(workRoom:string,spawnRoom:Room,priority:number){
        //???????????????????????????????????????????????????
        if(workRoom === spawnRoom.name &&
            spawnRoom.creeps("energyHarvester").filter(creep => (creep?.ticksToLive ?? 0)> 300).length &&
            spawnRoom.creeps("transporter").filter(creep => (creep?.ticksToLive ?? 0)> 300).length == 0) return

        const service = Container.get(TaskServiceProxy)
        const rm = Memory.rooms[workRoom]
        if(!rm?.serviceDataMap) return
        const sourcesData = rm.serviceDataMap["sourceTaskService"]
        for(let sourceDataName in sourcesData){

            const sourceData = sourcesData[sourceDataName]

            // ??????????????????????????????????????????
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

            // ???????????????creeps
            sourceData.creeps = sourceData.creeps.filter(creepId => Game.getObjectById<Creep>(creepId))

            if(sourceData.targetId && (Game.time - (sourceData.spawnTime ?? 0) > 1500 || sourceData.creeps.length === 0)){
                const tasks = (workRoom == spawnRoom.name) ? this.genHarvestTask(sourceData) : this.genHarvestOuterTask(sourceData)

                service.spawnTaskService.trySpawn(spawnRoom,spawnRoom.name,"energyHarvester",priority,tasks,BodyConfig.harvesterBodyConfig.harvesterBodyCalctor,
                {energy:spawnRoom.getEnergyCapacityAvailable(),isOutRoom:workRoom !== spawnRoom.name})
            }
        }
    }

    trySpawnOutterDefenser(workRoom:string,spawnRoom:Room,priority:number){
        const harRoom = Game.rooms[workRoom]
        if(!harRoom) return

        let em:Structure | AnyCreep = harRoom.find(FIND_HOSTILE_CREEPS).head();
        if(!em) em = harRoom.find(FIND_HOSTILE_STRUCTURES).filter(e => e.structureType == STRUCTURE_INVADER_CORE).head()
        if(em){
            const defenser = spawnRoom.creeps("outterHarDefenser",false).filter(e => e.topTask.roomName == harRoom.name).head()
            if(defenser) return
            const service = Container.get(TaskServiceProxy)
            const  task = TaskHelper.genTaskWithTarget(harRoom.get<Mineral>("mineral"),new SourceTaskNameEntity("outterRoomDefanse"))
            service.spawnTaskService.trySpawn(spawnRoom,spawnRoom.name,"outterHarDefenser",priority,[task],BodyConfig.harvesterBodyConfig.outterHarDefenseBodyCalctor,{energy:spawnRoom.getEnergyCapacityAvailable(),isOutRoom:true})
        }
    }

    trySpawnOutterTransporter(workRoom:string,spawnRoom:Room,priority:number){
        const harRoom = Game.rooms[workRoom]
        if(!harRoom) return

        const map = harRoom.memory.serviceDataMap.sourceTaskService
        if(!map) return

        const serviceData:Data[] = _.values(map);
        serviceData.forEach(data => {
            const pathTime = data.pathTime
            const container = data.containerId ? Game.getObjectById<StructureContainer>(data.containerId) : undefined
            if(pathTime && container){
                data.tranCreeps = data.tranCreeps || []
                data.tranCreeps = data.tranCreeps.filter(e => Game.getObjectById<Creep>(e))

                const tranCreeps = data.tranCreeps.map(e => Game.getObjectById<Creep>(e)).filter(e => e && (!e.ticksToLive || e.ticksToLive > e.body.length * 3))
                const tranBuildCreep = tranCreeps.filter(e => BodyConfig.getPartCount(e,WORK) > 0).head()

                const energyPerTick = 10;
                const needCarryPartCount = Math.ceil(pathTime * 2 * energyPerTick / 50) //??????*2  ????????????tick??????
                let carryPartCount = needCarryPartCount - 2 //???????????????work
                tranCreeps.forEach(creep => carryPartCount -= BodyConfig.getPartCount(creep,CARRY))
                const maxPart = Math.ceil(needCarryPartCount / Math.ceil(needCarryPartCount / 33)) //????????????32Part ????????????creep???part??????
                const isNearToAny = tranCreeps.filter(e => e && e.pos.isNearTo(container)).head()


                if(carryPartCount > 0 && !isNearToAny){
                    const tranBodyFunc = tranBuildCreep ? BodyConfig.harvesterBodyConfig.outterTransporterBodyCalctor : BodyConfig.harvesterBodyConfig.outterBuildTransporterBodyCalctor
                    const task = TaskHelper.genTaskWithServiceData(data,new SourceTaskNameEntity("harvestOutterTransport"),undefined,new SourceTaskNameEntity(undefined,"registerSourcesTranOutterRoom"))
                    const service = Container.get(TaskServiceProxy)

                    service.spawnTaskService.trySpawn(spawnRoom,spawnRoom.name,"outterHarTransporter",priority,[task],tranBodyFunc,{energy:spawnRoom.getEnergyCapacityAvailable(),maxPart:maxPart})
                }
            }
        })
        harRoom.memory.serviceDataMap.sourceTaskService = map
    }



    outterHarvestRun(room:Room){
        if((Game.time + room.hashCode()) % 6 !== 0) return
        if(!room.storage) return;
        const roomHarFlags = room.flags("har")
        if(!roomHarFlags?.length) return

        //?????????????????????????????????????????????
        //??????????????????????????? ????????? defenser-45 -> scouter-50 -> reserver-55 -> harvester-60 -> transporter-65
        //??????????????????????????????defenser ?????????????????????-=100
        let defenserPriority = 950
        let scouterPriority = -50
        let reserverPriority = -55
        let harvesterPriority = -60
        let transporterPriority = -65

        roomHarFlags.sort().forEach(flag =>{
            if(Memory.rooms[flag.pos.roomName]){
                this.trySpawnOutterDefenser(flag.pos.roomName,room,defenserPriority)
            }
        })

        const service = Container.get(TaskServiceProxy)
        roomHarFlags.sort().forEach(flag =>{
            if(!Memory.rooms[flag.pos.roomName] || !Memory.rooms[flag.pos.roomName]?.serviceDataMap?.sourceTaskService){
                const scouter = room.creeps("scouter",false).filter(c => c.topTask.roomName == flag.pos.roomName).head()
                if(!scouter){
                    const task = TaskHelper.genTaskWithFlag(flag,new SourceTaskNameEntity("scouterToRoom"))
                    service.spawnTaskService.trySpawn(room,room.name,"scouter",scouterPriority,[task],(args:BodyCalcFuncArgs)=> [MOVE],{})
                }
            }
            else{
                const harRoom = Game.rooms[flag.pos.roomName]
                if((Game.time + room.hashCode()) % 30 == 0 && harRoom) service.sourceTaskService.update(room)

                // ??????claimer ?????? har ???????????????????????? ????????????????????? har
                if(harRoom && !harRoom.my){
                    let reserver = room.creeps("reserver").filter(e => e.topTask.roomName == flag.pos.roomName).head()
                    if(!reserver && harRoom.controller && (!harRoom.controller.reservation || harRoom.controller.reservation.ticksToEnd < 1000)){
                        const task = TaskHelper.genTaskWithTarget(harRoom.controller,new SourceTaskNameEntity("reserveOutterHarvestRoom"))

                        service.spawnTaskService.trySpawn(room,room.name,"reserver",reserverPriority,[task],
                        BodyConfig.harvesterBodyConfig.outterReverserBodyCalctor,{energy:room.getEnergyCapacityAvailable()})
                    }
                }

                this.trySpawnOutterHarvesterKeeper(flag.pos.roomName,room,harvesterPriority)
                this.trySpawnOutterTransporter(flag.pos.roomName,room,transporterPriority)
            }

            //?????????????????????????????????????????????????????????100
            scouterPriority -= 100
            reserverPriority -= 100
            harvesterPriority -= 100
            transporterPriority -= 100
        })

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
                tranCreeps:dataMap[source.id]?.tranCreeps || [],
                defenseCreeps:dataMap[source.id]?.defenseCreeps || [],
                spawnTime:dataMap[source.id]?.spawnTime || 0,
                pathTime:dataMap[source.id]?.pathTime || 0,
                containerId: container?.id,
                linkIdA:links[0] ? links[0].id : undefined,
                linkIdB:links[1] ? links[1].id : undefined,
            }
        })
    }
}
