import { BodyConfig } from "modules/bodyConfig/bodyConfig"
import { BaseTaskAction } from "taskService/baseTaskAction"
import { Singleton } from "typescript-ioc"

export type TowerActionName = ''
export type TowerRegName = 'registerTowerFillInRoom'

@Singleton
export class TowerTaskAction extends BaseTaskAction {

    registerTowerFillInRoom(creep:Creep){
        const room = Game.rooms[creep.memory.roomName]
        room._used = room._used || {}
        const id = creep.topTask.targetId
        room._used[id] = (room._used[id] || 0) + BodyConfig.getPartCount(creep,CARRY) * 50
    }
}
