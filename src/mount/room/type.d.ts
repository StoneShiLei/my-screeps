
interface Room {

    roomLevel:RoomLevel

    hashCode():number
    setCreeps(creeps:Creep[]):void
    creeps(role?:Role,spawned?:boolean):Creep[]

    updateRoomInfo():void

    isDownGrade():boolean
    getEnergyAvailable():number
    getEnergyCapacityAvailable():number

    randomPosition():RoomPosition
}

interface RoomMemory {
    hashCode:number
}


type RoomLevel = 'Low' | 'middle' | 'high'
