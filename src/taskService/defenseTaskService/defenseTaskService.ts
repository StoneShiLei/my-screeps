import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Inject, Singleton } from "typescript-ioc";
import { DefenseTaskNameEntity } from "./defenseTaskNameEntity";
import { DefenseTaskAction } from "./defenseTaskAction";



@Singleton
export class DefenseTaskService extends BaseTaskService{

    private _levelWallHits:{[level:number]:number} = {
        1:5000,
        2:5000,
        3:5000,
        4:5000,
        5:5000,
        6:1000000,
        7:3000000,
        8:120*1000000
    }

    private _needRepairWallMap:{[roomName:string]:string[]} = {}

    @Inject
    actions!: DefenseTaskAction;

    checkSafeMode(room:Room){
        let hostileCnt = room.find(FIND_HOSTILE_CREEPS,{filter:e => e.owner.username != "Invader" && e.body.filter(e=>e.type==HEAL && e.boost).length >= 5 }).length;
        if(!hostileCnt)return;

        let MyRuinCnt = room.find(FIND_RUINS,{filter:e=>
                e.structure.structureType!=STRUCTURE_ROAD
                &&e.structure.structureType!=STRUCTURE_CONTAINER
                &&e.structure.structureType!=STRUCTURE_RAMPART
                &&e.structure.structureType!=STRUCTURE_EXTRACTOR
                &&e.structure.structureType!=STRUCTURE_LINK
                && (e.structure as OwnedStructure).owner&&(e.structure as OwnedStructure).owner?.username==room.controller?.owner?.username}).length
        if(!MyRuinCnt)return;
        room.controller?.activateSafeMode()
    }

    checkNeedDefense(room:Room){
        const flag = room.flags("defense")?.head()
        if(flag) return
        const hostiles = room.find(FIND_HOSTILE_CREEPS,{filter:e => e.owner.username != "Invader"})
        if(!hostiles.length) return

        const healCount = hostiles.map(e => e.body.filter(e => e.type == HEAL && e.boost && (e.boost == "LHO2" || e.boost == "XLHO2")).length).reduce((a,b)=>a+b,0)
        if(room.level == 8 && healCount >= 25 || (room.level == 8 && healCount >= 12)){
            room.randomPosition().createFlag(`defense_${room.name}`)
        }
    }

    needBuildWall(room:Room):boolean{
        if(!this._needRepairWallMap[room.name]) return false
        const wall = Game.getObjectById<Structure>(this._needRepairWallMap[room.name].head())
        if(!wall) return false

        return wall && wall.hits < this._levelWallHits[room.level]
    }

    needBuildWallWithWorkerIdle(room:Room):boolean{
        if(!this._needRepairWallMap[room.name]) return false
        const wall = Game.getObjectById<Structure>(this._needRepairWallMap[room.name].head())
        if(!wall) return false

        return wall && wall.hits < 299 * 1000000
    }

    genRepairWallTask(room:Room):Task[]{
        if(!this._needRepairWallMap[room.name]) return []
        let wall:Structure | undefined | null = undefined
        while(this._needRepairWallMap[room.name].length && !wall){
            const wallId = this._needRepairWallMap[room.name].shift()
            wall = wallId ? Game.getObjectById<Structure>(wallId) : undefined
        }
        if(!wall) return []

        return [TaskHelper.genTaskWithTarget(wall,new DefenseTaskNameEntity("repairWall"),undefined,new DefenseTaskNameEntity(undefined,"registerInRoom"))]
    }

    update(room:Room){
        let needRepairs:Structure<StructureConstant>[] = []

        if(!room.memory.structMap) return
        if(!room.storage) return

        let created = false
        let hasConSite = room.find(FIND_CONSTRUCTION_SITES).length > 0

        //4级前不做防御  防不住
        if(!room.storage || !room.storage.my) return

        //闭包 如果有工地的情况下就不创建新的工地了
        function createWallOrRampart(pos:RoomPosition,type:BuildableStructureConstant):Structure<StructureConstant> | null {
            const needRepair = pos.lookFor(LOOK_STRUCTURES).filter(e => e.structureType == type).head()
            if(!needRepair && !hasConSite && !created){
                if(pos.createConstructionSite(type) == OK) created = true
            }
            if(needRepair) return needRepair
            return null
        }

        //将新创建好的墙存到数组里
        for(let struct of [STRUCTURE_WALL,STRUCTURE_RAMPART]){
            if(!room.memory.structMap[struct]) continue

            for(let posArray of room.memory.structMap[struct]){
                const createResult = createWallOrRampart(new RoomPosition(posArray[0],posArray[1],room.name),struct)
                if(createResult) needRepairs.push(createResult)
            }
        }

        if(created) return

        //给控制器添加墙
        const controllerRampartPos = room.controller?.pos.nearPos(1).filter(e => !e.isTerrainWall())
        controllerRampartPos?.forEach(e => {
            const result = createWallOrRampart(e,STRUCTURE_RAMPART)
            if(result) needRepairs.push(result)
        })

        if(created) return

        //8级后给建筑镀金
        const rampartCover = [STRUCTURE_SPAWN,STRUCTURE_TERMINAL,STRUCTURE_STORAGE,STRUCTURE_TOWER,STRUCTURE_POWER_SPAWN,STRUCTURE_FACTORY,STRUCTURE_NUKER,STRUCTURE_LAB]
        const coverMap:{[type in StructureConstant]?:number} = {}
        for(let i=0;i<rampartCover.length;i++){
            coverMap[rampartCover[i]] = i + 1
        }
        if(room.level >= 7){
            let needCoverMap = room.find(FIND_STRUCTURES,{filter:e=>coverMap[e.structureType]})
            needCoverMap = _.sortByOrder(needCoverMap,e => coverMap[e.structureType],["asc"])
            needCoverMap.forEach(e => {
                const result = createWallOrRampart(e.pos,STRUCTURE_RAMPART)
                if(result) needRepairs.push(result)
            })
        }

        //核弹防御
        const nukes = room.find(FIND_NUKES)
        needRepairs = _.flatten(needRepairs).filter(Boolean)
        const nukeHitsMap:{[key:string]:number} = {}
        if(nukes.length){
            needRepairs.forEach((e) => nukes.forEach(n =>{
                if(e.hits != e.hitsMax){
                    if(e.pos.isEqualTo(n)) nukeHitsMap[e.id] = (nukeHitsMap[e.id] || 0) + 10000000
                    else if(e.pos.inRangeTo(n,3)) nukeHitsMap[e.id] = (nukeHitsMap[e.id] || 0) + 5000000
                }
            }))
        }

        this._needRepairWallMap[room.name] = needRepairs.sort((a, b) => a.hits-(nukeHitsMap[a.id]||0) - b.hits+(nukeHitsMap[b.id]||0)).map(e => e.id)

        console.log(this._needRepairWallMap[room.name].map(a => Game.getObjectById<Structure>(a as string)?.hits).join(','))
    }


}
