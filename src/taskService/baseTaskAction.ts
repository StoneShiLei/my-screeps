import { BodyConfig } from "modules/bodyConfig/bodyConfig"

export type BaseActionName = '1111' | '222'
export type BaseRegName = 'registerInRoom' | 'registerTranEnergyInRoom'

export abstract class BaseTaskAction{

    registerInRoom(creep:Creep){
        const room = Game.rooms[creep.memory.roomName]
        room._used = room._used || {}
        room._used[creep.topTask.targetId] = 1
    }

    registerTranEnergyInRoom(creep:Creep){
        const room = Game.rooms[creep.memory.roomName]
        room._used = room._used || {}
        const id:string = creep.topTask.targetId
        room._used[id] = (room._used[id] || 0) + BodyConfig.getPartCount(creep,CARRY) * 50
    }
}
