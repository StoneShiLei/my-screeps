import Utils from "utils/utils"

export class RoomExtension extends Room {

    private _creeps:{[key in string]:Creep[]} = {}
    public roomLevel: RoomLevel = 'Low'

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

    creeps(role?:Role,spawned?:boolean):Creep[]{

        if(!this._creeps) return []

        if(!spawned) spawned = true

        if(role){
            const key = spawned ? `${role}_spawned` : role
            if(this._creeps[key]) return this._creeps[key]

            const roleCreeps =  this._creeps[key].filter(creep => creep.memory.role === role)
            this._creeps[key] = roleCreeps
            return roleCreeps
        }
        else{
            if(!spawned) return this._creeps['creeps']

            const key = 'creeps_spawned'
            if(this._creeps[key]) return this._creeps[key]

            const spawnedCreeps = this._creeps['creeps'].filter(creep => !creep.spawning)
            this._creeps[key] = spawnedCreeps
            return spawnedCreeps
        }
    }

    updateRoomInfo():void{
        const level = this.controller?.level ?? 0
        if(level < 3) this.roomLevel = 'Low'
        else if(level < 4 || !this.storage || !this.storage.my) this.roomLevel = 'middle'
        else this.roomLevel = 'high'
    }

    isDownGrade():boolean{
        if(!this.controller) return false

        const roomExtNum = (this.get(STRUCTURE_EXTENSION) as StructureExtension[]).length
        const thisLevelExtNum = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.level]

        //判断是否降级
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
}
