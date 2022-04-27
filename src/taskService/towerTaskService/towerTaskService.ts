import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Container, Inject, Singleton } from "typescript-ioc";
import { TowerTaskNameEntity } from "./towerTaskNameEntity";
import { TowerTaskAction } from "./towerTaskAction";
import { TaskServiceProxy } from "taskService";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";


@Singleton
export class TowerTaskService extends BaseTaskService{

    @Inject
    actions!:TowerTaskAction

    private _towerRepairMap:{[id:string]:Id<AnyStructure>} = {}
    private _needRepairsRoomMap:{[roomName:string]:Id<AnyStructure>[]} = {}
    private _lastUpdateMap:{[roomName:string]:number} = {}
    private _lastAttackCreepMap:{[roomName:string]:{id?:Id<AnyCreep>,hits?:number}} = {}

    genFillTowerTask(room:Room):Task[]{
        const needFillTower = room.get<StructureTower[]>("tower").filter(t => t.store[RESOURCE_ENERGY] + (room._used && room._used[t.id] || 0) <= 600)
        const tasks = needFillTower.map(tower => TaskHelper.genTaskWithTarget(tower,new TransportTaskNameEntity("fillResource"),
        {resourceType:RESOURCE_ENERGY},new TowerTaskNameEntity(undefined,"registerTranEnergyInRoom")))
        return tasks
    }

    towerRun(room:Room){
        const service = Container.get(TaskServiceProxy)

        //检查安全模式是否需要开启
        service.defenseTaskService.checkSafeMode(room)
        //检查是否需要主动防御
        service.defenseTaskService.checkNeedDefense(room)

        if(!room.get<StructureTower[]>("tower").length) return

        if(!this._lastUpdateMap[room.name] || this._lastUpdateMap[room.name] <= 0){
            this._lastUpdateMap[room.name] = 10
            let hostiles = room.find(FIND_HOSTILE_CREEPS)

            let randomAttack:AnyCreep | undefined = undefined
            if(hostiles.length > 0){
                this._lastUpdateMap[room.name] = 0
                hostiles = hostiles.sort((a,b) => a.hits/a.hitsMax != b.hits/b.hitsMax ?
                    a.hits/a.hitsMax - b.hits/b.hitsMax : a.hits - b.hits)
            }

            if(!this._lastAttackCreepMap[room.name]) this._lastAttackCreepMap[room.name] = {}
            const lastAttack = this._lastAttackCreepMap[room.name]


            room.get<StructureTower[]>("tower").filter(e => !e._used).forEach(tower =>{
                let closestMyCreeps:AnyCreep | null = tower.pos.findClosestByRange(FIND_MY_CREEPS,{filter:e => e.hits != e.hitsMax})
                if(!closestMyCreeps) closestMyCreeps = tower.pos.findClosestByRange(FIND_MY_POWER_CREEPS,{filter:e => e.hits != e.hitsMax})
                if(hostiles.length == 0 && closestMyCreeps){
                    tower.heal(closestMyCreeps)
                    this._lastUpdateMap[room.name] = 0
                }

                if(hostiles.length){
                    const headHostiles = hostiles.head()
                    let lastTickHealable = lastAttack.id && lastAttack.hits && headHostiles.id == lastAttack.id &&
                                            lastAttack.hits <= headHostiles.hits

                    if(!lastTickHealable && headHostiles.hits != headHostiles.hitsMax){
                        tower.attack(headHostiles)
                        this._lastAttackCreepMap[room.name] = headHostiles
                    }
                    else{
                        if(Game.time % 15 == 0 && randomAttack){
                            tower.attack(randomAttack)
                        }
                        else if(Game.time % 15 == 7){
                            randomAttack = hostiles[Math.floor(hostiles.length * Math.random())]
                            tower.attack(randomAttack)
                        }
                    }
                    return
                }

                if(!this._needRepairsRoomMap[room.name]) this._needRepairsRoomMap[room.name] = []

                let targetId:Id<AnyStructure> | undefined = this._towerRepairMap[tower.id]
                if(!targetId)  targetId = this._needRepairsRoomMap[room.name].shift()
                if(!targetId) return

                const target = Game.getObjectById(targetId)
                if(!target || target.hits / target.hitsMax > 0.9){
                    const newTargetId = this._needRepairsRoomMap[room.name].shift()
                    if(!newTargetId) return
                    targetId = this._towerRepairMap[tower.id] = newTargetId
                }
                if(target){
                    tower.repair(target)
                    this._lastUpdateMap[room.name] = 0
                }
            })
        }
        this._lastUpdateMap[room.name]--
    }

    update(room:Room){
        this._lastUpdateMap[room.name] = (this._lastUpdateMap[room.name] || 0) -1

        let roadNeedRepair:{[key:number]:number} | undefined = undefined
        if(room.memory.structMap && room.memory.structMap[STRUCTURE_ROAD]){
            const roadPos = room.memory.structMap[STRUCTURE_ROAD]
            roadNeedRepair = {}
            roadPos.forEach(pos =>{ if(roadNeedRepair) roadNeedRepair[pos[0]*50 + pos[1]] = 1})
        }

        this._needRepairsRoomMap[room.name] = room.find<AnyStructure>(FIND_STRUCTURES)
            .filter(s => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART)
            .filter(s => s.hits < s.hitsMax * 0.8 && s.hits < 10000000)
            .filter(s => (!roadNeedRepair || roadNeedRepair[s.pos.x*50 + s.pos.y]) || s.structureType != STRUCTURE_ROAD)
            .sort((a,b) => a.hits - b.hitsMax)
            .map(e => e.id)
    }



}
