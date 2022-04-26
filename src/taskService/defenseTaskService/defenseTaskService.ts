import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Container, Inject, Singleton } from "typescript-ioc";
import { DefenseTaskNameEntity } from "./defenseTaskNameEntity";
import { DefenseTaskAction } from "./defenseTaskAction";
import { AutoPlanManager } from "manager/autoPlanManager/autoPlanManager";
import { FlagManager } from "manager/flagManager/flagManager";
import { TaskServiceProxy } from "taskService";
import { SourceTaskNameEntity } from "taskService/sourceTaskService/sourceTaskNameEntity";
import Utils from "utils/utils";

@Singleton
export class DefenseTaskService extends BaseTaskService{

    @Inject
    actions!: DefenseTaskAction;

    checkSafeMode(room:Room){
        let hostileCnt = room.find(FIND_HOSTILE_CREEPS,{filter:e => e.owner.username != "Invader" && e.body.filter(e=>e.type==HEAL && e.boost).length >= 5 }).length;
        if(!hostileCnt)return;

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

    checkNeedDefense(room:Room){
        const flag = room.flags("defense")?.head()
        if(flag) return
        const hostiles = room.find(FIND_HOSTILE_CREEPS,{filter:e => e.owner.username != "Invader"})
        if(!hostiles.length) return

        const healCount = hostiles.map(e => e.body.filter(e => e.type == HEAL && e.boost && (e.boost == "LHO2" || e.boost == "XLHO2")).length).reduce((a,b)=>a+b,0)
        if(room.level == 8 && healCount >= 25 || (room.level == 8 && healCount >= 12)){
            room.randomPosition().createFlag(`defense_${room.name}`)
        }
    }
}
