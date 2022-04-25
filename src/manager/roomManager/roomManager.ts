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
            const interval = Game.time + room.hashCode()

            //处理spawn队列
            ErrorHelper.catchError(()=> service.spawnTaskService.handleSpawn(room)  ,room.name)

        })

        this._firstActive = false;
    }
    run(room: Room): void {


        if(!room.my) return;

        const service = Container.get(TaskServiceProxy)
        const interval = Game.time + room.hashCode()

        //炮塔
        ErrorHelper.catchError(()=>service.towerTaskService.towerRun(room))

        if(interval % 6 === 0){
            //外矿
            ErrorHelper.catchError(()=>service.sourceTaskService.outterHarvestRun(room))
        }

        if(interval % 3 === 0 || this._firstActive){

            //link互传
            ErrorHelper.catchError(()=>service.transportTaskService.runTransformLink(room))

            //房间运营策略
            if(room.memory.roomLevel == 'low') roomLevelStrategy.lowLevel(room)
            else if(room.memory.roomLevel == 'middle') roomLevelStrategy.middleLevel(room)
            else roomLevelStrategy.middleLevel(room)



            let hostileCnt = room.find(FIND_HOSTILE_CREEPS,{filter:e => e.owner.username != "Invader" && e.body.filter(e=>e.type==HEAL && e.boost).length >= 5 }).length;
            if(!hostileCnt)return;
            // room.controller.pos.createFlag("raL1_W19N21_crossShard_114514")
            let MyRuinCnt = room.find(FIND_RUINS,{filter:e=>
                    e.structure.structureType!=STRUCTURE_ROAD
                    &&e.structure.structureType!=STRUCTURE_CONTAINER
                    &&e.structure.structureType!=STRUCTURE_RAMPART
                    &&e.structure.structureType!=STRUCTURE_EXTRACTOR
                    &&e.structure.structureType!=STRUCTURE_LINK
                    && (e.structure as OwnedStructure).owner&&(e.structure as OwnedStructure).owner?.username==room.controller?.owner?.username}).length
            if(!MyRuinCnt)return;
            room.controller?.activateSafeMode()
        }
    }

}



