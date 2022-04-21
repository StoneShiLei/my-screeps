
interface Room {

    hashCode():number
    setCreeps(creeps:Creep[]):void
    creeps(role?:Role,spawned?:boolean):Creep[]

    updateRoomInfo():void

    isDownGrade():boolean
    getEnergyAvailable():number
    getEnergyCapacityAvailable():number

    randomPosition():RoomPosition

    isRoomMassStore(target:AnyStoreStructure):boolean
    roomMassStroeUsedCapacity(resourceType:ResourceConstant):number

    hiveIsNeedToFill():boolean
    getClosestSpawnRoom(level:number,minLevel:number,minRoomDistinct:number):Room | undefined

    constructionIsNeedBuild():boolean
}

interface RoomMemory {
    hashCode:number
    roomLevel:RoomLevel
}


type RoomLevel = 'low' | 'middle' | 'high'
