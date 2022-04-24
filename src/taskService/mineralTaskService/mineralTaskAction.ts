import { BaseTaskAction } from "taskService/baseTaskAction";
import { Singleton } from "typescript-ioc";

export type MineralActionName = '1111' | '222'
export type MineralRegName = 'registerMineralTranInRoom'

@Singleton
export class MineralTaskAction extends BaseTaskAction {

    registerMineralTranInRoom(creep:Creep){
        const room = Game.rooms[creep.memory.roomName]
        room._used = room._used || {}
        room._used[creep.topTask.targetId] = 1
    }
}
