import { creepRoleConfigs } from "role"
import { CREEP_DEFAULT_MEMORY } from "settings"
import Utils from "utils/utils"
import CreepReleaser from "./creepReleaser"
import SpawnTask from "./spawnTask"

export default class RoomSpawnController {

    readonly roomName:string
    readonly releaser:CreepReleaser

    constructor(roomName:string){
        this.roomName = roomName
        this.releaser = new CreepReleaser(this)
    }

    get spawnTaskQueue():SpawnTask[]{
        if(!this.room.memory.spawnTaskQueue) this.room.memory.spawnTaskQueue = []
        return this.room.memory.spawnTaskQueue
    }

    get room():Room{
        if(!Game.rooms[this.roomName]){
            Utils.log(`无法访问房间实例，模块已停止运行`, ['SpawnController'],  true,'red')
            throw new Error(`${this.roomName} 'SpawnController' 房间实例不存在`)
        }
        return Game.rooms[this.roomName]
    }


    addTask(task:SpawnTask):OK|ERR_NAME_EXISTS{
        if(this.hasTask(task.name)) return ERR_NAME_EXISTS

        this.spawnTaskQueue.push(task)

        return OK
    }

    hasTask(creepName:string):boolean{
        return !!this.spawnTaskQueue.find(task => task.name == creepName)
    }

    removeCurrentTask():void{
        this.spawnTaskQueue.shift()
    }

    runSpawn(spawn:StructureSpawn):void{
        if(spawn.spawning){
            /**
             * 开始孵化后向物流队列推送能量填充任务
             *
             * 不在 mySpawnCreep 返回 OK 时判断是因为：
             * 由于孵化是在 tick 末的行动执行阶段进行的，所以能量在 tick 末期才会从 extension 中扣除
             * 如果返回 OK 就推送任务的话，就会出现任务已经存在了，而 extension 还是满的
             * 而 creep 恰好就是在这段时间里执行的物流任务，就会出现如下错误逻辑：
             * mySpawnCreep 返回 OK > 推送填充任务 > creep 执行任务 > 发现能量都是满的 > **移除任务** > tick 末期开始孵化 > extension 扣除能量
             */
            return
        }

        if(spawn.spawning || this.spawnTaskQueue.length == 0) return

        const spwanRsult = this.spawnCreep(spawn,this.spawnTaskQueue[0]);

        if(spwanRsult === OK) this.removeCurrentTask()
    }

    spawnCreep(spawn:StructureSpawn,task:SpawnTask):ScreepsReturnCode{
        const creepWorkConfig = creepRoleConfigs[task.role]
        if(!creepWorkConfig) return OK

        let memory:CreepMemory = {...CREEP_DEFAULT_MEMORY,spawnRoom:this.room.name,role:task.role}
        memory.data = task.data
        const bodys = creepWorkConfig.body(this.room,spawn,memory.data)
        if(bodys.length <= 0) return ERR_NOT_ENOUGH_ENERGY

        const spwanRsult = spawn.spawnCreep(bodys,task.name,{memory})

        if(spwanRsult === OK) return OK

        if(spwanRsult == ERR_NAME_EXISTS) {
            Utils.log(`${task.name} 已经存在 ${this.roomName} 将不再生成`,["SpawnController"],false,"yellow")
            return OK  // 这里返回 ok，然后让外层方法移除对应的孵化任务
        }

        return spwanRsult
    }
}
