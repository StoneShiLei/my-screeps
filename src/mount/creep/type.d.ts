
interface Creep{
    addTask(task:Task):void
    addTask(task:Task[]):void

    removeTopTask():void

    doTopTaskJob():void

    registerMyTasks():void
    unregisterMyTopTask():void

    get bottomTask():Task
    get topTask():Task
    get tasks():Task[]
}

interface CreepMemory{

}
