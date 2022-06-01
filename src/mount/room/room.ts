import { TaskServiceProxy } from "taskService"
import { Inject } from "typescript-ioc"
import Utils from "utils/utils"

export class RoomExtension extends Room {

    private _creeps:{[key in string]:Creep[]} = {}
    private _flags:{[key in string]:Flag[]} = {}

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
        if(!this.my){
            this.memory.roomLevel = 'low'
        }
        else{
            const level = this.level ?? 0
            if(level < 3) this.memory.roomLevel = 'low'
            else if(level < 4 || !this.storage || !this.storage.my) this.memory.roomLevel = 'middle'
            else this.memory.roomLevel = 'high'
        }


        //更新建筑缓存
        this.update()

        //更新souce配套设施缓存
        this._taskService.sourceTaskService.update(this)

        //更新storage配套设施缓存
        this._taskService.transportTaskService.update(this)

        //更新controller配套设施缓存
        this._taskService.upgradeTaskService.update(this)

        //更新tower缓存目标
        this._taskService.towerTaskService.update(this)

        //更新mineral配套设施缓存
        this._taskService.mineralTaskService.update(this)

        //更新围墙建筑缓存
        this._taskService.defenseTaskService.update(this)
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

        const extEnergyCount = exts.filter(ext => ext.isActive()).reduce((a,b) => a + b.store.getCapacity("energy"),0)
        const spawnEnergyCount = spawns.filter(spawn => spawn.isActive()).reduce((a,b) => a + b.store.getCapacity("energy"),0)

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

    constructionIsNeedBuild():boolean{
        const sites = this.get(LOOK_CONSTRUCTION_SITES) as unknown as ConstructionSite[]
        return sites && sites.length > 0
    }

    setFlags(flags:Flag[]){

        this._flags = this._flags || {}
        this._flags["flags"] = flags
    }

    flags(prefix?:string):Flag[] | undefined{
        this._flags = this._flags || {}
        this._flags['flags'] = this._flags['flags'] || []

        if(prefix){
            const key = `${prefix}_flags`
            let flags = this._flags[key]

            if(!flags){
                flags = this._flags['flags'].filter(e => e.getPrefix() == prefix)
                this._flags[key] = flags
            }

            return flags
        }
        else return this._flags['flags']
    }
}
