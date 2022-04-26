
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

    constructionIsNeedBuild():boolean

    setFlags(flags:Flag[]):void
    flags(prefix?:string):Flag[] | undefined
}

interface RoomMemory {
    hashCode:number
    roomLevel:RoomLevel
}


type RoomLevel = 'low' | 'middle' | 'high'
