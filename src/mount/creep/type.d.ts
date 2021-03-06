
interface Creep{
    bottomTask:Task
    topTask:Task
    tasks:Task[]
    topTarget:TaskTarget | null
    mainRoom:Room

    addTask(task:Task | undefined):Creep
    addTask(task:Task[] | undefined[]):Creep

    popTopTask():Creep
    doWorkWithTopTask():void

    hasTasks():boolean
    isIdle():boolean

    registerMyTasks():void
    unregisterMyTopTask():void

    goTo(): GotoReturnCode
    goTo(target:RoomObject): GotoReturnCode
    goTo(target:RoomPosition): GotoReturnCode
    goTo(target?:Task):GotoReturnCode

    storeHaveOtherResourceType(resourceType:ResourceConstant,emptyCase:boolean):boolean
    storeUsed():number
    storeUnused():number
    storeIsFull():boolean
    storeIsEmpty():boolean

    sayTopTask():void
}

interface CreepMemory{
    roomName:string
    dontPullMe?:boolean
}


type GotoReturnCode = CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND
