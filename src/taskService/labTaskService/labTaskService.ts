import { BaseTaskAction } from "taskService/baseTaskAction";
import { BaseTaskService } from "taskService/baseTaskService";
import { TaskHelper } from "taskService/taskHelper";
import { Container, Inject, Singleton } from "typescript-ioc";
import { LabTaskNameEntity } from "./labTaskNameEntity";
import { LabTaskAction } from "./labTaskAction";
import { AutoPlanManager } from "manager/autoPlanManager/autoPlanManager";
import { FlagManager } from "manager/flagManager/flagManager";
import { TaskServiceProxy } from "taskService";
import { SourceTaskNameEntity } from "taskService/sourceTaskService/sourceTaskNameEntity";
import Utils from "utils/utils";

@Singleton
export class LabTaskService extends BaseTaskService{

    @Inject
    actions!: LabTaskAction;

    LAB_REACTIONS:{[key:string]:[string,string]};

    LAB_REACTIONS_KEYS:string[] = ["G","ZK","UL","GH","LH","OH","GH2O","LHO2","LO","KO","KH","ZO","GO","UO","UH","ZH","UHO2","KH2O","ZHO2","UH2O","KHO2","LH2O","GHO2","ZH2O","XUHO2","XZHO2","XLHO2","XUH2O","XKHO2","XKH2O","XLH2O","XGH2O","XGHO2","XZH2O"]

    FIGHT_BOOST_RES_MAP = {[MOVE]:"fatigue",[TOUGH]:"damage",[HEAL]:"heal",[RANGED_ATTACK]:"rangedAttack",[ATTACK]:"attack",[WORK]:"dismantle"}

    BOOST_RES_HOLD:{[key:string]:number} = {
        "G":6000,
        "LH":9000,
        "GH":18000,
        "KH":9000,
        "KO":9000,
        "LO":12000,
        "GH2O":15000,
        "LH2O":15000,
        "LHO2":9000,
        "UH2O":15000,
        "UHO2":15000,
        "KH2O":9000,
        "ZHO2":9000,
        "GHO2":9000,
        "XLHO2":60000,
        "XGHO2":30000,
        "XZHO2":36000,
        "XZH2O":30000,
        "XUH2O":36000,
        "XKHO2":72000,
    }

    BOOST_RES:{[key:string]:string[]}

    BOOST_KEYS:string[]

    constructor(){
        super()

        this.LAB_REACTIONS = {}
        for(let a in REACTIONS){
            for(let b in REACTIONS[a]){
                if(!this.LAB_REACTIONS[REACTIONS[a][b]]){
                    this.LAB_REACTIONS[REACTIONS[a][b]] = [a,b]
                }
            }
        }

        this.BOOST_RES = {}
        type BoostsType = {[part: string]: { [boost: string]: { [action: string]: number } } };
        _.values<BoostsType>(BOOSTS).forEach(boost => {
            for(let resType in boost){
                for(let action in boost[resType] || []){
                    this.BOOST_RES[action] = this.BOOST_RES[action] || []
                    this.BOOST_RES[action].push(resType)
                }
            }
        })
        for(let action in this.BOOST_RES){
            this.BOOST_RES[action] = this.BOOST_RES[action].sort((a,b)=>a.length-b.length)
        }

        delete this.BOOST_RES.rangedMassAttack
        delete this.BOOST_RES.rangedHeal
        delete this.BOOST_RES.repair

        this.BOOST_KEYS = _.keys(this.BOOST_RES)
    }

    labRun(room:Room){
        if(!room.storage || !room.my || !room.storage.my) return;

        room.memory.serviceDataMap.labTaskService = room.memory.serviceDataMap.labTaskService || {}
        room.memory.serviceDataMap.labTaskService[STRUCTURE_LAB] = room.memory.serviceDataMap.labTaskService[STRUCTURE_LAB] || {}

        if(!this.checkLabs(room)) return;

        const map = room.memory.serviceDataMap.labTaskService
        const data = map[STRUCTURE_LAB]

        //todo
    }

    checkLabs(room:Room):boolean{
        if(!room.my) return false

        const map = room.memory.serviceDataMap.labTaskService || (room.memory.serviceDataMap.labTaskService = {})
        const data = map[STRUCTURE_LAB] || {}

        data.centerLabs = data.centerLabs || []
        data.otherLabs = data.otherLabs || []

        const historyCount = data.centerLabs.length + data.otherLabs.length
        const labCount = (data.centerLabs.concat(data.otherLabs)).filter(id => Game.getObjectById(id)).length

        const labs = _.sortByOrder(room.get<StructureLab[]>("lab").filter(s => s.isActive()),s => s.id,"asc")

        if(labs.length >= 3 && labCount != labs.length || historyCount != labCount){
            data.labTasks = []
            let centerLabs:[StructureLab | undefined,StructureLab | undefined,StructureLab[]] = [undefined,undefined,[]] //[labA,labB,Cnt]

            for(let i=0;i<labs.length;i++){
                let labA = labs[i]
                for(let j=i+1;j<labs.length;j++){
                    let labB = labs[j]
                    let otherLabs:StructureLab[] = []
                    if(labA.pos.isNearTo(labB)){
                        labs.forEach(labC =>{
                            if(labC != labA && labC != labB && labA.pos.inRangeTo(labC,2) && labB.pos.inRangeTo(labC,2)){
                                otherLabs.push(labC)
                            }
                        })
                    }
                    if(otherLabs.length > (centerLabs[2]?.length  || 0)){
                        centerLabs = [labA,labB,otherLabs]
                    }
                }
            }
            if(centerLabs[0] && centerLabs[1]){
                data.centerLabs = [centerLabs[0].id,centerLabs[1].id]
                data.otherLabs = centerLabs[2].map(l => l.id)
            }
            else{
                data.centerLabs = []
                data.otherLabs = []
            }
        }
        if(labCount >= 3){
            if(!data.unboostContainer || !Game.getObjectById(data.unboostContainer)){
                data.unboostContainer = undefined
                let container = this.checkUnboostContainer(room,data.centerLabs)
                if(container) data.unboostContainer = container.id
            }
        }

        map[STRUCTURE_LAB] = data
        room.memory.serviceDataMap.labTaskService = map
        return data.centerLabs.length == 2 && data.otherLabs.length != 0
    }

    checkUnboostContainer(room:Room,centerLabs:string[]):StructureContainer | undefined{
        const labs = centerLabs.map(id => Game.getObjectById<StructureLab>(id) as StructureLab)
        if(labs.length != 2 || !labs[0].pos.isNearTo(labs[1])) return undefined;

        for(let container of room.get<StructureContainer[]>("container")){
            let count = 0
            for(let lab of labs){
                if(lab.pos.isNearTo(container)) count+= 1
            }
            if(count == 2) return container
        }

        let x = labs[0].pos.x
        let y = labs[0].pos.y
        for(let i=-1;i<=1;i++){
            for(let j=-1;j<=1;j++){
                if(i || j){
                    let pos = new RoomPosition(x+i,y+j,room.name)
                    if(pos.isNearTo(labs[1]) && pos.walkable()){
                        if(pos.lookFor(LOOK_CONSTRUCTION_SITES).length == 0) pos.createConstructionSite(STRUCTURE_CONTAINER)
                        return undefined
                    }
                }
            }
        }
        return undefined
    }
}
