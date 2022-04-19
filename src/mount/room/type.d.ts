
interface Room {

    roomLevel:RoomLevel

    hashCode():number
    setCreeps(creeps:Creep[]):void
    creeps(role?:Role,spawned?:boolean):Creep[]
    update():void
}

interface RoomMemory {
    hashCode:number
}


type RoomLevel = 'Low' | 'middle' | 'high'
