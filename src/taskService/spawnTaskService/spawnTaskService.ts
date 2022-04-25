import { roomManagerCallbacks } from "manager";
import { BodyConfig } from "modules/bodyConfig/bodyConfig";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Inject, Singleton } from "typescript-ioc";
import Utils from "utils/utils";
import { SpawnTaskAction } from "./spawnTaskAction";
import { SpawnTaskNameEntity } from "./spawnTaskNameEntity";

@Singleton
export class SpawnTaskService extends BaseTaskService{

    @Inject
    actions!:SpawnTaskAction




    genFillHiveTask(creep:Creep,room:Room):Task{

        room._hiveEnergySending += creep.store[RESOURCE_ENERGY] > 0 ? creep.store[RESOURCE_ENERGY] : creep.store.getFreeCapacity(RESOURCE_ENERGY)
        return TaskHelper.genTaskWithTarget(creep,new SpawnTaskNameEntity("fillHive"),{resourceType:RESOURCE_ENERGY},new SpawnTaskNameEntity(undefined,"registerFillHiveInRoom"))
    }

    trySpawn(spawnRoom:Room,targetRoomName:string,role:Role,priority:number,tasks:Task[],bodyFunc:BodyCalcFunc,bodyFuncArgs:BodyCalcFuncArgs,opt?:SpawnOptions):string | undefined{
        if(!spawnRoom || !spawnRoom.my) {
            console.log(`the room not yours,cannot spawn in ${targetRoomName}`)
            return undefined
        }
        // Game._name_hash = (Game._name_hash ?? 0) + 1;
        // const name = this.genName()
        const name = `${this.genName()}_${role}`

        let opts:SpawnOptions = {
            memory: {
                role: role,
                roomName: targetRoomName,
                tasks: tasks,
            }
        }
        if(opt) opts = _.assign(opts,opt)

        if(!spawnRoom._spawnQueue) spawnRoom._spawnQueue = []
        spawnRoom._spawnQueue.push({
            priority: priority,
            name: name,
            spawnOptions: opts,
            bodyFunc: bodyFunc,
            bodyFuncArgs: bodyFuncArgs,
        })
        return name
    }

    handleSpawn(room:Room){
        if(!room._spawnMap) room._spawnMap = {}
        if(room._currentEnergyAvailable===null || room._currentEnergyAvailable === undefined) room._currentEnergyAvailable = room.getEnergyAvailable();
        if(!room._spawnQueue) return

        room._spawnQueue = _.sortByOrder(room._spawnQueue,(task) => task.priority,'desc')
        for(let spawnTask of room._spawnQueue){

            const body = spawnTask.bodyFunc(spawnTask.bodyFuncArgs)
            const spend = BodyConfig.getBodyCosts(body)

            // console.log(JSON.stringify(spend))
            // console.log(JSON.stringify(body))
            // console.log(JSON.stringify(room._spawnQueue))
            if(room._currentEnergyAvailable < spend){
                room._spawnQueue = []
                return
            }

            let spawns = room.get('spawn') as StructureSpawn[]
            if(spawns) spawns = spawns.filter((spawn) => !spawn.spawning && room._spawnMap && !room._spawnMap[spawn.id] && (room.level == 8 || spawn.isActive()))
            const spawn = spawns?.head()
            if(!spawn){
                room._spawnQueue = []
                return
            }

            const result = spawn.spawnCreep(body,spawnTask.name,spawnTask.spawnOptions)
            if(result == OK){
                room._spawnMap[spawn.id] = true
                room._currentEnergyAvailable -= spend;
            }
        }

        room._spawnQueue = []
        return
    }

    private genName(){
        return `0x${Utils.randomId()}`
    }
}
