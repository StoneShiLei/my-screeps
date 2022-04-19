import { TaskAction, TaskService, TaskServiceProxy } from "taskService";
import { SpawnTaskService } from "taskService/spawnTaskService/spawnTaskService";
import { Inject } from "typescript-ioc";

export class CreepExtension extends Creep {

    @Inject
    private _taskService!: TaskServiceProxy;


    addTask(task:Task):void;
    addTask(task:Task[]):void;
    addTask(task:Task | Task[]):void{
        if(task instanceof Array){
            _.forEach(task,(task) =>{
                this.tasks.push(task)
            })
        }
        else{
            this.tasks.push(task)
        }
    }

    removeTopTask(){
        this.tasks.pop()
    }

    doTopTaskJob(){
        const action = this.getTopAction()
        action(this)
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

    get bottomTask():Task{
        return this.tasks.head()
    }

    get topTask():Task{
        return this.tasks.last()
    }

    get tasks():Task[]{
        if(!this.memory.tasks) this.memory.tasks = []
        return this.memory.tasks
    }

    private getTopAction():TaskFunction{
        const task = this.topTask
       return this._taskService[task.serviceName as keyof TaskServiceProxy].actions[task.actionName as keyof TaskAction]
    }
}
