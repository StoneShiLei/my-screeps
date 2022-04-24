import { BodyConfig } from "modules/bodyConfig/bodyConfig"
import { Data, ServiceData, TaskServiceProxy } from "taskService"
import { Container } from "typescript-ioc"

const service = Container.get(TaskServiceProxy)


export const roomLevelStrategy = {
    lowLevel:function(room:Room){

        //统计资源池
        const idleEmptyCreeps = room.creeps("worker").filter(creep => creep.storeIsEmpty() && creep.isIdle())
        const idleNotEmptyCreeps = room.creeps("worker").filter(creep => !creep.storeHaveOtherResourceType(RESOURCE_ENERGY,true) && creep.isIdle())

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

        //统计creep资源池  !creep.storeHaveOtherResourceType(RESOURCE_ENERGY,true) 指的是 有 且仅有能量的creep
        const idleEmptyWorkers = room.creeps("worker").filter(creep => creep.storeIsEmpty() && creep.isIdle())
        const idleNotEmptyWorkers = room.creeps("worker").filter(creep => !creep.storeHaveOtherResourceType(RESOURCE_ENERGY,true) && creep.isIdle())
        const idleEmptyTraners = room.creeps("transporter").filter(creep => creep.storeIsEmpty() && creep.isIdle())
        const idleNotEmptyTraners = room.creeps("transporter").filter(creep => !creep.storeHaveOtherResourceType(RESOURCE_ENERGY,true) && creep.isIdle())



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

        //生成upgrader   如果有traner卡能量(因没有storage存储) 则继续生成upgrader进行能量消耗
        const upgradeMap = room.memory.serviceDataMap["upgradeTaskService"]
        if(upgradeMap && Game.getObjectById(upgradeMap[STRUCTURE_CONTROLLER].targetId)){
            if(room.creeps("upgrader").length == 0 ||
            room.creeps("upgrader").length < idleNotEmptyTraners.length - 1){
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


        //store不为空的将资源清空到大容量存储对象内
        idleNotEmptyTraners.forEach(creep => creep.addTask(service.transportTaskService.genFillAllMainRoomMassStoreTask(creep)))


        //搬运房间内能量
        const pickTasks = service.transportTaskService.genPickupTranTask(room,true)
        const tranTasks = service.sourceTaskService.genEnergyTranTask(room)
        const allTanerTasks = pickTasks.concat(tranTasks)
        while(idleEmptyTraners.length > 0 && allTanerTasks.length > 0){
            idleEmptyTraners.pop()?.addTask(allTanerTasks.shift())
        }

        //运力不足时生成transporter
        if(!room.creeps("transporter",false).length || allTanerTasks.length){
            service.spawnTaskService.trySpawn(room,room.name,"transporter",100,[],BodyConfig.transporterBodyConfig.transporterBodyCalctor,{spawnRoom:room})
        }

        //剩余任务分配给空闲的worker搬运
        allTanerTasks.forEach(task => idleEmptyWorkers.pop()?.addTask(task))

        //空闲worker挖矿任务
        let sourceData:Data[] = _.values(room.memory.serviceDataMap["sourceTaskService"])
        sourceData = sourceData.filter(data => Game.getObjectById<Source>(data.targetId)?.energy)
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

        //统计creep资源池  !creep.storeHaveOtherResourceType(RESOURCE_ENERGY,true) 指的是 有 且仅有能量的creep
        const idleEmptyWorkers = room.creeps("worker").filter(creep => creep.storeIsEmpty() && creep.isIdle())
        const idleNotEmptyWorkers = room.creeps("worker").filter(creep => !creep.storeHaveOtherResourceType(RESOURCE_ENERGY,true) && creep.isIdle())
        const idleEmptyTraners = room.creeps("transporter").filter(creep => creep.storeIsEmpty() && creep.isIdle())
        const idleNotEmptyTraners = room.creeps("transporter").filter(creep => !creep.storeHaveOtherResourceType(RESOURCE_ENERGY,true) && creep.isIdle())
        const creeps:CreepPool = {
            idleEmptyWorkers:idleEmptyWorkers,
            idleNotEmptyWorkers:idleNotEmptyWorkers,
            idleEmptyTraners:idleEmptyTraners,
            idleNotEmptyTraners:idleNotEmptyTraners
        }

        highLevelStrategy.workerManager(room,creeps)
        highLevelStrategy.transporterManager(room,creeps)
        highLevelStrategy.workerManagerAfterTraner(room,creeps)

        highLevelStrategy.trySpawnWorker(room)
        highLevelStrategy.trySpawnTransporter(room)
        highLevelStrategy.trySpawnSourceHarKeeper(room)
        highLevelStrategy.trySpawnMineralHarKeeper(room)
        highLevelStrategy.trySpawnUpgraderKeeper(room)
    }
}

type CreepPool = {idleEmptyWorkers:Creep[],idleNotEmptyWorkers:Creep[],idleEmptyTraners:Creep[],idleNotEmptyTraners:Creep[]}


const highLevelStrategy = {
    workerManager(room:Room,creepPool:CreepPool){
        if(!room.storage || room.storage.store[RESOURCE_ENERGY] > 3000) return

        //worker挖矿任务
        let sourceData:Data[] = _.values(room.memory.serviceDataMap["sourceTaskService"])
        sourceData = sourceData.filter(data => Game.getObjectById<Source>(data.targetId)?.energy)
        sourceData.forEach(data => {
            if(data.creeps.filter(creepId => Game.getObjectById<AnyCreep>(creepId)).length == 0 && room.creeps("energyHarvester").length == 0){
                const posLen = Game.getObjectById<Source>(data.targetId)?.pos.nearPos(1).filter(pos => pos.walkable()).length ?? 0
                const targetCount = posLen * 1.5 - room.creeps("worker").filter(creep => creep.topTask && creep.topTask.targetId === data.targetId).length
                if(Math.ceil(targetCount) > 0){
                    const creep = creepPool.idleEmptyWorkers.pop()
                    creep?.addTask(service.sourceTaskService.genReleaseAbleHarvestTask(data))
                }
            }
        })
    },

    transporterManager(room:Room,creepPool:CreepPool){

        //获取房间大容量存储的资源取出任务
        const massStoreTasks = service.transportTaskService.genMassStoreEnergyTranTask(room)

        //搬出centerLink的能量
        const tranLinkTasks = service.transportTaskService.genTranEnergyFromLinkTask(room)
        creepPool.idleEmptyTraners.pop()?.addTask(tranLinkTasks.shift())


        //填充Hive
        while(creepPool.idleNotEmptyTraners.length && room.hiveIsNeedToFill()){
            const creep = creepPool.idleNotEmptyTraners.pop()
            creep?.addTask(service.spawnTaskService.genFillHiveTask(creep,room))
            if(creep?.storeIsEmpty()) creep.addTask(massStoreTasks)
        }

        //填充tower
        const fillTowerTasks = service.towerTaskService.genFillTowerTask(room)
        while(creepPool.idleNotEmptyTraners.length && fillTowerTasks.length){
            const creep = creepPool.idleNotEmptyTraners.pop()
            creep?.addTask(fillTowerTasks.shift())
            if(creep?.storeIsEmpty()) creep.addTask(massStoreTasks)
        }

        //store不为空的将资源清空到大容量存储对象内
        creepPool.idleNotEmptyTraners
        .forEach(creep => creep.addTask(service.transportTaskService.genFillAllMainRoomMassStoreTask(creep)))

         //只筛取ttl大于50的搬运工进行以下任务
        creepPool.idleEmptyTraners = _.filter(creepPool.idleEmptyTraners,creep => creep.ticksToLive && creep.ticksToLive > 50)

        // 8级以下或没有6个link的时候才需要搬运工去搬运能量
        if(room.creeps("energyHarvester").length && room.get<StructureLink[]>(STRUCTURE_LINK).length < 6 || room.level < 8){
            const tranSourceLinkTasks = service.sourceTaskService.genEnergyTranTask(room)
            while(creepPool.idleEmptyTraners.length && tranSourceLinkTasks.length){
                const creep = creepPool.idleEmptyTraners.pop()
                creep?.addTask(tranSourceLinkTasks.shift())
            }
        }

        //捡起资源任务
        service.transportTaskService.takeCachedPickupTranTask(room,creepPool.idleEmptyTraners,false)

        //填充剩余资源的任务
        if(massStoreTasks.length && creepPool.idleEmptyTraners.length){

            //运送升级能量
            const upgradeFillTask = service.upgradeTaskService.genFillUpgradeEnergyTask(room,BodyConfig.getPartCount(creepPool.idleEmptyTraners.head())* 50)
            creepPool.idleEmptyTraners.pop()?.addTask(upgradeFillTask)

            //nuker factory todo  每次判断length防止不必要的cpu浪费
            if(creepPool.idleEmptyTraners.length){}
        }
    },

    workerManagerAfterTraner(room:Room,creepPool:CreepPool){
        const haveIdleTraner = creepPool.idleEmptyTraners.length + creepPool.idleNotEmptyTraners.length > 0
        const tranerCount = room.creeps("transporter").length

        const storageTranEnergyTask = service.transportTaskService.genMassStoreEnergyTranTask(room)

        const sourceEnergyTranTasks = service.sourceTaskService.genEnergyTranTask(room,room.hiveIsNeedToFill() ? 1200 : 500)
        const caseLowEnergyTran = tranerCount == 0 && sourceEnergyTranTasks.length > 0

        creepPool.idleEmptyWorkers.forEach(creep => {
            if(storageTranEnergyTask.length > 0) creep.addTask(storageTranEnergyTask)
            else if(caseLowEnergyTran && sourceEnergyTranTasks.length > 0) creep.addTask(sourceEnergyTranTasks.shift())
            else {}
        })

        creepPool.idleNotEmptyWorkers.forEach(creep =>{
            if(tranerCount == 0 && !haveIdleTraner && room.hiveIsNeedToFill()) creep.addTask(service.spawnTaskService.genFillHiveTask(creep,room))
            else if(room.constructionIsNeedBuild() && !room.isDownGrade()) creep.addTask(service.workTaskService.genBuildTask(creep))
            else if(room.level < 8) creep.addTask(service.upgradeTaskService.genUpgradeTask(room))
            else {}
        })
    },

    trySpawnWorker(room:Room){
        const workerCount = room.creeps("worker",false).length
        const energyOver = room.storage && (room.storage.store[RESOURCE_ENERGY] - 120000) / 50000 > workerCount

        const spawnWorker = function(){service.spawnTaskService.trySpawn(room,room.name,"worker",999,[],BodyConfig.workerBodyConfig.highLevelWorkerBodyCalctor,{spawnRoom:room})}

        //如果死光了立即生成1个worker
        if(workerCount + room.creeps("transporter",false).length === 0) {
            spawnWorker()
        }
        // 如果有工地 或一个都没有 或能量溢出  就生成worker
        else if(room.get<ConstructionSite[]>(LOOK_CONSTRUCTION_SITES).length && (workerCount < 1 || energyOver)){
            spawnWorker()
        }
        else if(room.storage && (room.storage.store[RESOURCE_ENERGY] - 300000 ) / 50000 > workerCount){
            spawnWorker()
        }
        else {}
    },

    trySpawnTransporter(room:Room){

        //分配creep个数  最多7个
        const traner = room.creeps("transporter",false)
        const tranerCount = traner.length
        const harCount = room.creeps("energyHarvester",false).length
        room.memory._carryBusy = room.memory._carryBusy || {}
        const carryBusyList:number[] = _.values(room.memory._carryBusy)
        const avgBusy = carryBusyList.reduce((a,b) => a+b,0) / _.keys(carryBusyList).length

        if((tranerCount <= 0 && room.storage && (room.storage?.store[RESOURCE_ENERGY] > 3000 || harCount > 0)) ||
        (tranerCount <= 7 && avgBusy > traner.filter(e => !e.ticksToLive || e.ticksToLive > e.body.length *3).length * 0.85)){
            service.spawnTaskService.trySpawn(room,room.name,"transporter",100,[],BodyConfig.transporterBodyConfig.transporterBodyCalctor,{spawnRoom:room})
        }

        _.keys(room.memory._carryBusy).filter(e => Number(e) <= Game.time - 250).map(e => delete room.memory._carryBusy[Number(e)])
        room.memory._carryBusy[Game.time] = room.creeps("transporter").filter(e => !e.isIdle()).reduce(a => a+1,0)
    },

    trySpawnSourceHarKeeper(room:Room){
        //生成持续挖矿任务并生成creep
        service.sourceTaskService.trySpawnHarvesterKeeper(room.name,room)
    },

    trySpawnMineralHarKeeper(room:Room){

    },

    trySpawnUpgraderKeeper(room:Room){
        service.upgradeTaskService.trySpawnUpgrader(room)
    },
}
