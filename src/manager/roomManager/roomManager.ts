import { BaseManager } from "manager/BaseManager";
import { AppLifecycleCallbacks } from "modules/framework/types";
import { Container, Inject, Singleton } from "typescript-ioc";
import { superMove } from 'modules/superMove'
import { ErrorHelper } from "utils/erroHelper";
import { TaskServiceProxy } from "taskService";
import { roomLevelStrategy } from "./roomLevelStrategy";
import { first } from "lodash";

@Singleton
export class RoomManager extends BaseManager{

    private _firstActive:boolean = true;

    tickStart(): void {
        //更新房间信息
        Object.values(Game.rooms).forEach(room => {
            const interval = Game.time + room.hashCode()

            if(interval % 301 === 0 || this._firstActive){
                superMove.deletePathInRoom(room.name)
            }

            if(interval % 31 === 0 || this._firstActive){
                this._firstActive = false;

                ErrorHelper.catchError(()=>room.updateRoomInfo())
                if(room.storage && room.storage.store.getFreeCapacity() <= 0) console.log(`${room.name} storage is full`)
            }
         })

    }
    tickEnd(): void {
        const service = Container.get(TaskServiceProxy)

        //处理spawn队列
        Object.values(Game.rooms).forEach(room => {
            ErrorHelper.catchError(()=> service.spawnTaskService.handleSpawn(room)  ,room.name)
        })

    }
    run(room: Room): void {
        const interval = Game.time + room.hashCode()
        if(interval % 3 === 0 || this._firstActive){
            if(room.memory.roomLevel == 'low') roomLevelStrategy.lowLevel(room)
            else if(room.memory.roomLevel == 'middle') roomLevelStrategy.lowLevel(room) // ?
            else roomLevelStrategy.highLevel(room)
        }
    }

}



