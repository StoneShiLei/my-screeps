import { BodyConfig } from "modules/bodyConfig/bodyConfig"
import { Data, ServiceData, TaskServiceProxy } from "taskService"
import { Container } from "typescript-ioc"

const service = Container.get(TaskServiceProxy)


export const roomLevelStrategy = {
    lowLevel:function(room:Room){

        //统计资源池
        const idleEmptyCreeps = room.creeps("worker").filter(creep => creep.storeIsEmpty() && creep.isIdle())
        const idleNotEmptyCreeps = room.creeps("worker").filter(creep => !creep.storeIsEmpty() && creep.isIdle())

        //捡起资源任务
        service.transportTaskService.takeCachedPickupTranTask(room,idleEmptyCreeps,false)


        //低级挖矿、运输，无角色分化
        const sourceData:Data[] = _.values(room.memory.serviceDataMap["sourceTaskService"])
        _.sortByOrder(_.filter(sourceData,Boolean),s => Game.getObjectById<Source>(s.targetId)?.energy,"desc")
        .forEach(data => {
            //计算出source附近的空位 * 1.5倍数量
            const posLen = Game.getObjectById<Source>(data.targetId)?.pos.nearPos(1).filter(pos => pos.walkable()).length ?? 0
            const targetCount = posLen * 1.5 - room.creeps("worker").filter(creep => creep.topTask && creep.topTask.targetId === data.targetId).length
            if(Math.ceil(targetCount) > 0){
                const creep = idleEmptyCreeps.pop()
                if(creep) creep.addTask(service.sourceTaskService.genReleaseAbleHarvestTask(data))
                else if(room.creeps("worker").length < 20){
                    const spawnRoom = room.getClosestSpawnRoom(7,3,15)
                    if(!spawnRoom || (spawnRoom.name != room.name && room.creeps("worker",false).length >=4)) return

                    service.spawnTaskService.trySpawn(spawnRoom,room.name,"worker",999,[],BodyConfig.workerBodyConfig.lowLevelWorkerBodyCalctor,{spawnRoom:spawnRoom})
                }
                else{}
            }
        })



        const fillTowerTasks = service.towerTaskService.genFillTowerTask(room)
        //填充hive、建造工地、升级
        idleNotEmptyCreeps.forEach(creep =>{
            if(room.hiveIsNeedToFill()){
                creep.addTask(service.spawnTaskService.genFillHiveTask(creep,room))
            }
            else if(fillTowerTasks.length > 0){
                creep.addTask(fillTowerTasks.shift())
            }
            else if(room.level > 1 && room.constructionIsNeedBuild() && !room.isDownGrade()){
                creep.addTask(service.workTaskService.genBuildTask(creep))
            }
            else {
                creep.addTask(service.upgradeTaskService.genUpgradeTask(room))
            }
        })
    },
    middleLevel:function(room:Room){

        //统计creep资源池
        const idleEmptyWorkers = room.creeps("worker").filter(creep => creep.storeIsEmpty() && creep.isIdle())
        const idleNotEmptyWorkers = room.creeps("worker").filter(creep => !creep.storeIsEmpty() && creep.isIdle())
        const idleEmptyTraners = room.creeps("transporter").filter(creep => creep.storeIsEmpty() && creep.isIdle())
        const idleNotEmptyTraners = room.creeps("transporter").filter(creep => !creep.storeIsEmpty() && creep.isIdle())



        //如果死光了立即生成1个worker
        if(room.creeps("worker",false).length + room.creeps("transporter",false).length === 0) {
            service.spawnTaskService.trySpawn(room,room.name,"worker",999,[],BodyConfig.workerBodyConfig.middleLevelWorkerBodyCalctor,{spawnRoom:room})
        }

        // 有工地的时候在造worker 或者全死光了
        // 当worker少于2 或 空闲的transporter数量大于worker的数量
        // 且 当 空闲的worker少于2时
        if((room.get<ConstructionSite[]>("constructionSite").length !== 0 || room.creeps(undefined,false).length == 0) &&
        (room.creeps("worker",false).length < 2 || ((room.creeps("transporter").filter(t => t.isIdle()).length > room.creeps("worker",false).length) &&
        room.creeps("worker",false).filter(w => w.isIdle()).length < 2))){
            service.spawnTaskService.trySpawn(room,room.name,"worker",999,[],BodyConfig.workerBodyConfig.middleLevelWorkerBodyCalctor,{spawnRoom:room})
        }

        //生成持续挖矿任务并生成creep
        service.sourceTaskService.trySpawnHarvesterKeeper(room.name,room)

        //生成upgrader
        const upgradeMap = room.memory.serviceDataMap["upgradeTaskService"]
        if(upgradeMap && Game.getObjectById(upgradeMap[STRUCTURE_CONTROLLER].targetId)){
            if(room.creeps("upgrader").length == 0 ||
            room.creeps("upgrader").length < room.creeps("transporter").filter(t => t.isIdle() && t.store[RESOURCE_ENERGY] > 0).length - 1){
                service.upgradeTaskService.trySpawnUpgrader(room)
            }
        }




        //填充Hive
        while(idleNotEmptyTraners.length && room.hiveIsNeedToFill()){
            const creep = idleNotEmptyTraners.pop()
            creep?.addTask(service.spawnTaskService.genFillHiveTask(creep,room))
        }
        while(idleNotEmptyWorkers.length && room.hiveIsNeedToFill()){
            const creep = idleNotEmptyWorkers.pop()
            creep?.addTask(service.spawnTaskService.genFillHiveTask(creep,room))
        }

        //填充tower
        const fillTowerTasks = service.towerTaskService.genFillTowerTask(room)
        while(idleNotEmptyTraners.length && fillTowerTasks.length){
            const creep = idleNotEmptyTraners.pop()
            creep?.addTask(fillTowerTasks.shift())
        }

        //填充 控制器的能量
        const tranCount = BodyConfig.getPartCount(idleNotEmptyTraners.last(),CARRY) * 50
        const tranUpgraderEnergyTask = service.upgradeTaskService.genFillUpgradeEnergyTask(room,tranCount)
        if(tranUpgraderEnergyTask.length) idleNotEmptyTraners.pop()?.addTask(tranUpgraderEnergyTask)



        //搬运房间内能量
        const pickTasks = service.transportTaskService.genPickupTranTask(room,true)
        const tranTasks = service.sourceTaskService.genEnergyTranTask(room)
        const allTanerTasks = pickTasks.concat(tranTasks)
        while(idleEmptyTraners.length > 0 && allTanerTasks.length > 0){
            idleEmptyTraners.pop()?.addTask(allTanerTasks.shift())
        }

        //运力不足时生成transporter
        if(!room.creeps("transporter",false).length || allTanerTasks.length){
            service.spawnTaskService.trySpawn(room,room.name,"transporter",0,[],BodyConfig.transporterBodyConfig.transporterBodyCalctor,{spawnRoom:room})
        }



        //worker挖矿任务
        const sourceData:Data[] = _.values(room.memory.serviceDataMap["sourceTaskService"])
        sourceData.forEach(data => {
            if(data.creeps.length === 0){
                const posLen = Game.getObjectById<Source>(data.targetId)?.pos.nearPos(1).filter(pos => pos.walkable()).length ?? 0
                const targetCount = posLen * 1.5 - room.creeps("worker").filter(creep => creep.topTask && creep.topTask.targetId === data.targetId).length
                if(Math.ceil(targetCount) > 0){
                    const creep = idleEmptyWorkers.pop()
                    if(creep) creep.addTask(service.sourceTaskService.genReleaseAbleHarvestTask(data))
                }
            }
        })

        //剩余任务分配给空闲的worker搬运
        allTanerTasks.forEach(task => idleEmptyWorkers.pop()?.addTask(task))

        //分配剩余空闲的worker
        const lowEnergyTranTasks = service.sourceTaskService.genEnergyTranTask(room,room.hiveIsNeedToFill() ? 1200 : 500)
        while(idleEmptyWorkers.length && lowEnergyTranTasks.length){
            idleEmptyWorkers.pop()?.addTask(lowEnergyTranTasks.shift())
        }
        idleNotEmptyWorkers.forEach(creep =>{
            if(room.hiveIsNeedToFill()) creep.addTask(service.spawnTaskService.genFillHiveTask(creep,room))
            else if(room.constructionIsNeedBuild() && !room.isDownGrade()) creep.addTask(service.workTaskService.genBuildTask(creep))
            else creep.addTask(service.upgradeTaskService.genUpgradeTask(room))
        })


    },
    highLevel:function(room:Room){

    }
}
