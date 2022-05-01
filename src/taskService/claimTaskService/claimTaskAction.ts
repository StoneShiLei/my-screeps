import { BaseTaskAction } from "taskService/baseTaskAction";
import { SpawnTaskNameEntity } from "taskService/spawnTaskService/spawnTaskNameEntity";
import { TaskHelper } from "taskService/taskHelper";
import { Singleton } from "typescript-ioc";
import Utils from "utils/utils";

export type ClaimActionName = 'claimRoom'
export type ClaimRegName = ''


@Singleton
export class ClaimTaskAction extends BaseTaskAction {

    claimRoom(creep:Creep){
        const task = creep.topTask
        const pos = new RoomPosition(task.x,task.y,task.roomName);
        if(creep.hitsMax != creep.hits && (creep.room.controller && creep.pos.isNearTo(creep.room.controller || !creep.room.controller))) creep.heal(creep)

        if(creep.room.name != pos.roomName){
            creep.goTo(pos)
            return
        }

        if(creep.room.my){
            creep.say("claim OK")
            if(creep.ticksToLive && creep.ticksToLive > 350 && creep.mainRoom){
                creep.popTopTask().addTask(TaskHelper.genTaskWithAnyData(new SpawnTaskNameEntity("recycleCreep")))
            }
            return
        }

        if(!creep.room.controller){
            creep.say("wrong room")
            return
        }

        if(creep.claimController(creep.room.controller) != OK){
            creep.goTo(creep.room.controller)

            //如果控制器有归属，则进行攻击，攻击完进行回收
            if(creep.room.controller.pos.isNearTo(creep)){
                if(creep.attackController(creep.room.controller) == OK){
                    if(creep.ticksToLive && creep.ticksToLive > 350 && creep.mainRoom){
                        creep.popTopTask().addTask(TaskHelper.genTaskWithAnyData(new SpawnTaskNameEntity("recycleCreep")))
                    }

                    if(!creep.memory._signed && creep.signController(creep.room.controller,"I want this!") == OK) creep.memory._signed = true
                }
            }
        }


    }
}
