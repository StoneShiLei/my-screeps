import { TaskAction, TaskServiceProxy } from "taskService";
import { Inject } from "typescript-ioc";
import autoPlanner63 from "autoPlanner63"

export class CreepExtension extends Creep {

    @Inject
    private _taskService!: TaskServiceProxy;


    addTask(task:Task | undefined):Creep;
    addTask(task:Task[] | undefined[]):Creep;
    addTask(task:Task | Task[] | undefined | undefined[]):Creep{
        if(task instanceof Array){
            _.forEach(task,(task) =>{
                if(task)
                    this.tasks.push(task)
            })
        }
        else{
            if(task)
                this.tasks.push(task)
        }

        return this
    }

    popTopTask():Creep{
       this.tasks.pop()
       return this
    }

    doWorkWithTopTask():void{
        if(this.hasTasks()){
            const action = this.getTopAction()
            action(this)
        }
        else{
            this.memory.dontPullMe = false;
        }
    }

    topTargetGetter():TaskTarget | null{
        if(!this.hasTasks()) return null

        const target = Game.getObjectById<TaskTarget>(this.topTask.targetId)
        return target
    }

    hasTasks():boolean{
        return this.tasks.length > 0
    }

    isIdle():boolean{
        return !this.tasks.length
    }

    registerMyTasks(){
        _.forEach(this.tasks,(task) =>{
            if(task.regName && task.regServiceName){
                const regFunc:(creep:Creep) => void = this._taskService[task.regServiceName as keyof TaskServiceProxy].actions[task.regName as keyof TaskAction]

                regFunc(this)
            }
        })
    }

    unregisterMyTopTask(){
        if(!this.topTask.unregName) return
        const unregFunc:(creep:Creep) => void = this._taskService[this.topTask.regServiceName as keyof TaskServiceProxy].actions[this.topTask.unregName as keyof TaskAction]
        unregFunc(this)
    }

    bottomTaskGetter():Task{
        return this.tasks.head()
    }

    topTaskGetter():Task{
        return this.tasks.last()
    }

    tasksGetter():Task[]{
        if(!this.memory.tasks) this.memory.tasks = []
        return this.memory.tasks
    }

    mainRoomGetter():Room{
        const roomName = this.memory.roomName
        if(!roomName) throw Error(`Creep ${this.name} has no roomName`)
        const room =  Game.rooms[roomName]
        if(!room) throw Error(`Room ${roomName} not found`)
        return room
    }

    /**
     * 是否有指定资源以外的其他资源，
     * 如果有，则返回true，否则返回false
     * @param resourceType 要排除的资源类型，默认energy
     * @param emptyCase 是否把store为空的情况也算作有资源
     * @returns
     */
    storeHaveOtherResourceType(resourceType:ResourceConstant = RESOURCE_ENERGY,emptyCase:boolean = false):boolean{
        if(emptyCase && this.storeIsEmpty()) return true
        else if(this.storeIsEmpty()) return false
        else{
            const resourceTypes = _.without(_.keys(this.store),resourceType)
            return resourceTypes.length > 0
        }
    }

    storeUsed():number{
        return this.store.getUsedCapacity()
    }

    storeUnused():number{
        return this.store.getFreeCapacity()
    }

    /**
     * store为满
     * @returns
     */
    storeIsFull():boolean{
        return this.store.getFreeCapacity() <= 0
    }

    /**
     * store为空
     * @returns
     */
    storeIsEmpty():boolean{
        return this.store.getUsedCapacity() == 0
    }

    goTo(): GotoReturnCode
    goTo(target:Task): GotoReturnCode
    goTo(target:RoomObject): GotoReturnCode
    goTo(target?:RoomObject | Task): GotoReturnCode{
        if(!target) {
            const pos = new RoomPosition(this.topTask.x,this.topTask.y,this.topTask.roomName)
            return this.moveTo(pos,{ visualizePathStyle:{stroke: '#67ffed'} })
        } else if('pos' in target){
            return this.moveTo(target.pos,{ visualizePathStyle:{stroke: '#67ffed'} })
        } else {
            const pos = new RoomPosition(target.x,target.y,target.roomName)
            return this.moveTo(pos,{ visualizePathStyle:{stroke: '#67ffed'} })
        }
    }

    sayTopTask():void{
        const task = this.topTask
        if(task){
            // this.say(task.actionName)
            autoPlanner63.HelperVisual.showText(this,task.actionName)
        }
    }

    private getTopAction():TaskFunction{
        const task = this.topTask
        const action = this._taskService[task.serviceName as keyof TaskServiceProxy].actions[task.actionName as keyof TaskAction]
        if(action)  {
            return action
        }
        else{
            throw Error(`Action ${task.actionName} not found in service ${task.serviceName}`)
        }
    }


}
