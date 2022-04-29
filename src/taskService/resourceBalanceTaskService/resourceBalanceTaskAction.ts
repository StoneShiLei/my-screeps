import { BaseRegName, BaseTaskAction } from "taskService/baseTaskAction";
import { SpawnTaskNameEntity } from "taskService/spawnTaskService/spawnTaskNameEntity";
import { TaskHelper } from "taskService/taskHelper";
import { TransportTaskNameEntity } from "taskService/transportTaskService/transportTaskNameEntity";
import { Container, Singleton } from "typescript-ioc";
import Utils from "utils/utils";
import { ResourceBalanceTaskNameEntity } from "./resourceBalanceTaskNameEntity";
import { ResourceBalanceTaskService } from "./resourceBalanceTaskService";

export type ResourceBalanceActionName = 'balanceTerminalResource'
export type ResourceBalanceRegName = BaseRegName | 'registerBalanceTerminalResource'

@Singleton
export class ResourceBalanceTaskAction extends BaseTaskAction {

    registerBalanceTerminalResource(creep:Creep){
        creep.room._balancingTerminalResource = true;
    }

    balanceTerminalResource(creep:Creep){
        const terminal = creep.room.terminal;
        const storage = creep.room.storage;
        if(!terminal || !storage) {
            creep.popTopTask()
            return
        }
        const balanceService = Container.get(ResourceBalanceTaskService)
        const needBalance = balanceService._resourceBalanceCache[creep.room.name]
        const resourceTypes = _.sortByOrder(_.keys(needBalance),t => terminal.store[t as ResourceConstant],"asc")

        while(resourceTypes.head()){
            const type = resourceTypes.head() as ResourceConstant
            const resCont = balanceService.RES_BALANCE_ROOM[type] || balanceService.RES_HOLD_ROOM[type]

            if((terminal.store[type] || 0) != resCont && storage.store[type] && terminal.store.getFreeCapacity(type) > 0 ||
            (terminal.store[type] || 0) > resCont && storage.store.getFreeCapacity(type) > 0) break

            delete needBalance[resourceTypes.shift() as ResourceConstant]
        }

        if(creep._balanceTerminalResource > 5) {
            creep.popTopTask()
            return
        }

        creep._balanceTerminalResource = (creep._balanceTerminalResource || 0) + 1

        const resType = resourceTypes.head() as ResourceConstant

        if(resType && creep.ticksToLive && creep.ticksToLive > 30 && Utils.getResourceTypeList(creep.store).length == 0){
            const resCont = (balanceService.RES_BALANCE_ROOM[resType] || balanceService.RES_HOLD_ROOM[resType]) - (terminal.store[resType] || 0)
            const ops = {
                resourceType:resType,
                resourceCount:resCont > 0 ? resCont : -resCont
            }
            let fromTo = [storage,terminal]
            if(resCont < 0) fromTo = fromTo.reverse()

            const tasks = [
                TaskHelper.genTaskWithTarget(fromTo[1],new TransportTaskNameEntity("fillResource"),ops),
                TaskHelper.genTaskWithTarget(fromTo[0],new TransportTaskNameEntity("transportResource"),ops)
            ]
            if(resType.length == 1 && Math.abs(resCont) <= creep.store.getFreeCapacity(resType)) creep.popTopTask()

            creep.addTask(tasks)
            creep.doWorkWithTopTask()
        }
        else{
            creep.popTopTask()
        }
    }
}
