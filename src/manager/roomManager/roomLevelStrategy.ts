import { BodyConfig } from "modules/bodyConfig/bodyConfig"
import { Data, TaskServiceProxy } from "taskService"
import { Container } from "typescript-ioc"

const service = Container.get(TaskServiceProxy)


export const roomLevelStrategy = {
    lowLevel:function(room:Room){

        //捡起资源 性能消耗高  9tick更新一次task
        const pickupTasks = service.transportTaskService.genPickupTranTask(room,false)
        room.creeps("worker").filter(creep => creep.storeIsEmpty() && creep.isIdle()).forEach(creep =>{
            const task = pickupTasks.shift()
            if(task) {
                creep.addTask(task)
            }
        })

        //低级挖矿、运输，无角色分化
        if(room.memory.serviceDataMap && room.memory.serviceDataMap["sourceTaskService"]){
            const sourceData:Data[] = _.values(room.memory.serviceDataMap["sourceTaskService"])
            sourceData.filter(data => Game.getObjectById<Source>(data.targetId)?.energy)
            .sort((a:Data,b:Data)=> (Game.getObjectById<Source>(b.targetId)?.energy ?? 0) - (Game.getObjectById<Source>(a.targetId)?.energy ?? 0)) //按能量从大到小排序
            .forEach(data => {
                const source = Game.getObjectById<Source>(data.targetId) as Source
                //计算出source附近的空位 * 1.5倍数量
                const posLen = source.pos.nearPos(1).filter(pos => pos.walkable()).length
                const targetCount = posLen * 1.5 - room.creeps("worker").filter(creep => creep.topTask && creep.topTask.targetId === source.id).length

                if(Math.min(6,Math.ceil(targetCount)) > 0){

                    const creep = room.creeps("worker").filter(creep => creep.storeIsEmpty() && creep.isIdle()).head()
                    if(creep) creep.addTask(service.sourceTaskService.genReleaseAbleHarvestTask(data))
                    else if(room.creeps("worker").length < 20){
                        const spawnRoom = room.getClosestSpawnRoom(7,3,15)
                        if(!spawnRoom) return
                        if(spawnRoom.name != room.name && room.creeps("worker",false).length >=4) return
                        service.spawnTaskService.trySpawn(spawnRoom,room.name,"worker",999,[],BodyConfig.workerBodyConfig.lowLevelWorkerBodyCalctor,{spawnRoom:spawnRoom})
                    }
                    else{}
                }
            })
        }

        //填充hive、建造工地、升级
        room.creeps("worker").filter(creep => !creep.storeIsEmpty() && creep.isIdle()).forEach(creep =>{
            if(room.hiveIsNeedToFill()){
                creep.addTask(service.spawnTaskService.genFillHiveTask(creep,room))
            }
            else if(room.level > 1 && room.constructionIsNeedBuild() && !room.isDownGrade()){
                creep.addTask(service.workTaskService.genBuildTask(creep))
            }
            else {
                //临时维修逻辑
                const repairTask = service.workTaskService.genRepairTask(creep)
                if(repairTask.length){
                    creep.addTask(repairTask)
                }
                else{
                    creep.addTask(service.upgradeTaskService.genUpgradeTask(room))
                }

            }
        })


        // service.sourceTaskService.trySpawnHarvesterKeeper(room.name,room)
    },
    middleLevel:function(room:Room){

        if(room.creeps("worker",false).length + room.creeps("transporter",false).length === 0) {
            service.spawnTaskService.trySpawn(room,room.name,"worker",999,[],BodyConfig.workerBodyConfig.middleLevelWorkerBodyCalctor,{spawnRoom:room})
        }

        //生成持续挖矿任务并生成creep
        service.sourceTaskService.trySpawnHarvesterKeeper(room.name,room)

        //worker挖矿任务
        _.values<Data>(room.memory.serviceDataMap["sourceTaskService"]).forEach(data => {
            if(data.creeps.length ===0){
                const posLen = Game.getObjectById<Source>(data.targetId)?.pos.nearPos(1).filter(pos => pos.walkable()).length ?? 0
                const targetCount = posLen * 1.5 - room.creeps("worker").filter(creep => creep.topTask && creep.topTask.targetId === data.targetId).length
                if(Math.min(6,Math.ceil(targetCount)) > 0){
                    const creep = room.creeps("worker").filter(creep => creep.storeIsEmpty() && creep.isIdle()).head()
                    if(creep) creep.addTask(service.sourceTaskService.genReleaseAbleHarvestTask(data))
                }
            }
        })

        // 有工地的时候在造worker 或者全死光了
        // 当worker少于2 或 空闲的transporter数量大于worker的数量
        // 且 当 空闲的worker少于2时
        if((room.get<ConstructionSite[]>("constructionSite").length || room.creeps(undefined,false).length == 0) &&
        (room.creeps("worker",false).length < 2 || ((room.creeps("transporter").filter(t => t.isIdle()).length > room.creeps("worker",false).length) &&
        room.creeps("worker",false).filter(w => w.isIdle()).length < 2))){
            service.spawnTaskService.trySpawn(room,room.name,"worker",999,[],BodyConfig.workerBodyConfig.middleLevelWorkerBodyCalctor,{spawnRoom:room})
        }

        //升级
        const upgradeMap = room.memory.serviceDataMap["upgradeTaskService"]
        if(upgradeMap && Game.getObjectById(upgradeMap[STRUCTURE_CONTAINER].targetId)){
            if(room.creeps("upgrader").length == 0 ||
            room.creeps("upgrader").length < room.creeps("transporter").filter(t => t.isIdle() && t.store[RESOURCE_ENERGY] > 0).length - 1){
                service.upgradeTaskService.trySpawnUpgrader(room)
            }
        }

        const pickTasks = service.transportTaskService.genPickupTranTask(room,true)
        const tranTasks = service.sourceTaskService.genEnergyTranTask(room)
        room.creeps("transporter").filter(e => e.storeIsEmpty() && e.isIdle()).forEach(creep => {
            if(tranTasks.length){
                creep.addTask(tranTasks.pop() as Task)
            }
            else if(pickTasks.length){
                creep.addTask(pickTasks.pop() as Task)
            }
            else{}
        })
    },
    highLevel:function(room:Room){

    }
}
