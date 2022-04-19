import { BaseTaskService } from "taskService/baseTaskService";
import { Inject, Singleton } from "typescript-ioc";
import Utils from "utils/utils";
import { SpawnTaskAction } from "./spawnTaskAction";

@Singleton
export class SpawnTaskService extends BaseTaskService{

    @Inject
    actions!:SpawnTaskAction





    // registerTask(creep:Creep):void{
    //     console
    // }

    private genName(){
        return `0x${Utils.randomId()}`
    }
}
