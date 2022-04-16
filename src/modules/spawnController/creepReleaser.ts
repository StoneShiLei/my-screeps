import BodyAutoConfig from "modules/bodyConfig/bodyConfig";
import { CREEP_DEFAULT_MEMORY } from "settings";
import Utils from "utils/utils";
import { CreepNameGenerator } from "./creepNameGenerator";
import { creepRoleConfigs } from "role";
import { max, words } from "lodash";
import RoomSpawnController from "./spawnController";
import SpawnTask from "./spawnTask";


export default class CreepReleaser {

    readonly spawnController:RoomSpawnController

    constructor(spawnController:RoomSpawnController){
        this.spawnController = spawnController;
    }

    releaseHarvester():OK|ERR_NOT_FOUND{
        if(!this.spawnController.room.sources){
            this.spawnController.room.sources = this.spawnController.room.find(FIND_SOURCES)
        }

        const roomName = this.spawnController.room.name;
        const sources = this.spawnController.room.sources;

        if(sources.length == 0) return ERR_NOT_FOUND

        sources.map((source,index) =>{
            this.spawnController.addTask(new SpawnTask(CreepNameGenerator.harvester(roomName,index),"harvester",{
                harvesterData:{workRoom:roomName,harvestRoom:roomName,sourceID:source.id,id:index}
            }))
        })

        return OK
    }

    releaseBaseUnit(type:BaseUnits,num:number):OK {
        const room = this.spawnController.room
        debugger
        const creeps = this.spawnController.room.find(FIND_MY_CREEPS,{filter:creep => creep.memory.role == type &&
            ((type === 'transporter' && creep.memory.data.transporterData?.workRoom == room.name) ||
            (type === 'worker' && creep.memory.data.workerData?.workRoom === room.name)) })

        let maxId:number

        if(creeps.length == 0){
            maxId = -1
        }
        else{
            if(type === 'transporter'){
                maxId = _.max(creeps,(creep) => creep.memory.data.transporterData?.id).memory.data.transporterData?.id || 0
            }
            else{
                maxId = _.max(creeps,(creep) => creep.memory.data.workerData?.id).memory.data.workerData?.id || 0
            }
        }



        for(let i=maxId+1;i<maxId+num+1;i++){
            const creepName = CreepNameGenerator[type](room.name,i)
            if(creepName in Game.creeps) continue

            this.spawnController.addTask({
                name:creepName,
                role:type,
                data:type === 'worker'? {workerData:{workRoom:room.name,id:i}} :{transporterData:{workRoom:room.name,id:i}}
            })
        }

        return OK
    }

    removeBaseUnit(type:BaseUnits,num:number,immediate:boolean):OK {
        const room = this.spawnController.room

        const creeps = this.spawnController.room.find(FIND_MY_CREEPS,{filter:creep => creep.memory.role == type &&
            ((type === 'transporter' && creep.memory.data.transporterData?.workRoom == room.name) ||
            (type === 'worker' && creep.memory.data.workerData?.workRoom === room.name)) })

        let maxId:number
        if(type === 'transporter'){
            maxId = _.max(creeps,(creep) => creep.memory.data.transporterData?.id).memory.data.transporterData?.id || 0
        }
        else{
            maxId = _.max(creeps,(creep) => creep.memory.data.workerData?.id).memory.data.workerData?.id || 0
        }

        for(let i=maxId;i>=0;i--){
            let creep:Creep | null
            if(type === 'transporter'){
                creep = _.find(creeps,(creep) => creep.memory.data.transporterData?.id == i) ?? null
            }
            else{
                creep = _.find(creeps,(creep) => creep.memory.data.workerData?.id == i) ?? null
            }

            if(creep){
                if(immediate){
                    delete Memory.creeps[creep.name]
                    creep.suicide()
                }
                else{
                    creep.memory.cantRespawn = true
                }
            }
        }

        return OK
    }
}
