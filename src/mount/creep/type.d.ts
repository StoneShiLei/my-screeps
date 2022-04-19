
interface Creep{
    bottomTask:Task
    topTask:Task
    tasks:Task[]

    addTask(task:Task):Creep
    addTask(task:Task[]):Creep
    popTopTask():Creep

    doWorkWithTopTask():void

    hasTask():boolean

    registerMyTasks():void
    unregisterMyTopTask():void

    goTo(): GotoReturnCode
    goTo(target:RoomObject): GotoReturnCode
    goTo(target?:Task):GotoReturnCode
}

interface CreepMemory{
    roomName:string
    dontPullMe:boolean
}


type GotoReturnCode = CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND
