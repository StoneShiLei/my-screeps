import { BaseManager } from "manager/BaseManager";
import { Container, Singleton } from "typescript-ioc";
import { superMove } from 'modules/superMove'
import { ErrorHelper } from "utils/erroHelper";
import { TaskServiceProxy } from "taskService";
import { roomLevelStrategy } from "./roomLevelStrategy";

@Singleton
export class RoomManager extends BaseManager{

    private _firstActive:boolean = true;
    private _spawnQueue:SpawnTask[] | undefined = []

    tickStart(): void {
        Object.values(Game.rooms).forEach(room => {
            const interval = Game.time + room.hashCode()

            if(interval % 301 === 0 || this._firstActive){

                //更新房间寻路缓存
                ErrorHelper.catchError(()=>superMove.deletePathInRoom(room.name),room.name)
            }

            if(interval % 31 === 0 || this._firstActive){

                //更新房间信息
                ErrorHelper.catchError(()=>room.updateRoomInfo(),room.name)
                if(room.storage && room.storage.my && room.storage.store.getFreeCapacity() <= 0) console.log(`${room.name} storage is full`)
            }

         })

    }
    tickEnd(): void {
        const service = Container.get(TaskServiceProxy)

        //claim
        ErrorHelper.catchError(()=>service.claimTaskService.claimRun())

        this._firstActive = false;
    }
    run(room: Room): void {
        if(!room.my) return;

        const service = Container.get(TaskServiceProxy)

        //炮塔
        ErrorHelper.catchError(()=>service.towerTaskService.towerRun(room),room.name)

        //link互传
        ErrorHelper.catchError(()=>service.transportTaskService.transformLinkRun(room),room.name)

        //房间运营策略
        if(room.memory.roomLevel == 'low') ErrorHelper.catchError(()=>roomLevelStrategy.lowLevel(room),room.name)
        else if(room.memory.roomLevel == 'middle') ErrorHelper.catchError(()=>roomLevelStrategy.middleLevel(room),room.name)
        else ErrorHelper.catchError(()=>roomLevelStrategy.highLevel(room),room.name)

        //外矿
        if(!room.flags("stopRemote")?.length) ErrorHelper.catchError(()=>service.sourceTaskService.outterHarvestRun(room),room.name)

        //资源平衡
        ErrorHelper.catchError(()=>service.resourceBalanceTaskService.resourceBalanceRun(room),room.name)


        //处理一些临时的信息
        if(room._spawnQueue?.length) this._spawnQueue = _.sortByOrder(room._spawnQueue,s => s.priority,'desc')
        const spawnName = this._spawnQueue?.map(task => `权重：${task.priority},角色：${task.role},工作地点：${task.tasks.length ? task.tasks.last().roomName : room.name}`)
        spawnName?.map((log,index) => room.visual.text(log, 1, 3 + index, { align: 'left', opacity: 0.5 }))

        //处理spawn队列
        ErrorHelper.catchError(()=> service.spawnTaskService.handleSpawn(room) ,room.name)
    }
}



