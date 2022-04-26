import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Container, Inject, Singleton } from "typescript-ioc";
import { ClaimTaskNameEntity } from "./claimTaskNameEntity";
import { ClaimTaskAction } from "./claimTaskAction";
import { AutoPlanManager } from "manager/autoPlanManager/autoPlanManager";
import { FlagManager } from "manager/flagManager/flagManager";
import { TaskServiceProxy } from "taskService";
import { SourceTaskNameEntity } from "taskService/sourceTaskService/sourceTaskNameEntity";
import Utils from "utils/utils";

@Singleton
export class ClaimTaskService extends BaseTaskService{

    @Inject
    actions!: ClaimTaskAction;

    claimRun(){
        const flagManager = Container.get(FlagManager)
        const autoPlanManager = Container.get(AutoPlanManager)
        const service = Container.get(TaskServiceProxy)

        const flags = flagManager.getFlagsByPrefix("claim")

        for(let flag of flags){
            if(Game.rooms[flag.pos.roomName] && Game.rooms[flag.pos.roomName].my && Game.rooms[flag.pos.roomName].get<StructureSpawn[]>("spawn")?.length > 0) flag.remove()

            if(!Memory.rooms[flag.pos.roomName] || !Memory.rooms[flag.pos.roomName]?.serviceDataMap?.sourceTaskService){

                let spawnRoom = service.spawnTaskService.getClosestSpawnRoom(flag.pos.roomName,7,3,15)
                if(!spawnRoom){
                    Utils.log("no active able room to spawn claimer",[flag.pos.roomName],false,"yellow")
                    continue
                }
                const roomName = flag.getRoomName()
                if(roomName && Game.rooms[roomName] && Game.rooms[roomName].my) spawnRoom = Game.rooms[roomName]


                const scouter = spawnRoom.creeps('scouter',false).filter(e => e.topTask.roomName == flag.pos.roomName).head()
                if(!scouter){
                    const task = TaskHelper.genTaskWithFlag(flag,new SourceTaskNameEntity("scouterToRoom"))
                    service.spawnTaskService.trySpawn(spawnRoom,spawnRoom.name,"scouter",1000,[task],(args:BodyCalcFuncArgs)=> [MOVE],{})
                }
            }
            else{
                if(!Memory.rooms[flag.pos.roomName].structMap){
                    //创建蓝图
                    autoPlanManager.computeRoom(flag)
                    return
                }

                if(Game.rooms[flag.pos.roomName] && Game.rooms[flag.pos.roomName].my) return;

                let spawnRoom = service.spawnTaskService.getClosestSpawnRoom(flag.pos.roomName,7,3,15)
                if(!spawnRoom){
                    Utils.log("no active able room to spawn claimer",[flag.pos.roomName],false,"yellow")
                    continue
                }
                const roomName = flag.getRoomName()
                if(roomName && Game.rooms[roomName] && Game.rooms[roomName].my) spawnRoom = Game.rooms[roomName]

                const controllerMap = Memory.rooms[flag.pos.roomName]?.serviceDataMap?.upgradeTaskService
                if(!controllerMap){
                    Utils.log("no controllerMap",[flag.pos.roomName],false,"yellow")
                    continue
                }
                const controllerData = controllerMap[STRUCTURE_CONTROLLER]
                const claimer = spawnRoom.creeps("claimer",false).filter(e => e.topTask.roomName == flag.pos.roomName).head()
                if(!claimer){
                    const task = TaskHelper.genTaskWithServiceData(controllerData,new ClaimTaskNameEntity("claimRoom"))
                    service.spawnTaskService.trySpawn(spawnRoom,spawnRoom.name,"scouter",1000,[task],(args:BodyCalcFuncArgs)=> [CLAIM,MOVE,MOVE],{})
                }
            }
        }

    }
}
