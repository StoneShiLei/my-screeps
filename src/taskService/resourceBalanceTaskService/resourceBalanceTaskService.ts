import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Container, Inject, Singleton } from "typescript-ioc";
import { ResourceBalanceTaskNameEntity } from "./resourceBalanceTaskNameEntity";
import { ResourceBalanceTaskAction } from "./resourceBalanceTaskAction";
import { filter } from "lodash";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";
import { SpawnTaskService } from "taskService/spawnTaskService/spawnTaskService";
import { BodyConfig } from "modules/bodyConfig/bodyConfig";

@Singleton
export class ResourceBalanceTaskService extends BaseTaskService{

    @Inject
    actions!: ResourceBalanceTaskAction;



    resourceBalanceRun(room:Room){
        const interval = Game.time + room.hashCode();
        if(interval % 10 != 0) return

        if(!room.storage || !room.storage.my || !room.terminal || !room.terminal.my) return


    }
}
