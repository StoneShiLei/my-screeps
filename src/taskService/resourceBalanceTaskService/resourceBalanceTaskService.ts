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

    RES_BALANCE_ROOM:{[key:string]:number}
    RES_HOLD_ROOM:{[key:string]:number}
    _resourceBalanceCache:{[roomNmae:string]:{[type in ResourceConstant]?:number}} = {}

    constructor(){
        super();

        const obj:{[key:string]:number} = {};
        ["O","L","H","X","K","Z","U","GH2O","LH2O","GH","LH","ZHO2", "KH2O", "GHO2", "UHO2","UH2O", "XLHO2", "XGHO2", "XZHO2", "XZH2O", "XUH2O", "XKHO2"].forEach(e=>obj[e] = 3000);

        obj[RESOURCE_ENERGY] = 50000
        obj[RESOURCE_POWER] = 3000
        obj[RESOURCE_BATTERY] = 300
        obj[RESOURCE_GHODIUM] = 3000
        obj[RESOURCE_OPS] = 3000
        obj[RESOURCE_SILICON] = 3000
        obj[RESOURCE_BIOMASS] = 3000
        obj[RESOURCE_METAL] = 3000
        obj[RESOURCE_MIST] = 3000
        this.RES_BALANCE_ROOM = obj

        let obj2:{[key:string]:number} = {};
        RESOURCES_ALL.forEach(e=>{
            obj2[e] = 3000
        })
        this.RES_HOLD_ROOM = obj2
    }

    resourceBalanceRun(room:Room){
        const interval = Game.time + room.hashCode();
        if(interval % 10 != 0) return

        if(!room.storage || !room.storage.my || !room.terminal || !room.terminal.my) return

        if(!this._resourceBalanceCache[room.name] || interval % 30 ==0) this.update(room)

        if(!room._balancingTerminalResource && _.keys(this._resourceBalanceCache[room.name]).length > 0){
            const traner = room.creeps("transporter").filter(e => e.isIdle() && e.storeIsEmpty() && e.ticksToLive && e.ticksToLive > 90).head()
            traner?.addTask(TaskHelper.genTaskWithTarget(room.terminal,new ResourceBalanceTaskNameEntity("balanceTerminalResource"),undefined,
            new ResourceBalanceTaskNameEntity(undefined,"registerBalanceTerminalResource")))
        }

    }

    update(room:Room){
        const needBalance:{[key in ResourceConstant]?:number} = this._resourceBalanceCache[room.name] = {}
        const terminal = room.terminal;
        const storage = room.storage;
        if(!terminal || !storage) return

        RESOURCES_ALL.forEach(type =>{
            const resCont = this.RES_BALANCE_ROOM[type] || this.RES_HOLD_ROOM[type]
            if((terminal.store[type] || 0) != resCont && storage.store[type] && terminal.store.getFreeCapacity(type) > 0 ||
            (terminal.store[type] || 0) > resCont && storage.store.getFreeCapacity(type) > 0) {
                needBalance[type] = 1
            }
        })
        this._resourceBalanceCache[room.name] = needBalance
    }
}
