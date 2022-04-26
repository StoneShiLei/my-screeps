import { roomManagerCallbacks } from "manager";
import { BodyConfig } from "modules/bodyConfig/bodyConfig";
import { superMove } from "modules/superMove";
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

    getClosestSpawnRoom(room:Room | string,level:number = 7,minLevel:number=4,minRoomDistinct:number = 10):Room | undefined{
        const roomName = room instanceof Room ? room.name : room


        if(Game.rooms[roomName] && Game.rooms[roomName].get<StructureSpawn[]>("spawn").length > 0 && Game.rooms[roomName].level >= level) return Game.rooms[roomName];


        type RoteResult = Array<{
            exit: ExitConstant;
            room: string;
        }>
        const avoidRooms = superMove.getAvoidRoomsMap()
        const opts:RouteOptions = {
            routeCallback(roomName: string): number {
                if(avoidRooms[roomName]) return Infinity
                return 1;
            }
        }
        const getDistinct = function(roomName1:string,roomName2:string):RoteResult | null{
            let distance: number= Game.map.getRoomLinearDistance(roomName1,roomName2,false)
            if(distance >= minRoomDistinct)return null

            const routeResult = Game.map.findRoute(roomName1,roomName2,opts)
            if(routeResult == ERR_NO_PATH) return null
            return routeResult
        }

        let resultRoom:Room | undefined = undefined;
        type DistinctType = [Room,RoteResult | null];
        while(!resultRoom&&level >= minLevel){
            const rooms = _.values<Room>(Game.rooms).filter(r => r.my && r.find(FIND_MY_SPAWNS).length && r.level >= level)
            const route:DistinctType[] = rooms.map(r => [r,getDistinct(roomName,r.name)])
            const temp = _.filter(route,(r) => r[1]!=null && r[1].length <= minRoomDistinct)
            resultRoom = temp.sort((a:DistinctType,b:DistinctType) => (a[1]?.length ?? 0) - (b[1]?.length ?? 0)).map(r =>r[0]).head()
            level--
        }
        if(resultRoom) return resultRoom
        else if(Game.rooms[roomName] && Game.rooms[roomName].get<StructureSpawn[]>("spawn").length > 0 ) return Game.rooms[roomName];
        else return undefined
    }

    private genName(){
        return `0x${Utils.randomId()}`
    }
}
