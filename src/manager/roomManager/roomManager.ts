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
        const service = Container.get(TaskServiceProxy)

        Object.values(Game.rooms).forEach(room => {
            if(!room) return
            const interval = Game.time + room.hashCode()


            if(interval % 301 === 0 || this._firstActive){

                //更新房间寻路缓存
                ErrorHelper.catchError(()=>superMove.deletePathInRoom(room.name))
            }

            if(interval % 31 === 0 || this._firstActive){

                //更新房间信息
                ErrorHelper.catchError(()=>room.updateRoomInfo())



                if(room.storage && room.storage.store.getFreeCapacity() <= 0) console.log(`${room.name} storage is full`)
            }
         })

    }
    tickEnd(): void {
        const service = Container.get(TaskServiceProxy)

        Object.values(Game.rooms).forEach(room => {
            if(!room) return
            const interval = Game.time + room.hashCode()

            //处理spawn队列
            ErrorHelper.catchError(()=> service.spawnTaskService.handleSpawn(room)  ,room.name)

        })

        this._firstActive = false;
    }
    run(room: Room): void {
        if(!room) return

        const service = Container.get(TaskServiceProxy)
        const interval = Game.time + room.hashCode()

        //炮塔
        ErrorHelper.catchError(()=>service.towerTaskService.run(room))

        if(interval % 3 === 0 || this._firstActive){

            //link互传
            ErrorHelper.catchError(()=>service.transportTaskService.runTransformLink(room))

            //房间运营策略
            if(room.memory.roomLevel == 'low') roomLevelStrategy.lowLevel(room)
            else if(room.memory.roomLevel == 'middle') roomLevelStrategy.middleLevel(room)
            else roomLevelStrategy.middleLevel(room)


        }
    }

}



