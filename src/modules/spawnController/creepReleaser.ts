import BodyAutoConfig from "modules/bodyConfig/bodyConfig";
import { CREEP_DEFAULT_MEMORY } from "settings";
import Utils from "utils/utils";
import { CreepNameGenerator } from "./creepNameGenerator";
import { creepRoleConfigs } from "role";


export default class CreepReleaser {

    protected roomName:string

    constructor(roomName:string){
        this.roomName = roomName;
    }

    public get room():Room{
        if(!Game.rooms[this.roomName]){
            Utils.log(`无法访问房间实例，模块已停止运行`, ["CreepReleaser"],  true,'red')
            throw new Error(`${this.roomName} CreepReleaser 房间实例不存在`)
        }
        return Game.rooms[this.roomName]
    }

    /**
     * 发布采集者  如果已经有同名的了则跳过
     */
    public releaseHarvester(){
        if(!this.room.sources){
            this.room.sources = this.room.find(FIND_SOURCES).sort();
        }

        const sources = this.room.sources;
        (sources || []).map((souce,index) =>{
            const creepName = CreepNameGenerator.harvester(this.roomName,index)
            if(this.room.find(FIND_MY_CREEPS).filter(creep => creep.name == creepName).length != 0) return

            const creepMemory = CREEP_DEFAULT_MEMORY
            creepMemory.role = 'harvester'
            creepMemory.working = false
            creepMemory.spawnRoom = this.roomName
            creepMemory.data.harvesterData = {
                sourceID:souce.id,
                targetID:souce.getContainer()?.id,
                workRoom:this.roomName,
                harvestRoom:this.roomName,
            }



            this.room.find(FIND_MY_SPAWNS).map((spawn) =>{
                const bodyParts = creepRoleConfigs["harvester"].body(this.room,spawn,creepMemory.data)

                let resultCode:ScreepsReturnCode
                if(Memory.creeps[creepName]){
                    resultCode = spawn.spawnCreep(bodyParts, creepName);
                }
                else{
                    resultCode = spawn.spawnCreep(bodyParts, creepName, { memory: creepMemory});
                }

                if(resultCode == OK) return
            })
        })
    }
}
