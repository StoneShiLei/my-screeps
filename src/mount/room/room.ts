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
        debugger
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

    update():void{
        const level = this.controller?.level ?? 0
        if(level < 3) this.roomLevel = 'Low'
        else if(level < 4 || !this.storage || !this.storage.my) this.roomLevel = 'middle'
        else this.roomLevel = 'high'
    }
}
