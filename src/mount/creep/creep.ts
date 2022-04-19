import { TaskAction, TaskServiceProxy } from "taskService";
import { Inject } from "typescript-ioc";

export class CreepExtension extends Creep {

    @Inject
    private _taskService!: TaskServiceProxy;


    addTask(this:Creep,task:Task):Creep;
    addTask(this:Creep,task:Task[]):Creep;
    addTask(this:Creep,task:Task | Task[]):Creep{
        if(task instanceof Array){
            _.forEach(task,(task) =>{
                this.tasks.push(task)
            })
        }
        else{
            this.tasks.push(task)
        }

        return this
    }

    popTopTask(this:Creep):Creep{
       this.tasks.pop()
       return this
    }

    doWorkWithTopTask():void{
        if(this.hasTask()){
            const action = this.getTopAction()
            action(this)
        }
    }

    hasTask():boolean{
        return this.tasks.length > 0
    }

    registerMyTasks(){
        _.forEach(this.tasks,(task) =>{
            if(task.haveToReg){
                this._taskService[task.serviceName as keyof TaskServiceProxy].registerTask(this)
            }
        })
    }

    unregisterMyTopTask(){
        if(!this.topTask.haveToUnreg) return
        this._taskService[this.topTask.serviceName as keyof TaskServiceProxy].unregisterTask(this)
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

    goTo(): GotoReturnCode
    goTo(target:Task): GotoReturnCode
    goTo(target:RoomObject): GotoReturnCode
    goTo(target?:RoomObject | Task): GotoReturnCode{
        if(!target) {
            const pos = new RoomPosition(this.topTask.x,this.topTask.y,this.topTask.roomName)
            return this.moveTo(pos)
        } else if('pos' in target){
            return this.moveTo(target.pos)
        } else {
            const pos = new RoomPosition(target.x,target.y,target.roomName)
            return this.moveTo(pos)
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
