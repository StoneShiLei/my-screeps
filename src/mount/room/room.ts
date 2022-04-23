import { TaskServiceProxy } from "taskService"
import { Inject } from "typescript-ioc"
import Utils from "utils/utils"

export class RoomExtension extends Room {

    private _creeps:{[key in string]:Creep[]} = {}

    @Inject
    private _taskService!:TaskServiceProxy

    hashCode():number {
        if(this.memory.hashCode) return this.memory.hashCode

        const hash = Utils.randomNum(Utils.hashCode(this.name))
        this.memory.hashCode = hash
        return hash
    }

    setCreeps(creeps:Creep[]):void{
        if(!this._creeps) this._creeps = {}
        this._creeps['creeps'] = creeps
    }

    creeps(role?:Role,spawned:boolean = true):Creep[]{
        if(!this._creeps) return []

        if(role){
            const key = spawned ? `${role}_spawned` : role
            if(this._creeps[key]) return this._creeps[key]

            this._creeps[key] = []
            const roleCreeps =  this._creeps['creeps'].filter(creep => creep.memory.role === role)
            this._creeps[key] = spawned ? roleCreeps.filter(creep => !creep.spawning) : roleCreeps
            return roleCreeps
        }
        else{
            if(!spawned) return this._creeps['creeps']

            const key = 'creeps_spawned'
            if(this._creeps[key]) return this._creeps[key]

            this._creeps[key] = []
            const spawnedCreeps = this._creeps['creeps'].filter(creep => !creep.spawning)
            this._creeps[key] = spawnedCreeps
            return spawnedCreeps
        }
    }

    updateRoomInfo():void{
        const level = this.controller?.level ?? 0
        if(level < 3) this.memory.roomLevel = 'low'
        else if(level < 4 || !this.storage || !this.storage.my) this.memory.roomLevel = 'middle'
        else this.memory.roomLevel = 'high'

        //更新建筑缓存
        this.update()
        //更新souce配套设施缓存
        this._taskService.sourceTaskService.update(this)

        //更新controller配套设施缓存
        this._taskService.upgradeTaskService.update(this)

        //更新tower缓存目标
        this._taskService.towerTaskService.update(this)
    }


    isDownGrade():boolean{
        if(!this.controller) return false

        const roomExtNum = (this.get(STRUCTURE_EXTENSION) as StructureExtension[]).length
        const thisLevelExtNum = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.level]

        return this.controller.progressTotal < this.controller.progress || (roomExtNum > thisLevelExtNum)
    }

    getEnergyAvailable():number{
        if(!this.isDownGrade()) return this.energyAvailable

        const exts = this.get(STRUCTURE_EXTENSION) as StructureExtension[]
        const spawns = this.get(STRUCTURE_SPAWN) as StructureSpawn[]

        const extEnergyCount = exts.filter(ext => ext.isActive()).reduce((a,b) => a + b.store[RESOURCE_ENERGY],0)
        const spawnEnergyCount = spawns.filter(spawn => spawn.isActive()).reduce((a,b) => a + b.store[RESOURCE_ENERGY],0)
        return extEnergyCount + spawnEnergyCount
    }

    getEnergyCapacityAvailable():number{
        if(!this.isDownGrade()) return this.energyCapacityAvailable

        const exts = this.get(STRUCTURE_EXTENSION) as StructureExtension[]
        const spawns = this.get(STRUCTURE_SPAWN) as StructureSpawn[]

        const extEnergyCount = exts.filter(ext => ext.isActive()).reduce((a,b) => a + b.store.getCapacity<RESOURCE_ENERGY>(),0)
        const spawnEnergyCount = spawns.filter(spawn => spawn.isActive()).reduce((a,b) => a + b.store.getCapacity<RESOURCE_ENERGY>(),0)
        return extEnergyCount + spawnEnergyCount
    }

    randomPosition():RoomPosition{
        return new RoomPosition(Utils.randomNumRange(1,49),Utils.randomNumRange(1,49),this.name)
    }

    isRoomMassStore(target:AnyStoreStructure):boolean{
        return this.storage?.id == target.id || this.terminal?.id == target.id
    }

    roomMassStroeUsedCapacity(resourceType:ResourceConstant):number{
        let count = 0;
        if(this.storage) count += this.storage.store.getCapacity(resourceType) ?? 0;
        if(this.terminal) count += this.terminal.store.getCapacity(resourceType) ?? 0;
        return count;
    }

    hiveIsNeedToFill():boolean{
        return this.energyAvailable + (this._hiveEnergySending ?? 0) < this.energyCapacityAvailable;
    }

    getClosestSpawnRoom(level:number = 7,minLevel:number=4,minRoomDistinct:number = 10):Room | undefined{

        const spawns = this.get('spawn') as StructureSpawn[]
        if(spawns && spawns.length > 0 && this.level >= level) return this;


        type RoteResult = Array<{
            exit: ExitConstant;
            room: string;
        }>
        const getDistinct = function(roomName1:string,roomName2:string):RoteResult | null{
            let distance: number= Game.map.getRoomLinearDistance(roomName1,roomName2,false)
            if(distance >= minRoomDistinct)return null

            const routeResult = Game.map.findRoute(roomName1,roomName2)
            if(routeResult == ERR_NO_PATH) return null
            return routeResult
        }

        let resultRoom:Room | undefined = undefined;
        type DistinctType = [Room,RoteResult | null];
        while(!resultRoom&&level >= minLevel){
            const rooms = _.values<Room>(Game.rooms).filter(r => r.my && r.find(FIND_MY_SPAWNS).length && r.level >= level)
            const route:DistinctType[] = rooms.map(r => [r,getDistinct(this.name,r.name)])
            const temp = _.filter(route,(r) => r[1]!=null && r[1].length <= minRoomDistinct)
            resultRoom = temp.sort((a:DistinctType,b:DistinctType) => (a[1]?.length ?? 0) - (b[1]?.length ?? 0)).map(r =>r[0]).head()
            level--
        }
        if(resultRoom) return resultRoom
        else if(spawns && spawns.length > 0) return this
        else return undefined
    }

    constructionIsNeedBuild():boolean{
        const sites = this.get(LOOK_CONSTRUCTION_SITES) as unknown as ConstructionSite[]
        return sites && sites.length > 0
    }
}
