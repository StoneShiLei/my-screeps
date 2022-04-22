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
            }else if(room.level > 1 && room.constructionIsNeedBuild() && !room.isDownGrade()){
                creep.addTask(service.workTaskService.genBuildTask(creep))
            }
            else {
                creep.addTask(service.upgradeTaskService.genUpgradeTask(room))
            }
        })


        // service.sourceTaskService.trySpawnHarvesterKeeper(room.name,room)
    },
    middleLevel:function(room:Room){

        if(room.creeps("worker",false).length + room.creeps("transporter",false).length === 0) {
            service.spawnTaskService.trySpawn(room,room.name,"worker",999,[],BodyConfig.workerBodyConfig.middleLevelWorkerBodyCalctor,{spawnRoom:room})
        }

        service.sourceTaskService.trySpawnHarvesterKeeper(room.name,room)


    },
    highLevel:function(room:Room){

    }
}
