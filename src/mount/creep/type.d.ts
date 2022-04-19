
interface Creep{
    bottomTask:Task
    topTask:Task
    tasks:Task[]

    addTask(task:Task):void
    addTask(task:Task[]):void

    removeTopTask():void

    doTopTaskJob():void

    registerMyTasks():void
    unregisterMyTopTask():void
}

// interface CreepMemory{

// }
